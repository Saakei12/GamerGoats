import React from 'react';
import { Link } from 'react-router-dom';

const DISCORD_INVITE_URL = import.meta.env.VITE_DISCORD_INVITE_URL || 'https://discord.gg/nT2FCbCr9';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-zinc-900 bg-[#09090b] text-zinc-500 py-12 px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <Link to="/" className="inline-block group">
            <img
              src="/gamergoats-logo.png"
              alt="GamerGoats — Discover Your Next Game."
              className="h-12 sm:h-14 w-auto max-w-[280px] object-contain filter drop-shadow opacity-95 group-hover:opacity-100 transition-opacity"
            />
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-zinc-400">
          <Link to="/" className="hover:text-zinc-200 transition-colors">Discover</Link>
          <Link to="/categories" className="hover:text-zinc-200 transition-colors">Categories</Link>
          <Link to="/free-games" className="hover:text-zinc-200 transition-colors">Free Games</Link>
          <Link to="/search" className="hover:text-zinc-200 transition-colors">Search</Link>
          <Link to="/profile" className="hover:text-zinc-200 transition-colors">Profile & Saved</Link>

          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Join our Discord community"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-md shadow-[#5865F2]/25 hover:shadow-[#5865F2]/45 transition-all transform hover:-translate-y-0.5 active:scale-95 ml-0 sm:ml-2"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            <span>Join Our Discord</span>
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-600">
        <p>© {new Date().getFullYear()} GamerGoats. Less clutter. More games. Better discovery.</p>
        <p className="flex items-center gap-2">
          <span>Powered by FreeToGame, GamerPower & RAWG APIs</span>
        </p>
      </div>
    </footer>
  );
};

