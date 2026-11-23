import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, RotateCcw, Sliders, CheckCircle2 } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';

const TAG_CATEGORIES: Record<string, string[]> = {
  GENRE: [
    'Action', 'Adventure', 'Racing', 'Horror', 'RPG',
    'Strategy', 'Simulation', 'Sports', 'Shooter'
  ],
  GAMEPLAY: [
    'Open World', 'Survival', 'Story Rich', 'Stealth',
    'Exploration', 'Sandbox'
  ],
  MULTIPLAYER: [
    'Single Player', 'Co-op', 'PvP', 'Online Multiplayer'
  ],
  VISUAL_STYLE: [
    'Realistic', 'Pixel Art', 'Anime', 'Stylized'
  ],
  PERFORMANCE: [
    'Low-End PC', 'Mid-Range PC', 'High-End PC'
  ]
};

export const OnboardingModal: React.FC = () => {
  const { userTags, toggleTag, clearTags, isOnboardingOpen, setIsOnboardingOpen } = usePreferences();

  return (
    <AnimatePresence>
      {isOnboardingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOnboardingOpen(false)}
            className="fixed inset-0 bg-black/85 backdrop-blur-xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-2xl max-h-[90vh] bg-[#121215] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col shadow-2xl z-10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-5 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                    Adaptive Recommendation Engine
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-400" />
                  Tailor Your Gaming DNA
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-lg leading-relaxed">
                  Select the genres, mechanics, and hardware targets you love. GamerGoats personalizes your discovery feed and calculates custom match scores.
                </p>
              </div>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOnboardingOpen(false)}
                className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800/80 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Scrollable Categories List */}
            <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1 custom-scroll">
              {Object.entries(TAG_CATEGORIES).map(([category, tags]) => (
                <div key={category} className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {category.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {tags.filter(t => userTags.includes(t)).length} of {tags.length} selected
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                      const selected = userTags.includes(tag);
                      return (
                        <motion.button
                          key={tag}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => toggleTag(tag)}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            selected
                              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                              : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-white/5 hover:border-white/20'
                          }`}
                        >
                          {selected ? (
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                          )}
                          <span>{tag}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <strong className="text-white font-bold">{userTags.length}</strong> active preferences
                </span>
                {userTags.length > 0 && (
                  <button
                    onClick={clearTags}
                    className="text-[11px] text-zinc-500 hover:text-red-400 flex items-center gap-1 ml-2 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset all
                  </button>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOnboardingOpen(false)}
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-bold tracking-wide transition-all shadow-xl cursor-pointer"
              >
                Apply & Discover Feed
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
