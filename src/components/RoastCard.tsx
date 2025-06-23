import React, { useEffect, useState } from "react";

type RoastCardData = {
    username: string;
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
    ressistance?: string;
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
            followers: githubProfile.followers,
            following: githubProfile.following,
            avatarUrl: githubProfile.avatar_url,
            category: clean(roastCard.title),
            hp: 100,
            ability: clean(roastCard.ability),
            abilityDesc: clean(roastCard.description),
            attack: clean(roastCard.attack),
            attackDesc: clean(roastCard.specialMove),
            weakness: clean(roastCard.weakness),
            bonuses: githubProfile.most_used_language,
            ressistance: clean(roastCard.ressistance),
        });
        if (onLoaded) onLoaded();
    }, [onLoaded]);

    if (!data) {
        return (
            <span className="text-gray-400 text-base italic">
                Your roast card will appear here soon…
            </span>
        );
    }

    return (
        <div className="rounded-3xl border-4 border-[#8fd3c7] bg-[#ece9e0] w-full max-w-[400px] mx-auto shadow-xl p-0 overflow-hidden">
            {/* Header badges */}
            <div className="flex justify-between items-center px-4 pt-4">
                <span className="bg-[#b6dde7] text-black font-bold px-4 py-1 rounded-full text-sm shadow-sm">
                    {data.category}
                </span>
                <span className="bg-[#f26a6a] text-black font-bold px-4 py-1 rounded-full text-sm shadow-sm">
                    HP {data.hp}
                </span>
            </div>
            {/* Banner + Avatar */}
            <div className="relative mt-2 mb-2 flex flex-col items-center">
                <div className="w-[90%] h-24 bg-[url('/checker.png')] bg-cover rounded-t-2xl rounded-b-2xl" />
                <div className="absolute top-10 left-1/2 -translate-x-1/2">
                    <div className="w-24 h-24 rounded-full border-4 border-[#d3d3d3] bg-[url('/checker.png')] bg-cover flex items-center justify-center overflow-hidden">
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
            <div className="flex justify-between px-8 mt-8 text-gray-400 text-base">
                <span>{data.followers} followers</span>
                <span>{data.following} following</span>
            </div>
            {/* Username */}
            <div className="px-6 mt-4">
                <h2 className="text-3xl font-bold text-black">{data.username}</h2>
                <p className="text-gray-500 text-lg -mt-1">@{data.username}</p>
            </div>
            {/* Divider */}
            <hr className="my-4 border-gray-300" />
            {/* Ability */}
            <div className="px-6">
                <h3 className="text-xl font-bold text-gray-700 mb-1">
                    Ability : <span className="font-bold">{data.ability}</span>
                </h3>
                <p className="text-gray-600 text-base mb-4">{data.abilityDesc}</p>
            </div>
            {/* Divider */}
            <hr className="my-2 border-gray-300" />
            {/* Attack */}
            <div className="px-6">
                <h3 className="text-xl font-bold text-gray-700 mb-1">
                    Attack : <span className="font-bold">{data.attack}</span>
                </h3>
                <p className="text-gray-600 text-base mb-4">{data.attackDesc}</p>
            </div>
            {/* Divider */}
            <hr className="my-2 border-gray-300" />
            {/* Bottom stats */}
            <div className="flex justify-between px-6 py-4">
                <div className="flex flex-col items-center">
                    <span className="font-bold text-lg text-gray-700">Weakness</span>
                    <span className="font-bold text-xl text-gray-800">{data.weakness}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="font-bold text-lg text-gray-700">Bonuses</span>
                    <span className="font-bold text-xl text-gray-800">{data.bonuses}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="font-bold text-lg text-gray-700">Resistance</span>
                    <span className="font-bold text-xl text-gray-800">{data.ressistance}</span>
                </div>
            </div>
        </div>
    );
}