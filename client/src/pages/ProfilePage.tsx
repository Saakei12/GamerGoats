import React from 'react';
import { motion } from 'framer-motion';
import { User, Bookmark, SlidersHorizontal, Clock, Trash2, Monitor, Sparkles } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import { GameCard } from '../components/GameCard';

export const ProfilePage: React.FC = () => {
  const {
    bookmarks,
    userTags,
    setIsOnboardingOpen,
    searchHistory,
    clearSearchHistory,
    hardwareTier
  } = usePreferences();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6 sm:p-8 rounded-3xl bg-[#121215] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-emerald-400 shadow-inner">
            <User className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Player Profile
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Anonymous Session
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-md">
              Your preferences and bookmarks are stored securely in local browser storage.
            </p>
          </div>
        </div>

        {/* Hardware & Preferences quick info */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="px-4 py-2.5 rounded-2xl bg-zinc-900/90 border border-white/5 text-xs">
            <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">Hardware Target</span>
            <span className="text-zinc-200 font-semibold flex items-center gap-1.5 mt-0.5">
              <Monitor className="w-3.5 h-3.5 text-emerald-400" />
              {hardwareTier}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsOnboardingOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-bold shadow-xl transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Edit Preferences
          </motion.button>
        </div>
      </motion.div>

      {/* Active Taste Profile */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Your Recommendation Tags ({userTags.length})
          </h2>
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="text-xs text-emerald-400 hover:underline cursor-pointer font-medium"
          >
            Modify Tags
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {userTags.length === 0 ? (
            <p className="text-xs text-zinc-500">No preference tags selected yet.</p>
          ) : (
            userTags.map((tag) => (
              <span
                key={tag}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-900 text-zinc-200 border border-white/5"
              >
                {tag}
              </span>
            ))
          )}
        </div>
      </section>

      {/* Saved / Bookmarked Games */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-emerald-400" />
            Saved Games ({bookmarks.length})
          </h2>
          {bookmarks.length > 0 && (
            <span className="text-xs text-zinc-500 font-medium">Ready to play or purchase</span>
          )}
        </div>

        {bookmarks.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-zinc-900/20 border border-dashed border-white/10 space-y-2">
            <p className="text-zinc-200 text-sm font-semibold">No saved games yet.</p>
            <p className="text-xs text-zinc-500">Click the bookmark icon on any game card to save it for later.</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {bookmarks.map((game) => (
              <motion.div key={game.id} variants={itemVariants}>
                <GameCard game={game} showMatchScore={true} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-white/[0.06]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              Recent Searches
            </h2>
            <button
              onClick={clearSearchHistory}
              className="text-xs text-zinc-500 hover:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {searchHistory.map((query) => (
              <span
                key={query}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-zinc-900 text-zinc-300 border border-white/5"
              >
                {query}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
