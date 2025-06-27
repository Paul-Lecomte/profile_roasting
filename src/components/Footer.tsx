import React from 'react';

const Footer = () => {
    return (
        <footer className="w-full bg-white/90 border-t border-gray-100 shadow-sm py-2 flex flex-col items-center justify-center rounded-b-2xl gap-1">
            <span className="text-gray-400 text-xs">
                © {new Date().getFullYear()} Paul Lecomte &middot;{' '}
                <a
                    href="https://github.com/Paul-Lecomte"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-500 hover:underline font-medium"
                >
                    GitHub
                </a>
            </span>
        </footer>
    );
};

export default Footer;