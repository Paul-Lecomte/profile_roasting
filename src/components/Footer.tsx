import React from 'react';

const Footer = () => {
    return (
        <footer className="w-full bg-white/90 border-t border-gray-100 shadow-sm py-2 flex flex-col items-center justify-center gap-1">
            <span className="text-gray-400 text-xs">
                © {new Date().getFullYear()} Slushie &middot;{' '}
            </span>
        </footer>
    );
};

export default Footer;