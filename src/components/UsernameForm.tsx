// Username form component
"use client";
import React, { useState } from 'react';

export default function UsernameForm() {
    const [username, setUsername] = useState('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    };

    const handleSubmit = (event: React.FormEvent) => {
        if (!username || !username.length) {
            event.preventDefault();
            alert("Username cannot be empty");
            return;
        } else {
            event.preventDefault();
            alert(`Username submitted: ${username}`);
            // save the username to local storage
            localStorage.setItem('username', username);
            // reset the form
            setUsername('');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username:</label>
        <input
            type="text"
            id="username"
            value={username}
            onChange={handleChange}
            required
        />
        <button id="form" type="submit">Submit</button>
        </form>
    );
}