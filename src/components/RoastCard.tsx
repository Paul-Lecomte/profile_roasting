import React, { useEffect, useState } from "react";
import { FastAverageColor } from "fast-average-color";

function getRarity(hp: number): string {
    if (hp >= 90) return "legendary";
    if (hp >= 70) return "epic";
    if (hp >= 50) return "rare";
    if (hp >= 30) return "uncommon";
    return "common";
}

function getRarityColor(rarity: string): string {
    switch (rarity) {
        case "legendary": return "#FFD700";
        case "epic": return "#A259FF";
        case "rare": return "#38BDF8";
        case "uncommon": return "#34D399";
        default: return "#D1D5DB";
    }
}

type RoastCardData = {
    username: string;
    handle: string;
    followers: number;
    following: number;
    avatarUrl?: string;
    bannerUrl?: string | null;
    category?: string;
    hp?: number;
    rarity?: string;
    ability?: string;
    abilityDesc?: string;
    attack?: string;
    attackDesc?: string;
    weakness?: string;
    bonuses?: string;
    resistance?: string;
    platform?: 'github' | 'twitter';
};

type RoastCardProps = {
    onLoaded?: () => void;
};

const clean = (str?: string) => str?.replace(/^\*+\s*/, "") ?? "";

export default function RoastCard({ onLoaded }: RoastCardProps) {
    const [data, setData] = useState<RoastCardData | null>(null);
    const [bannerStyle, setBannerStyle] = useState<React.CSSProperties | undefined>(undefined);

    useEffect(() => {
        const githubProfileRaw = localStorage.getItem("githubUserProfile");
        const roastCardRaw = localStorage.getItem("roastCard");
        if (!githubProfileRaw || !roastCardRaw) return;

        const profile = JSON.parse(githubProfileRaw);
        const roastCard = JSON.parse(roastCardRaw);
        const platform = (localStorage.getItem('platform') as 'github' | 'twitter') || 'github';
        const twitterExtendedRaw = localStorage.getItem('twitterExtended');
        const twitterExtended = twitterExtendedRaw ? JSON.parse(twitterExtendedRaw) : null;

        setData({
            username: clean(roastCard.name) || profile.login,
            handle: profile.login,
            followers: profile.followers,
            following: profile.following,
            avatarUrl: profile.avatar_url,
            bannerUrl: twitterExtended?.bannerUrl ?? null,
            category: clean(roastCard.title),
            hp: Math.min(Math.ceil(profile.followers /200), 100),
            rarity: getRarity(Math.min(Math.ceil(profile.followers / 150), 100)),
            ability: clean(roastCard.ability),
            abilityDesc: clean(roastCard.description),
            attack: clean(roastCard.attack),
            attackDesc: clean(roastCard.specialMove),
            weakness: clean(roastCard.weakness),
            bonuses: profile.most_used_language,
            resistance: clean(roastCard.resistance),
            platform,
        });
        if (onLoaded) onLoaded();
    }, [onLoaded]);

    useEffect(() => {
        if (data) {
            if (!data.bannerUrl && data.avatarUrl) {
                const img = new window.Image();
                img.crossOrigin = "Anonymous";
                img.src = data.avatarUrl;
                img.onload = () => {
                    const fac = new FastAverageColor();
                    fac.getColorAsync(img).then((color) => {
                        const gradient = `linear-gradient(135deg, ${color.hex} 0%, #e0f7fa 100%)`;
                        setBannerStyle({ background: gradient, backgroundPosition: "center" });
                    }).catch(() => {
                        setBannerStyle({ background: "#e0f7fa", backgroundPosition: "center" });
                    });
                };
            } else if (data.bannerUrl) {
                setBannerStyle({ backgroundImage: `url(${data.bannerUrl})`, backgroundPosition: "center" });
            } else {
                setBannerStyle(undefined);
            }
        }
    }, [data]);

    if (!data) {
        return (
            <span className="text-gray-400 italic block text-center">
                Votre carte roast apparaîtra ici bientôt…
            </span>
        );
    }

    return (
        <div
            className="roast-card-responsive rounded-3xl border-4 border-teal-300 bg-gray-100 mx-auto shadow-lg p-0"
        >
            <div className="flex flex-col h-full">
                {/* Header badges */}
                <div className="flex justify-between items-center px-3 pt-3 sm:px-4 sm:pt-4">
                    <span className="bg-cyan-200 text-black font-bold py-1 px-3 sm:px-4 rounded-full text-xs sm:text-sm shadow">
                        {data.category}
                    </span>
                    <span className="bg-red-300 text-black font-bold py-1 px-3 sm:px-4 rounded-full text-xs sm:text-sm shadow">
                        HP {data.hp}
                    </span>
                </div>
                {/* Banner + Avatar */}
                <div className="relative mt-2 mb-2 flex flex-col items-center">
                    <div className="w-[90%] h-16 sm:h-25 bg-cover rounded-2xl" style={bannerStyle} />
                    <div className="absolute top-6 sm:top-10 left-1/2 -translate-x-1/2">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-4 border-gray-300 bg-cover flex items-center justify-center overflow-hidden">
                            {data.avatarUrl ? (
                                <img
                                    src={data.avatarUrl}
                                    alt="avatar"
                                    className="w-full h-full object-cover rounded-full"
                                />
                            ) : null}
                        </div>
                    </div>
                </div>
                {/* Followers / Following */}
                <div className="flex justify-between px-4 sm:px-8 mt-8 text-gray-400 text-xs sm:text-base items-center">
                    <span>{data.followers} followers</span>
                    <span
                        className="font-bold py-1 px-3 sm:px-4 rounded-full text-xs sm:text-sm shadow"
                        style={{
                            background: getRarityColor(data.rarity ?? "common"),
                            color: data.rarity === "legendary" ? "#000" : "#fff",
                            border: "2px solid #fff",
                        }}
                        >
                        {data.rarity}
                    </span>
                    <span>{data.following} following</span>
                </div>
                {/* Username */}
                <div className="px-3 sm:px-6 mt-4">
                    <h2 className="text-lg sm:text-2xl font-bold text-black break-words">{data.username}</h2>
                    <p className="text-gray-500 text-sm sm:text-lg mt-[-4px] break-all">@{data.handle}</p>
                </div>
                <hr className="my-2 sm:my-4 border-gray-300" />
                {/* Ability */}
                <div className="px-3 sm:px-6">
                    <h3 className="text-sm sm:text-lg font-bold text-gray-700 mb-1">
                        Ability : <span className="font-bold">{data.ability}</span>
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-base mb-2 sm:mb-4">{data.abilityDesc}</p>
                </div>
                <hr className="my-1 sm:my-2 border-gray-300" />
                {/* Attack */}
                <div className="px-3 sm:px-6">
                    <h3 className="text-sm sm:text-lg font-bold text-gray-700 mb-1">
                        Attack : <span className="font-bold">{data.attack}</span>
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-base mb-2 sm:mb-4">{data.attackDesc}</p>
                </div>
                <hr className="my-1 sm:my-2 border-gray-300" />
                {/* Bottom stats */}
                <div className="flex flex-row justify-between px-3  pb-3  gap-1 ">
                    <div className="flex flex-col items-center flex-1">
                        <span className="font-bold text-xs sm:text-lg text-gray-700">Weakness</span>
                        <span className="text-gray-600 text-xs sm:text-base">{data.weakness}</span>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                        <span className="font-bold text-xs sm:text-lg text-gray-700">Bonuses</span>
                        <span className="text-gray-600 text-xs sm:text-base">{data.bonuses}</span>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                        <span className="font-bold text-xs sm:text-lg text-gray-700">Resistance</span>
                        <span className="text-gray-600 text-xs sm:text-base">{data.resistance}</span>
                    </div>
                </div>
            </div>
            <style jsx global>{`
                .roast-card-responsive {
                    width: 100%;
                    max-width: 380px;
                    height: auto;
                    max-height: 120rem;
                }
                @media (min-width: 640px) {
                    .roast-card-responsive {
                        width: 100%;
                        max-width: 380px;
                        max-height: 120rem;
                    }
                }
            `}</style>
        </div>
    );
}