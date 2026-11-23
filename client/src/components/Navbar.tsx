import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Grid, Gift, Search, User, SlidersHorizontal, Menu, X, Bookmark, ShieldCheck } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import { SearchModal } from './SearchModal';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { userTags, setIsOnboardingOpen, bookmarks } = usePreferences();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Keyboard shortcut listener (Cmd+K, Ctrl+K, or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      } else if (e.key === '/' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { label: 'Discover', path: '/', icon: Compass },
    { label: 'Categories', path: '/categories', icon: Grid },
    { label: 'Paid & AAA', path: '/paid-games', icon: ShieldCheck },
    { label: 'Free Games', path: '/free-games', icon: Gift },
    { label: 'Search', path: '/search', icon: Search },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.06] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          {/* Official Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group py-1">
            <div className="relative flex items-center justify-center">
              <img
                src="/gamergoats-icon.png"
                alt="GamerGoats Emblem"
                className="h-10 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-108 filter drop-shadow-[0_0_14px_rgba(16,185,129,0.35)]"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-lg font-black tracking-tight text-white group-hover:text-zinc-100 transition-colors italic">
                  Gamer<span className="text-[#00e676] font-extrabold ml-0.5">Goats</span>
                </span>
              </div>
              <span className="text-[8.5px] tracking-[0.25em] text-zinc-400 uppercase -mt-1 hidden sm:block font-semibold">
                Discover Your Next Game
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links with Framer Motion Active Tab Pill */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/60 border border-white/[0.06] p-1 rounded-full backdrop-blur-md">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors ${
                    active ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute inset-0 bg-zinc-800/90 border border-white/10 rounded-full shadow-inner"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className={`relative z-10 w-3.5 h-3.5 ${active ? 'text-emerald-400' : 'text-zinc-400'}`} />
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right CTAs (3 Prominent Action Buttons) */}
          <div className="flex items-center gap-3">
            {/* Quick Spotlight Search trigger */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="hidden lg:flex items-center gap-2.5 h-10 px-4 rounded-full text-sm font-medium bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 hover:border-emerald-500/40 transition-all cursor-pointer shadow-sm group"
              title="Quick Search (Ctrl+K or /)"
            >
              <Search className="w-4 h-4 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
              <span>Search...</span>
              <kbd className="text-[11px] bg-zinc-950 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800 font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Personalize / Preferences Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOnboardingOpen(true)}
              className="flex items-center gap-2.5 h-10 px-4 rounded-full text-sm font-semibold bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-white/10 hover:border-emerald-500/40 transition-all cursor-pointer group shadow-sm"
              title="Configure recommendation preferences"
            >
              <SlidersHorizontal className="w-4 h-4 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
              <span className="hidden sm:inline">Preferences</span>
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                {userTags.length}
              </span>
            </motion.button>

            {/* Bookmarks shortcut */}
            <Link
              to="/profile"
              className="hidden sm:flex relative items-center justify-center w-10 h-10 rounded-full text-zinc-300 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 hover:border-emerald-500/40 transition-all shadow-sm"
              title="Saved Bookmarks"
            >
              <Bookmark className="w-4.5 h-4.5" />
              {bookmarks.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              )}
            </Link>

            {/* Mobile hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 text-zinc-300 hover:text-white rounded-xl hover:bg-zinc-900 border border-transparent hover:border-white/10 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/[0.08] bg-[#09090b] px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    active
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-zinc-400'}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Spotlight Command Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
};
