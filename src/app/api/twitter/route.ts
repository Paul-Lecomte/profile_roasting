import { NextRequest, NextResponse } from "next/server";

// Custom Twitter (X) scraper without Nitter or official API
// Strategy:
// 1) Try fetching mobile pages directly with realistic headers (may return app shell).
// 2) Fallback to r.jina.ai proxy which returns readable text for JS-heavy pages.
// 3) Parse counts, avatar, banner, and extract recent posts and replies.
//    We fetch two views: profile timeline and with_replies timeline to separate posts/comments.

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

async function fetchText(url: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
  return res.text();
}

async function fetchReadable(url: string) {
  // r.jina.ai mirrors the raw text content of the page w/o JS
  const wrapped = `https://r.jina.ai/http://${url.replace(/^https?:\/\//, "")}`;
  const res = await fetch(wrapped, { next: { revalidate: 0 }, headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Readable fetch failed ${res.status}`);
  return res.text();
}

function normalizeCount(raw: string): number {
  if (!raw) return 0;
  const s = raw.trim().replace(/[,\s]/g, "");
  const m = s.match(/^(\d+(?:\.\d+)?)([kKmM]?)$/);
  if (!m) return parseInt(s, 10) || 0;
  const val = parseFloat(m[1]);
  const suf = m[2].toLowerCase();
  if (suf === "k") return Math.round(val * 1000);
  if (suf === "m") return Math.round(val * 1_000_000);
  return Math.round(val);
}

function extractCountsFromText(txt: string) {
  const followersMatch = txt.match(/([0-9][0-9\s,.kKmM]*)\s*(Followers|Abonnés|Seguidor(?:es)?|Seguidores|フォロワー|팔로워|粉丝|Follower|Anhänger|Seguaci|Seguidores)/i);
  const followingMatch = txt.match(/([0-9][0-9\s,.kKmM]*)\s*(Following|Abonnements|Siguiendo|Seguindo|フォロー中|팔로잉|关注|Gefolgt|In Seguito)/i);

  const followers = followersMatch ? normalizeCount(followersMatch[1].replace(/\s|&nbsp;/g, "")) : 0;
  const following = followingMatch ? normalizeCount(followingMatch[1].replace(/\s|&nbsp;/g, "")) : 0;
  return { followers, following };
}

function extractImageUrls(txt: string) {
  const avatarMatch = txt.match(/https?:\/\/pbs\.twimg\.com\/profile_images\/[^\s)"']+/i);
  const bannerMatch = txt.match(/https?:\/\/pbs\.twimg\.com\/profile_banners\/\d+\/\d+\/\d+x\d+/i);

  if (!bannerMatch) console.log("No banner found. First 1000 chars:", txt.slice(0, 1000));
  return {
    avatarUrl: avatarMatch?.[0] || null,
    bannerUrl: bannerMatch?.[0] || null,
  };
}

function parseTweetsFromReadable(txt: string, handle: string, limit: number) {
  // Heuristic parser for r.jina.ai text output of a Twitter profile page.
  // We consider a "header" line with the handle and a dot separator like "@jack ·".
  const lines = txt.split(/\r?\n/).map((l) => l.trim());
  const items: string[] = [];
  let current: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isHeader = new RegExp(`@${handle}\\s*[·|•]`).test(line);
    const isDivider = line === "" || /^Tweets( & replies)?$/i.test(line) || /^Media$/i.test(line) || /^Likes$/i.test(line);
    if (isHeader) {
      if (current.length) {
        const text = finalizeTweet(current);
        if (text) items.push(text);
        current = [];
        if (items.length >= limit) break;
      }
      continue; // skip header line
    }
    if (isDivider) {
      if (current.length) {
        const text = finalizeTweet(current);
        if (text) items.push(text);
        current = [];
        if (items.length >= limit) break;
      }
      continue;
    }
    // Accumulate probable tweet text lines, skip obvious UI labels
    if (!/^(Follow|Message|More|Translate post|View|See more|Show more replies)$/i.test(line)) {
      current.push(line);
    }
  }
  if (current.length && items.length < limit) {
    const text = finalizeTweet(current);
    if (text) items.push(text);
  }
  return items.slice(0, limit);
}

function finalizeTweet(parts: string[]) {
  // Join, collapse spaces, clip to 280 chars
  let t = parts.join(" ");
  t = t.replace(/\s{2,}/g, " ").trim();
  if (!t) return "";
  if (t.length > 280) t = t.slice(0, 277) + "...";
  return t;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const handle = (searchParams.get("handle") || "").replace(/^@/, "").trim();
  if (!handle) return NextResponse.json({ error: "missing handle" }, { status: 400 });

  // Defaults and fallbacks
  let followers = 0;
  let following = 0;
  let avatarUrl: string | null = null;
  let bannerUrl: string | null = null;
  let posts: string[] = [];
  let comments: string[] = [];

  try {
    // Prefer mobile pages via r.jina.ai to avoid JS app shell
    const profileReadable = await fetchReadable(`https://mobile.twitter.com/${encodeURIComponent(handle)}?lang=en`);
    const repliesReadable = await fetchReadable(`https://mobile.twitter.com/${encodeURIComponent(handle)}/with_replies?lang=en`);

    const counts = extractCountsFromText(profileReadable);
    followers = counts.followers;
    following = counts.following;

    const imgs = extractImageUrls(profileReadable);
    avatarUrl = imgs.avatarUrl;
    bannerUrl = imgs.bannerUrl;

    posts = parseTweetsFromReadable(profileReadable, handle, 15);
    comments = parseTweetsFromReadable(repliesReadable, handle, 15);

    // If avatar is still missing, fall back to unavatar
    if (!avatarUrl) {
      avatarUrl = `https://unavatar.io/twitter/${encodeURIComponent(handle)}`;
    }

    return NextResponse.json({
      handle,
      followers,
      following,
      bannerUrl,
      avatarUrl,
      last15Posts: posts,
      last15Comments: comments,
    });
  } catch (e: any) {
    // Final fallback: still return minimal data with unavatar, so frontend can proceed.
    return NextResponse.json(
      {
        handle,
        followers: 0,
        following: 0,
        bannerUrl: null,
        avatarUrl: `https://unavatar.io/twitter/${encodeURIComponent(handle)}`,
        last15Posts: [],
        last15Comments: [],
        warning: e?.message || "scrape failed",
      },
      { status: 200 }
    );
  }
}
