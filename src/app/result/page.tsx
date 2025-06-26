"use client";
import React, { useState } from 'react';
import getGithubUserProfile from "@/lib/github";
import RoastCard from "@/components/RoastCard";

export default function ResultPage() {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true);
    const [showCard, setShowCard] = useState(false);

    React.useEffect(() => {
        const fetchRoast = async () => {
            const storedUsername = localStorage.getItem('username');
            if (!storedUsername) {
                setLoading(false);
                return;
            }
            setUsername(storedUsername);

            // Récupérer le profil GitHub
            const githubProfile = await getGithubUserProfile();
            if (!githubProfile) {
                setLoading(false);
                return;
            }
            localStorage.setItem('githubUserProfile', JSON.stringify(githubProfile));

            // Appeler l'API pour générer le roast
            const res = await fetch('/api/generate-roast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(githubProfile),
            });

            if (res.status === 200) {
                const roastCard = await res.json();
                localStorage.setItem('roastCard', JSON.stringify(roastCard));
                setShowCard(true);
            }
            setLoading(false);
        };

        fetchRoast();
    }, []);

    React.useEffect(() => {
        return () => {
            localStorage.removeItem('githubUserProfile');
            localStorage.removeItem('roastCard');
            localStorage.removeItem('username');
        };
    }, []);

    return (
        <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="w-full max-w-2xl bg-white/90 rounded-2xl shadow-xl p-8 flex flex-col gap-6 border border-gray-100 mx-4">
                <div className="flex flex-col items-center gap-2">
                    <div className="bg-gray-100 rounded-full p-3 mb-2 shadow-sm">
                        {/* ...SVG... */}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 text-center">Your GitHub Roast Card</h2>
                </div>
                <div className="flex flex-col items-center gap-2">
                    {username ? (
                        <p className="text-gray-700 text-lg">Your username is: <span className="font-semibold">{username}</span></p>
                    ) : (
                        <p className="text-gray-500 text-base">No username found. Please submit a username.</p>
                    )}
                </div>
                <div className="min-h-[180px] flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-indigo-200 mt-2">
                    <div className="w-full flex items-center justify-center relative">
                        {loading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 bg-opacity-80 z-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
                                <span className="text-gray-400 text-base italic">Card is loading</span>
                            </div>
                        )}
                        {showCard && !loading && <RoastCard />}
                    </div>
                </div>
            </div>
        </div>
    );
}