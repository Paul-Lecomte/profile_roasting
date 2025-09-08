"use client";
import React, { useState, useRef } from 'react';
import getGithubUserProfile from "@/lib/github";
import getTwitterUserProfile from "@/lib/twitter";
import RoastCard from "@/components/RoastCard";
import * as htmlToImage from 'html-to-image';
import '../../styles/globals.css';

// Helpers pour base64 UTF-8 safe
function encodePayload(obj: any) {
    return btoa(encodeURIComponent(JSON.stringify(obj)).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
    ));
}
function decodePayload(str: string) {
    return JSON.parse(decodeURIComponent(Array.prototype.map.call(atob(str), (c: string) =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join('')));
}

export default function ResultPage() {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true);
    const [showCard, setShowCard] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const encoded = params.get('data');

        if (encoded) {
            try {
                const { roastCard, githubUserProfile } = decodePayload(encoded);
                localStorage.setItem("roastCard", JSON.stringify(roastCard));
                localStorage.setItem("githubUserProfile", JSON.stringify(githubUserProfile));
                setUsername(roastCard?.githubUsername || roastCard?.name || "Unknown");
                setShowCard(true);
            } catch (err) {
                console.error("Error decoding roast card:", err);
            }
            setLoading(false);
            return;
        }

        // Cas standard : génération normale
        const fetchRoast = async () => {
            try {
                const storedUsername = localStorage.getItem('username');
                const platform = localStorage.getItem('platform') || 'github';
                const roastType = localStorage.getItem('roastType') || 'mild';
                if (!storedUsername) {
                    setLoading(false);
                    return;
                }
                setUsername(storedUsername);

                const profile = platform === 'twitter'
                    ? await getTwitterUserProfile()
                    : await getGithubUserProfile();

                if (!profile) {
                    setLoading(false);
                    return;
                }
                localStorage.setItem('githubUserProfile', JSON.stringify(profile));

                const res = await fetch('/api/generate-roast', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ profile, roastType, source: platform, twitterExtended: localStorage.getItem('twitterExtended') ? JSON.parse(localStorage.getItem('twitterExtended')!) : null }),
                });

                if (res.status === 429) {
                    setError("Too many requests. Please try again in 1 minute.");
                    setLoading(false);
                    return;
                }

                if (res.status === 200) {
                    const roastCard = await res.json();
                    localStorage.setItem('roastCard', JSON.stringify(roastCard));
                    setShowCard(true);
                }
                setLoading(false);
            } catch (error) {
                setError("Error while generating the roast card.");
                setLoading(false);
            }
        };

        fetchRoast();
    }, []);

    React.useEffect(() => {
        return () => {
            localStorage.removeItem('githubUserProfile');
            localStorage.removeItem('roastCard');
            localStorage.removeItem('username');
            localStorage.removeItem('twitterExtended');
        };
    }, []);

    const handleSaveRoastCard = async () => {
        await document.fonts.ready;
        if (!cardRef.current) return;
        const dataUrl = await htmlToImage.toPng(cardRef.current, { skipFonts: true });
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'roast_card.png';
        link.click();
    };

    const handleShareUrl = async () => {
        const roastRaw = localStorage.getItem('roastCard');
        const profileRaw = localStorage.getItem('githubUserProfile');
        if (!roastRaw || !profileRaw) {
            alert("No roast card to share.");
            return;
        }

        const payload = { roastCard: JSON.parse(roastRaw), githubUserProfile: JSON.parse(profileRaw) };
        const encoded = encodePayload(payload);
        const shareUrl = `${window.location.origin}/result?data=${encoded}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    url: shareUrl,
                });
            } catch (err) {
                alert("An error occured.");
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                alert("Link copied !");
            } catch {
                alert("Impossible to copy the link.");
            }
        }
    };

    return (
        <div className="w-screen min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="w-full max-w-2xl bg-white/90 rounded-2xl shadow-xl p-4 sm:p-8 flex flex-col gap-6 border border-gray-100 mx-2 sm:mx-4">
                <div className="flex flex-col items-center gap-2">
                    <div className="bg-gray-100 rounded-full p-3 mb-2 shadow-sm">
                        {/* ...SVG... */}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 text-center">Your GitHub or X Roast Card</h2>
                </div>
                <div className="flex flex-col items-center gap-2">
                    {username ? (
                        <p className="text-gray-700 text-lg">Your username is: <span className="font-semibold">{username}</span></p>
                    ) : (
                        <p className="text-gray-500 text-base">No username found. Please submit a username.</p>
                    )}
                </div>
                <div className="min-h-[180px] h-auto flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-indigo-200 mt-2">
                    <div className="w-full items-center justify-center relative">
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
                        {error && (
                            <div className="text-red-600 text-center font-semibold mb-4">
                                {error}
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
                                    Save Roast Card
                                </button>
                                <button
                                    onClick={handleShareUrl}
                                    className="mt-3 bg-gradient-to-r from-teal-500 to-green-500 text-white font-semibold py-2 px-6 rounded-lg shadow hover:from-teal-600 hover:to-green-600 transition text-lg flex items-center gap-2"
                                >
                                    Partager le lien
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}