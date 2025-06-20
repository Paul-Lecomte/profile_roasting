// Result page
"use client";
import React, { useState } from 'react';

export default function ResultPage() {
    const [username, setUsername] = useState('');

    React.useEffect(() => {
        // Retrieve the username from local storage
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    return (
        <div>
            <h1>Result Page</h1>
            {username ? (
                <p>Your username is: {username}</p>
            ) : (
                <p>No username found. Please submit a username.</p>
            )}
        </div>
    );
}