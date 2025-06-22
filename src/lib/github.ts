// src/lib/github.ts
type Repo = {
    name: string;
    stargazers_count: number;
    language: string;
};

type UserProfile = {
    login: string;
    name: string;
    bio: string;
    avatar_url: string;
    public_repos: number;
    followers: number;
    following: number;
    created_at: string;
    top_repos: { name: string; stars: number; language: string }[];
    most_used_language: string;
};

export default async function getGithubUserProfile() {
    const username = localStorage.getItem('username');
    if (!username) throw new Error('Username not found in local storage');

    const userRes = await fetch(`https://api.github.com/users/${username}`);
    if (!userRes.ok) throw new Error('Error fetching user profile');
    const user = await userRes.json();

    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
    if (!reposRes.ok) throw new Error('Error fetching user repos');
    const repos: Repo[] = await reposRes.json();

    const top_repos = repos
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 2)
        .map(r => ({
            name: r.name,
            stars: r.stargazers_count,
            language: r.language || "N/A"
        }));

    const langCount: Record<string, number> = {};
    repos.forEach(r => {
        if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1;
    });
    const most_used_language = Object.entries(langCount)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    const profile: UserProfile = {
        login: user.login,
        name: user.name,
        bio: user.bio,
        avatar_url: user.avatar_url,
        public_repos: user.public_repos,
        followers: user.followers,
        following: user.following,
        created_at: user.created_at,
        top_repos,
        most_used_language
    };

    localStorage.setItem('githubUserProfile', JSON.stringify(profile));

    // Appel à la route API pour générer la carte
    const roastRes = await fetch('/api/generate-roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
    });
    if (!roastRes.ok) throw new Error('Error generating roast card');
    const roastCard = await roastRes.json();
    localStorage.setItem('roastCard', JSON.stringify(roastCard));

    return profile;
}