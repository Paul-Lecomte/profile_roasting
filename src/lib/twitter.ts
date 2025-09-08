// src/lib/twitter.ts
// Minimal Twitter (X) profile adapter using only public info without API keys
// We reuse the same UserProfile shape expected by the app to minimize UI changes.

export type UserProfile = {
  login: string;
  name: string;
  bio: string;
  avatar_url: string;
  public_repos: number; // not used for twitter, keep 0
  followers: number;
  following: number;
  created_at: string;
  top_repos: { name: string; stars: number; language: string }[]; // unused
  most_used_language: string; // we will set to "Tweets"
};

export default async function getTwitterUserProfile() {
  const username = localStorage.getItem('username');
  if (!username) throw new Error('Username not found in local storage');

  const handle = username.replace(/^@/, '').trim();

  // Call our internal scraper API to gather public data
  let avatar_url = `https://unavatar.io/twitter/${encodeURIComponent(handle)}`;
  let followers = 0;
  let following = 0;
  let bannerUrl: string | undefined = undefined;
  try {
    const res = await fetch(`/api/twitter?handle=${encodeURIComponent(handle)}`);
    if (res.ok) {
      const data = await res.json();
      followers = data.followers ?? 0;
      following = data.following ?? 0;
      avatar_url = data.avatarUrl || avatar_url;
      bannerUrl = data.bannerUrl || undefined;
      // Store extended twitter data for the API prompt to consume later
      localStorage.setItem('twitterExtended', JSON.stringify({
        handle,
        followers,
        following,
        avatarUrl: avatar_url,
        bannerUrl,
        last15Posts: data.last15Posts || [],
        last15Comments: data.last15Comments || [],
      }));
    }
  } catch {}

  const profile: UserProfile = {
    login: handle,
    name: handle,
    bio: "",
    avatar_url,
    public_repos: 0,
    followers,
    following,
    created_at: new Date().toISOString(),
    top_repos: [],
    most_used_language: "Tweets",
  };

  localStorage.setItem('githubUserProfile', JSON.stringify(profile));
  return profile;
}
