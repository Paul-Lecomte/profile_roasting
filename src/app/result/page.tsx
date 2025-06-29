"use client";
import React, { useState, useRef } from 'react';
import getGithubUserProfile from "@/lib/github";
import RoastCard from "@/components/RoastCard";
import html2canvas from "html2canvas";
import '../../styles/globals.css';

export default function ResultPage() {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true);
    const [showCard, setShowCard] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const fetchRoast = async () => {
            const storedUsername = localStorage.getItem('username');
            if (!storedUsername) {
                setLoading(false);
                return;
            }
            setUsername(storedUsername);

            const githubProfile = await getGithubUserProfile();
            if (!githubProfile) {
                setLoading(false);
                return;
            }
            localStorage.setItem('githubUserProfile', JSON.stringify(githubProfile));

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

    const handleSaveRoastCard = async () => {
        if (!cardRef.current) return;
        const canvas = await html2canvas(cardRef.current, { backgroundColor: null });
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'roast_card.png';
        link.click();
    };

    return (
        <div className="w-screen flex items-center h-screen justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
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
                                <div id="wifi-loader">
                                    <svg className="circle-outer" viewBox="0 0 86 86">
                                        <circle className="back" cx="43" cy="43" r="40"></circle>
                                        <circle className="front" cx="43" cy="43" r="40"></circle>
                                        <circle className="new" cx="43" cy="43" r="40"></circle>
                                    </svg>
                                    <svg className="circle-middle" viewBox="0 0 60 60">
                                        <circle className="back" cx="30" cy="30" r="27"></circle>
                                        <circle className="front" cx="30" cy="30" r="27"></circle>
                                    </svg>
                                    <svg className="circle-inner" viewBox="0 0 34 34">
                                        <circle className="back" cx="17" cy="17" r="14"></circle>
                                        <circle className="front" cx="17" cy="17" r="14"></circle>
                                    </svg>
                                    <div className="text" data-text="Loading"></div>
                                </div>
                            </div>
                        )}
                        {showCard && !loading && (
                            <div className="w-full flex flex-col items-center">
                                <div ref={cardRef} className="w-full">
                                    <RoastCard />
                                </div>
                                <button
                                    onClick={handleSaveRoastCard}
                                    className="mt-6 bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold py-2 px-6 rounded-lg shadow hover:from-indigo-600 hover:to-blue-600 transition text-lg flex items-center gap-2"
                                >
                                    <svg width="20" height="20" fill="currentColor" className="inline-block" viewBox="0 0 20 20">
                                        <path d="M13 7H7v6h6V7z" />
                                        <path fillRule="evenodd" d="M5 3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5zm8 4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h6z" clipRule="evenodd" />
                                    </svg>
                                    Save Roast Card
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}