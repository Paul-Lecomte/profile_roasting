import React, { useEffect, useState } from "react";

type RoastCardData = {
    username: string;
    githubUsername: string;
    followers: number;
    following: number;
    avatarUrl?: string;
    category?: string;
    hp?: number;
    ability?: string;
    abilityDesc?: string;
    attack?: string;
    attackDesc?: string;
    weakness?: string;
    bonuses?: string;
    resistance?: string;
};

type RoastCardProps = {
    onLoaded?: () => void;
};

const clean = (str?: string) => str?.replace(/^\*+\s*/, "") ?? "";

export default function RoastCard({ onLoaded }: RoastCardProps) {
    const [data, setData] = useState<RoastCardData | null>(null);

    useEffect(() => {
        const githubProfileRaw = localStorage.getItem("githubUserProfile");
        const roastCardRaw = localStorage.getItem("roastCard");
        if (!githubProfileRaw || !roastCardRaw) return;

        const githubProfile = JSON.parse(githubProfileRaw);
        const roastCard = JSON.parse(roastCardRaw);

        setData({
            username: clean(roastCard.name) || githubProfile.login,
            githubUsername: githubProfile.login,
            followers: githubProfile.followers,
            following: githubProfile.following,
            avatarUrl: githubProfile.avatar_url,
            category: clean(roastCard.title),
            hp: githubProfile.followers * 2 + githubProfile.following,
            ability: clean(roastCard.ability),
            abilityDesc: clean(roastCard.description),
            attack: clean(roastCard.attack),
            attackDesc: clean(roastCard.specialMove),
            weakness: clean(roastCard.weakness),
            bonuses: githubProfile.most_used_language,
            resistance: clean(roastCard.resistance),
        });
        if (onLoaded) onLoaded();
    }, [onLoaded]);

    if (!data) {
        return (
            <span style={{ color: "#9ca3af", fontStyle: "italic" }}>
                Your roast card will appear here soon…
            </span>
        );
    }

    return (
        <div
            style={{
                borderRadius: "1.5rem",
                border: "4px solid #8fd3c7",
                background: "#ece9e0",
                width: "100%",
                maxWidth: 500,
                margin: "0 auto",
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                padding: 0,
                overflow: "hidden",
            }}
        >
            {/* Header badges */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1rem 0 1rem" }}>
                <span style={{
                    background: "#b6dde7",
                    color: "#000",
                    fontWeight: "bold",
                    padding: "0.25rem 1rem",
                    borderRadius: "9999px",
                    fontSize: "0.875rem",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
                }}>
                    {data.category}
                </span>
                <span style={{
                    background: "#f26a6a",
                    color: "#000",
                    fontWeight: "bold",
                    padding: "0.25rem 1rem",
                    borderRadius: "9999px",
                    fontSize: "0.875rem",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
                }}>
                    HP {data.hp}
                </span>
            </div>
            {/* Banner + Avatar */}
            <div style={{ position: "relative", marginTop: 8, marginBottom: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                    width: "90%",
                    height: 96,
                    backgroundSize: "cover",
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    borderBottomLeftRadius: 16,
                    borderBottomRightRadius: 16,
                }} />
                <div style={{
                    position: "absolute",
                    top: 40,
                    left: "50%",
                    transform: "translateX(-50%)"
                }}>
                    <div style={{
                        width: 96,
                        height: 96,
                        borderRadius: "50%",
                        border: "4px solid #d3d3d3",
                        backgroundSize: "cover",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden"
                    }}>
                        {data.avatarUrl ? (
                            <img
                                src={data.avatarUrl}
                                alt="avatar"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    borderRadius: "50%"
                                }}
                            />
                        ) : null}
                    </div>
                </div>
            </div>
            {/* Followers / Following */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0 2rem",
                marginTop: 32,
                color: "#9ca3af",
                fontSize: "1rem"
            }}>
                <span>{data.followers} followers</span>
                <span>{data.following} following</span>
            </div>
            {/* Username */}
            <div style={{ padding: "0 1.5rem", marginTop: 16 }}>
                <h2 style={{ fontSize: "2rem", fontWeight: "bold", color: "#000" }}>{data.username}</h2>
                <p style={{ color: "#6b7280", fontSize: "1.125rem", marginTop: -4 }}>@{data.githubUsername}</p>
            </div>
            <hr style={{ margin: "1rem 0", borderColor: "#d1d5db" }} />
            {/* Ability */}
            <div style={{ padding: "0 1.5rem" }}>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "bold", color: "#374151", marginBottom: 4 }}>
                    Ability : <span style={{ fontWeight: "bold" }}>{data.ability}</span>
                </h3>
                <p style={{ color: "#4b5563", fontSize: "1rem", marginBottom: 16 }}>{data.abilityDesc}</p>
            </div>
            <hr style={{ margin: "0.5rem 0", borderColor: "#d1d5db" }} />
            {/* Attack */}
            <div style={{ padding: "0 1.5rem" }}>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "bold", color: "#374151", marginBottom: 4 }}>
                    Attack : <span style={{ fontWeight: "bold" }}>{data.attack}</span>
                </h3>
                <p style={{ color: "#4b5563", fontSize: "1rem", marginBottom: 16 }}>{data.attackDesc}</p>
            </div>
            <hr style={{ margin: "0.5rem 0", borderColor: "#d1d5db" }} />
            {/* Bottom stats */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 1.5rem 1rem 1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontWeight: "bold", fontSize: "1.125rem", color: "#374151" }}>Weakness</span>
                    <span style={{ color: "#4b5563", fontSize: "1rem" }}>{data.weakness}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontWeight: "bold", fontSize: "1.125rem", color: "#374151" }}>Bonuses</span>
                    <span style={{ color: "#4b5563", fontSize: "1rem" }}>{data.bonuses}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontWeight: "bold", fontSize: "1.125rem", color: "#374151" }}>Resistance</span>
                    <span style={{ color: "#4b5563", fontSize: "1rem" }}>{data.resistance}</span>
                </div>
            </div>
        </div>
    );
}