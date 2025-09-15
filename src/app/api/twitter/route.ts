import { NextRequest, NextResponse } from "next/server";

const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`Fetch HTML failed ${res.status}`);
  return res.text();
}

async function fetchReadable(url: string) {
  const wrapped = `https://r.jina.ai/http://${url.replace(/^https?:\/\//, "")}`;
  const res = await fetch(wrapped, {
    next: { revalidate: 0 },
    headers: { "User-Agent": UA },
  });
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
  const followersMatch = txt.match(
      /([0-9][0-9\s,.kKmM]*)\s*(Followers|Abonnés|Seguidor(?:es)?|Seguidores|フォロワー|팔로워|粉丝|Follower|Anhänger|Seguaci|Seguidores)/i
  );
  const followingMatch = txt.match(
      /([0-9][0-9\s,.kKmM]*)\s*(Following|Abonnements|Siguiendo|Seguindo|フォロー中|팔로잉|关注|Gefolgt|In Seguito)/i
  );

  const followers = followersMatch
      ? normalizeCount(followersMatch[1].replace(/\s|&nbsp;/g, ""))
      : 0;
  const following = followingMatch
      ? normalizeCount(followingMatch[1].replace(/\s|&nbsp;/g, ""))
      : 0;
  return { followers, following };
}

async function getBannerUrl(handle: string): Promise<string | null> {
  // 1. Try Unavatar
  const unavatarBanner = `https://unavatar.io/x/${encodeURIComponent(
      handle
  )}/banner`;
  try {
    const res = await fetch(unavatarBanner, { method: "HEAD" });
    if (res.ok && res.headers.get("content-type")?.startsWith("image")) {
      return unavatarBanner;
    }
  } catch {}

  // 2. Try Nitter (fallback)
  try {
    const html = await fetchHtml(`https://nitter.net/${encodeURIComponent(handle)}`);
    const match = html.match(
        /<img[^>]+src="(https:\/\/pbs\.twimg\.com\/profile_banners\/[^"]+)"/i
    );
    if (match) return match[1];
  } catch (e) {
    console.error("Nitter fetch failed", e);
  }

  return null;
}

async function extractImageUrls(txt: string, handle?: string) {
  const avatarMatch = txt.match(
      /https?:\/\/pbs\.twimg\.com\/profile_images\/[^\s)"']+/i
  );

  let bannerUrl: string | null = null;

  // Inline banner (rare but try anyway)
  const imgBannerMatch = txt.match(
      /https:\/\/pbs\.twimg\.com\/profile_banners\/[^\s)"']+/i
  );
  if (imgBannerMatch) bannerUrl = imgBannerMatch[0];

  // Fallback Unavatar/Nitter
  if (!bannerUrl && handle) {
    bannerUrl = await getBannerUrl(handle);
  }

  if (!bannerUrl)
    console.log("No banner found. First 1000 chars:", txt.slice(0, 1000));

  return {
    avatarUrl: avatarMatch?.[0] || null,
    bannerUrl,
  };
}

function parseTweetsFromReadable(txt: string, handle: string, limit: number) {
  const lines = txt.split(/\r?\n/).map((l) => l.trim());
  const items: string[] = [];
  let current: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isHeader = new RegExp(`@${handle}\\s*[·|•]`).test(line);
    const isDivider =
        line === "" ||
        /^Tweets( & replies)?$/i.test(line) ||
        /^Media$/i.test(line) ||
        /^Likes$/i.test(line);
    if (isHeader) {
      if (current.length) {
        const text = finalizeTweet(current);
        if (text) items.push(text);
        current = [];
        if (items.length >= limit) break;
      }
      continue;
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
    if (
        !/^(Follow|Message|More|Translate post|View|See more|Show more replies)$/i.test(
            line
        )
    ) {
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
  let t = parts.join(" ");
  t = t.replace(/\s{2,}/g, " ").trim();
  if (!t) return "";
  if (t.length > 280) t = t.slice(0, 277) + "...";
  return t;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const handle = (searchParams.get("handle") || "")
      .replace(/^@/, "")
      .trim();
  if (!handle)
    return NextResponse.json({ error: "missing handle" }, { status: 400 });

  let followers = 0;
  let following = 0;
  let avatarUrl: string | null = null;
  let bannerUrl: string | null = null;
  let posts: string[] = [];
  let comments: string[] = [];

  try {
    const profileReadable = await fetchReadable(
        `https://mobile.x.com/${encodeURIComponent(handle)}?lang=en`
    );
    const repliesReadable = await fetchReadable(
        `https://mobile.x.com/${encodeURIComponent(handle)}/with_replies?lang=en`
    );

    const counts = extractCountsFromText(profileReadable);
    followers = counts.followers;
    following = counts.following;

    const imgs = await extractImageUrls(profileReadable, handle);
    avatarUrl = imgs.avatarUrl;
    bannerUrl = imgs.bannerUrl;

    posts = parseTweetsFromReadable(profileReadable, handle, 15);
    comments = parseTweetsFromReadable(repliesReadable, handle, 15);

    if (!avatarUrl) {
      avatarUrl = `https://unavatar.io/x/${encodeURIComponent(handle)}`;
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
    return NextResponse.json(
        {
          handle,
          followers: 0,
          following: 0,
          bannerUrl: null,
          avatarUrl: `https://unavatar.io/x/${encodeURIComponent(handle)}`,
          last15Posts: [],
          last15Comments: [],
          warning: e?.message || "scrape failed",
        },
        { status: 200 }
    );
  }
}