// src/components/UsernameForm.tsx
"use client";
import React, { useState } from "react";

export default function UsernameForm() {
    const [username, setUsername] = useState("");
    const [roastType, setRoastType] = useState("mild");
    const [platform, setPlatform] = useState<'github' | 'twitter'>("github");

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    };

    const handleRoastTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRoastType(event.target.value);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!username.trim()) {
            alert("Username cannot be empty");
            return;
        }

        // Validation based on selected platform
        if (platform === 'github') {
            try {
                const res = await fetch(`https://api.github.com/users/${username.trim()}`);
                if (!res.ok) {
                    alert("This GitHub username doesn't exist.");
                    return;
                }
            } catch (e) {
                alert("Error while verifying the GitHub username.");
                return;
            }
        } else {
            // For X (Twitter), we cannot reliably validate without API keys. Do a simple handle sanity check.
            const handle = username.replace(/^@/, '').trim();
            if (!handle || /\s/.test(handle)) {
                alert("Please enter a valid X (Twitter) handle (e.g., @jack or jack).");
                return;
            }
        }

        localStorage.removeItem("githubUserProfile");
        localStorage.removeItem("roastCard");
        localStorage.removeItem("username");
        localStorage.removeItem("roastType");
        localStorage.removeItem("platform");
        localStorage.setItem("username", username);
        localStorage.setItem("roastType", roastType);
        localStorage.setItem("platform", platform);
        setUsername("");
        window.location.href = "/result";
    };

    return (
        <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white/90 rounded-2xl shadow-xl p-8 flex flex-col gap-6 border border-gray-100 mx-4"
            >
                <div className="flex flex-col items-center gap-2">
                    <div className="bg-gray-100 rounded-full p-3 mb-2 shadow-sm">
                        <svg width="32" height="32" fill="currentColor" className="text-gray-700" viewBox="0 0 24 24">
                            <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.74-1.56-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.41-5.27 5.7.42.36.79 1.08.79 2.18 0 1.58-.01 2.85-.01 3.24 0 .31.21.68.8.56C20.71 21.39 24 17.08 24 12c0-6.27-5.23-11.5-12-11.5z"/>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 text-center">Generate your GitHub or X Roast Card</h2>
                    <p className="text-gray-500 text-sm">Choose a platform and enter your handle to get started</p>
                </div>
                {/* Platform selection */}
                <div className="flex flex-col gap-2">
                    <label className="text-base font-medium text-gray-700">Platform</label>
                    <div className="flex gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="platform" value="github" checked={platform === 'github'} onChange={() => setPlatform('github')} />
                            <span className="text-gray-500">GitHub</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="platform" value="twitter" checked={platform === 'twitter'} onChange={() => setPlatform('twitter')} />
                            <span className="text-gray-500">X (Twitter)</span>
                        </label>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="username" className="text-base font-medium text-gray-700">
                        {platform === 'github' ? 'GitHub Username' : 'X (Twitter) Handle'}
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={handleChange}
                        required
                        autoFocus
                        className="px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition placeholder-gray-400 bg-gray-50 text-black"
                        placeholder={platform === 'github' ? 'e.g. octocat' : 'e.g. @jack or jack'}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-base font-medium text-gray-700">
                        Roast Level
                    </label>
                    <div className="flex justify-around items-center gap-4 py-2">
                        <label className="flex flex-col items-center cursor-pointer">
                            <input
                                className="sr-only"
                                type="radio"
                                name="roastType"
                                value="light"
                                checked={roastType === "light"}
                                onChange={handleRoastTypeChange}
                            />
                            <span
                                className={`flex flex-col items-center justify-center w-25 h-20 rounded-xl border-2 transition
                                ${roastType === "light"
                                ? "border-blue-600 bg-blue-50 shadow-lg"
                                : "border-gray-300 bg-white hover:border-blue-400"}
                            `}
                            >
                            <span className="flex flex-row gap-0.5 text-2xl mb-2" role="img" aria-label="Light roast">
                                <span>🔥</span>
                            </span>
                            <span className={`text-xs font-semibold ${roastType === "light" ? "text-blue-600" : "text-gray-500"}`}>Light</span>
                        </span>
                        </label>
                        <label className="flex flex-col items-center cursor-pointer">
                            <input
                                className="sr-only"
                                type="radio"
                                name="roastType"
                                value="mild"
                                checked={roastType === "mild"}
                                onChange={handleRoastTypeChange}
                            />
                            <span
                                className={`flex flex-col items-center justify-center w-25 h-20 rounded-xl border-2 transition
                                    ${roastType === "mild"
                                    ? "border-blue-600 bg-blue-50 shadow-lg"
                                    : "border-gray-300 bg-white hover:border-blue-400"}
                                `}
                            >
                                <span className="flex flex-row gap-0.5 text-2xl mb-1" role="img" aria-label="Mild roast">
                                    <span>🔥</span>
                                    <span>🔥</span>
                                </span>
                                <span className={`text-xs font-semibold ${roastType === "mild" ? "text-blue-600" : "text-gray-500"}`}>Mild</span>
                            </span>
                        </label>
                        <label className="flex flex-col items-center cursor-pointer">
                            <input
                                className="sr-only"
                                type="radio"
                                name="roastType"
                                value="spicy"
                                checked={roastType === "spicy"}
                                onChange={handleRoastTypeChange}
                            />
                            <span
                                className={`flex flex-col items-center justify-center w-25 h-20 rounded-xl border-2 transition
                                    ${roastType === "spicy"
                                    ? "border-blue-600 bg-blue-50 shadow-lg"
                                    : "border-gray-300 bg-white hover:border-blue-400"}
                                `}
                            >
                                <span className="flex flex-row gap-0.5 text-2xl mb-1" role="img" aria-label="Spicy roast">
                                    <span>🔥</span>
                                    <span>🔥</span>
                                    <span>🔥</span>
                                </span>
                                <span className={`text-xs font-semibold ${roastType === "spicy" ? "text-blue-600" : "text-gray-500"}`}>Spicy</span>
                            </span>
                        </label>
                    </div>
                </div>
                <button
                    type="submit"
                    className="mt-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold py-2 rounded-lg shadow hover:from-indigo-600 hover:to-blue-600 transition text-lg"
                >
                    Generate my card
                </button>
            </form>
        </div>
    );
}