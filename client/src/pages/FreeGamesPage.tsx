import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Sparkles } from 'lucide-react';
import type { Game } from '../types/game';
import { fetchFreeGames } from '../services/api';
import { GameCard } from '../components/GameCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { SeoHead } from '../components/SeoHead';

export const FreeGamesPage: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'all' | 'giveaways' | 'f2p'>('all');

  useEffect(() => {
    let isMounted = true;
    async function loadFree() {
      setLoading(true);
      const data = await fetchFreeGames(40);
      if (isMounted) {
        setGames(data);
        setLoading(false);
      }
    }
    loadFree();
    return () => { isMounted = false; };
  }, []);

  const filteredGames = games.filter((g) => {
    if (filterMode === 'giveaways') return g.is_giveaway;
    if (filterMode === 'f2p') return !g.is_giveaway;
    return true;
  });

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
      {/* Dynamic SEO Meta Tags */}
      <SeoHead
        title="Free PC Games & Giveaways | GamerGoats"
        description="Find 100% free PC games, limited-time giveaways, and free-to-play titles with verified downloads on GamerGoats."
        keywords={['free PC games', 'PC giveaways', 'free to play games', 'steam free games']}
      />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            Zero Cost Hub
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2.5">
          <Gift className="w-7 h-7 text-amber-400" />
          Free Games & Giveaways
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
          Discover full PC game giveaways from Steam, Epic, and GOG alongside the top free-to-play PC hits.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2.5 border-b border-white/[0.08] pb-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setFilterMode('all')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            filterMode === 'all'
              ? 'bg-white text-black shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
          }`}
        >
          All Free ({games.length})
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setFilterMode('giveaways')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            filterMode === 'giveaways'
              ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
          }`}
        >
          🎁 Active Giveaways ({games.filter((g) => g.is_giveaway).length})
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setFilterMode('f2p')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            filterMode === 'f2p'
              ? 'bg-blue-400 text-black shadow-md shadow-blue-400/20'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
          }`}
        >
          ⚡ Free-to-Play PC ({games.filter((g) => !g.is_giveaway).length})
        </motion.button>
      </div>

      {/* Grid with animation */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={filterMode}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filteredGames.length === 0 ? (
          <div className="col-span-full py-16 text-center text-zinc-500">
            No games currently found for this filter.
          </div>
        ) : (
          filteredGames.map((game) => (
            <motion.div key={game.id} variants={itemVariants}>
              <GameCard game={game} showMatchScore={true} />
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};
