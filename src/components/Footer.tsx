import React from 'react';

const Footer = () => {
    return (
        <footer className="w-full bg-white/90 border-t border-gray-100 shadow-sm py-2 flex items-center justify-center rounded-b-2xl">
            <span className="text-gray-500 text-sm">
                Powered by <span className="font-semibold text-indigo-500">Next.js</span> &amp; <span className="font-semibold text-blue-500">TypeScript</span>
            </span>
        </footer>
    );
};

export default Footer;