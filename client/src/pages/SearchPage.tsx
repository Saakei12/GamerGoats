import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, Clock, ArrowUpDown, Sparkles, Check } from 'lucide-react';
import type { Game } from '../types/game';
import { searchGames } from '../services/api';
import { usePreferences } from '../context/PreferencesContext';
import { GameCard } from '../components/GameCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { SeoHead } from '../components/SeoHead';

const GENRES = [
  'All', 'Action', 'Adventure', 'RPG', 'Shooter', 'Strategy', 'Simulation', 'Racing', 'Horror', 'Survival'
];

const HARDWARE_TIERS = [
  'All', 'Low-End PC', 'Mid-Range PC', 'High-End PC'
];

const SORT_OPTIONS = [
  { label: 'Best Match (Relevance)', value: 'relevance' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Most Popular', value: 'popularity' },
  { label: 'Release Date', value: 'release_date' }
];

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { userTags, searchHistory, addSearchHistory } = usePreferences();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || 'All');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || 'All');
  const [freeFilter, setFreeFilter] = useState(searchParams.get('is_free') || 'all');
  const [hardwareFilter, setHardwareFilter] = useState(searchParams.get('hardware') || 'All');
  const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'relevance');
  const [displayLimit, setDisplayLimit] = useState(36);

  const [games, setGames] = useState<Game[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Perform search with debounce
  const executeSearch = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const isFreeParam = freeFilter === 'free' ? 'true' : freeFilter === 'paid' ? 'false' : '';
      const genreParam = selectedGenre === 'All' ? '' : selectedGenre;
      const tagParam = selectedTag === 'All' ? '' : selectedTag;
      const hardwareParam = hardwareFilter === 'All' ? '' : hardwareFilter;

      const res = await searchGames({
        q: query,
        genre: genreParam,
        tag: tagParam,
        is_free: isFreeParam,
        hardware: hardwareParam,
        sort: sortOption,
        limit: displayLimit,
        tags: userTags
      });

      setGames(res.games);
      setTotalCount(res.pagination.total);

      if (query.trim().length > 1) {
        addSearchHistory(query.trim());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [query, selectedGenre, selectedTag, freeFilter, hardwareFilter, sortOption, displayLimit, userTags, addSearchHistory]);

  useEffect(() => {
    const handler = setTimeout(() => {
      executeSearch();
    }, 200);

    return () => clearTimeout(handler);
  }, [executeSearch]);

  const clearFilters = () => {
    setQuery('');
    setSelectedGenre('All');
    setSelectedTag('All');
    setFreeFilter('all');
    setHardwareFilter('All');
    setSortOption('relevance');
    setDisplayLimit(36);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dynamic SEO Meta Tags & SearchAction JSON-LD */}
      <SeoHead
        title={query ? `Search Results for "${query}" | GamerGoats` : 'Browse All PC Games & Search Catalog | GamerGoats'}
        description="Search, filter and browse the full library of verified PC games on GamerGoats. Discover games by Metascore, system requirements, hardware specs, and price."
        keywords={['All PC Games', 'Game Search', 'PC Game Catalog', query, selectedGenre].filter(Boolean)}
      />

      {/* Search Header and Input */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
              Complete Catalog Index ({totalCount} Games)
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Search className="w-7 h-7 text-emerald-400" />
            Browse & Search All Games
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Discover every title across all genres, platforms, and price ranges with instant filtering.
          </p>
        </div>

        {/* Big Search Input with Ambient Glow */}
        <div className="relative w-full max-w-3xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, mechanics, developer, or genre..."
            className="w-full bg-[#121215] text-white pl-12 pr-10 py-4 rounded-2xl border border-white/10 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-sm placeholder:text-zinc-500 transition-all shadow-inner"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search History Chips */}
        {searchHistory.length > 0 && !query && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-zinc-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Recent:
            </span>
            {searchHistory.map((item) => (
              <motion.button
                whileTap={{ scale: 0.95 }}
                key={item}
                onClick={() => setQuery(item)}
                className="px-3 py-1 rounded-full bg-zinc-900 text-zinc-300 hover:text-white border border-white/5 transition-colors cursor-pointer"
              >
                {item}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Filter and Sorting Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#121215] border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <SlidersHorizontal className="w-4 h-4 text-emerald-400 mr-1" />

            {/* Genre Select */}
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 text-zinc-200 text-xs font-semibold border border-white/10 focus:outline-none cursor-pointer"
            >
              <option disabled>Genre</option>
              {GENRES.map((g) => (
                <option key={g} value={g}>{g === 'All' ? 'All Genres' : g}</option>
              ))}
            </select>

            {/* Free/Paid Filter */}
            <select
              value={freeFilter}
              onChange={(e) => setFreeFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 text-zinc-200 text-xs font-semibold border border-white/10 focus:outline-none cursor-pointer"
            >
              <option value="all">Free & Paid</option>
              <option value="free">Free / Giveaways Only</option>
              <option value="paid">Paid Titles Only</option>
            </select>

            {/* Hardware Tier */}
            <select
              value={hardwareFilter}
              onChange={(e) => setHardwareFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 text-zinc-200 text-xs font-semibold border border-white/10 focus:outline-none cursor-pointer"
            >
              <option disabled>Hardware Target</option>
              {HARDWARE_TIERS.map((h) => (
                <option key={h} value={h}>{h === 'All' ? 'All Hardware' : h}</option>
              ))}
            </select>
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 text-zinc-200 text-xs font-semibold border border-white/10 focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count & Reset */}
      <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
        <span>Found <strong className="text-white font-semibold">{totalCount}</strong> PC games</span>
        {(query || selectedGenre !== 'All' || selectedTag !== 'All' || freeFilter !== 'all' || hardwareFilter !== 'All') && (
          <button
            onClick={clearFilters}
            className="text-emerald-400 hover:underline cursor-pointer font-medium"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Results Grid with animation */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={`${selectedGenre}-${freeFilter}-${hardwareFilter}-${sortOption}`}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : games.length === 0 ? (
          <div className="col-span-full py-16 px-4 text-center space-y-5 rounded-2xl bg-[#121215]/60 border border-white/5 my-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 text-zinc-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6 text-zinc-500" />
            </div>
            <div className="space-y-1">
              <p className="text-zinc-200 text-base font-bold">
                {query ? `No games found matching "${query}"` : 'No games match your current filter combination.'}
              </p>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Check for typos, broaden your search keywords, or try exploring top genres below:
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto pt-1">
              {['Action', 'RPG', 'Shooter', 'Open World', 'Free to Play', 'Indie', 'Survival'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setQuery('');
                    if (cat === 'Free to Play') {
                      setFreeFilter('free');
                      setSelectedGenre('All');
                    } else {
                      setSelectedGenre(cat);
                      setFreeFilter('all');
                    }
                  }}
                  className="px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 text-xs font-medium transition-colors cursor-pointer"
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-colors cursor-pointer shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        ) : (
          games.map((game) => (
            <motion.div key={game.id} variants={itemVariants}>
              <GameCard game={game} showMatchScore={true} />
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Full Catalog Pagination & Load More Controls */}
      {games.length > 0 && games.length < totalCount && (
        <div className="pt-8 pb-4 flex flex-col items-center justify-center space-y-4">
          <div className="w-full max-w-md bg-zinc-900/80 rounded-full h-1.5 overflow-hidden border border-white/5">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((games.length / totalCount) * 100))}%` }}
            />
          </div>

          <span className="text-xs text-zinc-400">
            Showing <strong className="text-zinc-200">{games.length}</strong> of <strong className="text-white">{totalCount}</strong> games ({Math.round((games.length / totalCount) * 100)}% of library)
          </span>

          <div className="flex flex-wrap items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.96 }}
              disabled={loadingMore}
              onClick={() => {
                setDisplayLimit((prev) => prev + 36);
              }}
              className="px-6 py-3 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-bold shadow-xl transition-all cursor-pointer disabled:opacity-50"
            >
              {loadingMore ? 'Loading Games...' : `Load Next 36 Games (${totalCount - games.length} remaining)`}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              disabled={loadingMore}
              onClick={() => {
                setDisplayLimit(totalCount + 50);
              }}
              className="px-5 py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
            >
              View Entire Catalog
            </motion.button>
          </div>
        </div>
      )}

      {games.length >= totalCount && totalCount > 0 && (
        <div className="pt-8 pb-4 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Check className="w-4 h-4" /> You've viewed all {totalCount} games in this collection
          </span>
        </div>
      )}
    </div>
  );
};
