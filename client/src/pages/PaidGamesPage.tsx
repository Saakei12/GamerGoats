import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, SlidersHorizontal } from 'lucide-react';
import type { Game } from '../types/game';
import { fetchPaidGames } from '../services/api';
import { GameCard } from '../components/GameCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { SeoHead } from '../components/SeoHead';

export const PaidGamesPage: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedPriceTier, setSelectedPriceTier] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;
    async function loadPaid() {
      setLoading(true);
      const data = await fetchPaidGames(30);
      if (isMounted) {
        setGames(data);
        setLoading(false);
      }
    }
    loadPaid();
    return () => { isMounted = false; };
  }, []);

  // Filter games by genre and price
  const filteredGames = games.filter((g) => {
    if (selectedGenre !== 'All' && !(g.genres || []).includes(selectedGenre)) {
      return false;
    }
    if (selectedPriceTier === 'under30') {
      const priceVal = parseFloat((g.price || '0').replace('$', ''));
      if (priceVal > 30) return false;
    } else if (selectedPriceTier === '30to60') {
      const priceVal = parseFloat((g.price || '0').replace('$', ''));
      if (priceVal < 30 || priceVal > 60) return false;
    } else if (selectedPriceTier === '60plus') {
      const priceVal = parseFloat((g.price || '0').replace('$', ''));
      if (priceVal < 60) return false;
    }
    return true;
  });

  const genresList = ['All', 'Action', 'RPG', 'Adventure', 'Shooter', 'Strategy', 'Racing', 'Horror', 'Survival'];

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
        title="Top Paid & AAA PC Games | GamerGoats"
        description="Explore top-rated AAA blockbusters, premium PC games, system requirements, and ratings on GamerGoats."
        keywords={['AAA PC games', 'paid games', 'best PC games', 'cyberpunk 2077', 'baldurs gate 3', 'elden ring']}
      />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
            AAA & Blockbuster Catalogue
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2.5">
          <ShieldCheck className="w-7 h-7 text-emerald-400" />
          Top Paid & AAA Games
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
          Discover critically acclaimed PC masterpieces, Game of the Year winners, and industry-defining blockbusters.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#121215] border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Genre Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <SlidersHorizontal className="w-4 h-4 text-emerald-400 mr-1 flex-shrink-0" />
            {genresList.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedGenre === genre
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : 'bg-zinc-900 text-zinc-300 hover:text-white border border-white/5'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Price Tier Selector */}
          <div className="flex items-center gap-2">
            <select
              value={selectedPriceTier}
              onChange={(e) => setSelectedPriceTier(e.target.value)}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-900 text-zinc-200 text-xs font-semibold border border-white/10 focus:outline-none cursor-pointer"
            >
              <option value="all">All Prices</option>
              <option value="under30">Under $30</option>
              <option value="30to60">$30 – $60</option>
              <option value="60plus">$60+</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
        <span>Showing <strong className="text-white font-semibold">{filteredGames.length}</strong> AAA & Paid Titles</span>
        {(selectedGenre !== 'All' || selectedPriceTier !== 'all') && (
          <button
            onClick={() => { setSelectedGenre('All'); setSelectedPriceTier('all'); }}
            className="text-emerald-400 hover:underline cursor-pointer font-medium"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={`${selectedGenre}-${selectedPriceTier}`}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filteredGames.length === 0 ? (
          <div className="col-span-full py-16 text-center text-zinc-500">
            No games match your current filter.
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
