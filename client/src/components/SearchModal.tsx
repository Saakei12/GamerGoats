import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Sparkles, ArrowRight, CornerDownLeft } from 'lucide-react';
import type { Game } from '../types/game';
import { searchGames } from '../services/api';
import { usePreferences } from '../context/PreferencesContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { userTags, searchHistory, addSearchHistory } = usePreferences();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Game[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchGames({ q: query, limit: 6, tags: userTags });
        setResults(res.games);
        setSelectedIndex(0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, userTags]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      if (results[selectedIndex]) {
        addSearchHistory(query);
        onClose();
        navigate(`/game/${results[selectedIndex].id}`);
      } else if (query.trim()) {
        addSearchHistory(query);
        onClose();
        navigate(`/search?q=${encodeURIComponent(query)}`);
      }
    }
  };

  const handleSelectGame = (game: Game) => {
    addSearchHistory(query);
    onClose();
    navigate(`/game/${game.id}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-[#121215] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col"
            onKeyDown={handleKeyDown}
          >
            {/* Input Bar */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.08]">
              <Search className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search games, mechanics, genres, studios..."
                className="w-full bg-transparent text-white text-base focus:outline-none placeholder:text-zinc-500 font-medium"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 rounded-full text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-md font-mono">
                ESC
              </kbd>
            </div>

            {/* Results / Suggestions Container */}
            <div className="max-h-[380px] overflow-y-auto p-3 space-y-1">
              {loading ? (
                <div className="p-6 text-center text-xs text-zinc-500">Searching game catalogue...</div>
              ) : results.length > 0 ? (
                results.map((game, i) => {
                  const isSelected = i === selectedIndex;
                  return (
                    <div
                      key={game.id}
                      onClick={() => handleSelectGame(game)}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={`flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-zinc-800/90 border border-emerald-500/30 shadow-md'
                          : 'hover:bg-zinc-900/60 border border-transparent'
                      }`}
                    >
                      <img
                        src={game.thumbnail || game.background_image}
                        alt={game.title}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-zinc-950"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white truncate">{game.title}</h4>
                          {game.matchScore ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 flex-shrink-0">
                              <Sparkles className="w-2.5 h-2.5" />
                              {game.matchScore}%
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-zinc-400 truncate mt-0.5">
                          {(game.genres || []).join(' • ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {game.is_free ? (
                          <span className="text-[11px] font-semibold text-blue-400">Free</span>
                        ) : (
                          <span className="text-[11px] text-zinc-500">PC</span>
                        )}
                        <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-emerald-400 translate-x-0.5' : 'text-zinc-600'} transition-transform`} />
                      </div>
                    </div>
                  );
                })
              ) : query.trim() ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No games found for "{query}". Press Enter to view full search results.
                </div>
              ) : (
                /* Recent searches & Quick shortcuts */
                <div className="p-4 space-y-4">
                  {searchHistory.length > 0 && (
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block mb-2">
                        Recent Searches
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {searchHistory.map((term) => (
                          <button
                            key={term}
                            onClick={() => setQuery(term)}
                            className="px-3 py-1 rounded-full text-xs bg-zinc-900 text-zinc-300 hover:text-white border border-white/5 transition-colors cursor-pointer"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block mb-2">
                      Popular Collections
                    </span>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {['Cyberpunk', 'Elden Ring', 'Baldurs Gate', 'Overwatch', 'Hades'].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setQuery(tag)}
                          className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/5 transition-colors cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footnote */}
            <div className="px-5 py-3 border-t border-white/[0.06] bg-zinc-950/60 flex items-center justify-between text-[11px] text-zinc-500">
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px]">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px]">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <CornerDownLeft className="w-3 h-3 text-zinc-400" />
                to select
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

