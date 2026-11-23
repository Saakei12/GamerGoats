import React from 'react';
import { Link } from 'react-router-dom';

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

        <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-400">
          <Link to="/" className="hover:text-zinc-200 transition-colors">Discover</Link>
          <Link to="/categories" className="hover:text-zinc-200 transition-colors">Categories</Link>
          <Link to="/free-games" className="hover:text-zinc-200 transition-colors">Free Games</Link>
          <Link to="/search" className="hover:text-zinc-200 transition-colors">Search</Link>
          <Link to="/profile" className="hover:text-zinc-200 transition-colors">Profile & Saved</Link>
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

