import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Grid, Sparkles } from 'lucide-react';
import type { Game, GenreItem } from '../types/game';
import { fetchGenres, fetchGamesByGenre } from '../services/api';
import { GameCard } from '../components/GameCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { SeoHead } from '../components/SeoHead';

export const CategoriesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedGenre = searchParams.get('genre') || 'Action';

  const [genres, setGenres] = useState<GenreItem[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  // Load genres list
  useEffect(() => {
    fetchGenres().then((res) => {
      setGenres(res);
    });
  }, []);

  // Load games for selected genre
  useEffect(() => {
    let isMounted = true;
    async function loadGenreGames() {
      setLoading(true);
      const data = await fetchGamesByGenre(selectedGenre, 30);
      if (isMounted) {
        setGames(data);
        setLoading(false);
      }
    }
    loadGenreGames();
    return () => { isMounted = false; };
  }, [selectedGenre]);

  const handleSelectGenre = (genreName: string) => {
    setSearchParams({ genre: genreName });
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
      {/* Dynamic SEO Meta Tags */}
      <SeoHead
        title={`Best ${selectedGenre} PC Games | GamerGoats`}
        description={`Explore the top-rated ${selectedGenre} PC games. Browse gameplay mechanics, Metascores, system specs, and recommendations on GamerGoats.`}
        keywords={[selectedGenre, `${selectedGenre} PC games`, 'PC game genres', 'game discovery']}
      />

      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
            Curated Archives
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2.5">
          <Grid className="w-7 h-7 text-emerald-400" />
          Game Categories
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
          Browse PC games by genre, curated mechanics, and distinct gameplay archetypes.
        </p>
      </div>

      {/* Genre Selector Pills */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-2">
        {genres.map((g) => {
          const isSelected = g.name.toLowerCase() === selectedGenre.toLowerCase();
          return (
            <motion.button
              whileTap={{ scale: 0.95 }}
              key={g.name}
              onClick={() => handleSelectGenre(g.name)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-white/5'
              }`}
            >
              <span>{g.name}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${isSelected ? 'bg-black/15 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                {g.count}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
        <span className="text-sm font-semibold text-zinc-300">
          Showing <strong className="text-white">{games.length}</strong> {selectedGenre} PC Games
        </span>
      </div>

      {/* Games Grid with Staggered Animations */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={selectedGenre}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : games.length === 0 ? (
          <div className="col-span-full py-16 text-center text-zinc-500">
            No games found in this category.
          </div>
        ) : (
          games.map((game) => (
            <motion.div key={game.id} variants={itemVariants}>
              <GameCard game={game} showMatchScore={true} />
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};
