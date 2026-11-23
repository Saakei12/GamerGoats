import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Sparkles, SlidersHorizontal, Compass, ArrowRight } from 'lucide-react';
import type { Game, GenreItem } from '../types/game';
import {
  fetchFeaturedGame,
  fetchTrendingGames,
  fetchFreeGames,
  fetchPaidGames,
  fetchClassicGames,
  fetchHiddenGems,
  fetchGenres,
  fetchRecommendations
} from '../services/api';
import { usePreferences } from '../context/PreferencesContext';
import { HeroSection } from '../components/HeroSection';
import { GameRow } from '../components/GameRow';
import { GameCard } from '../components/GameCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { SeoHead } from '../components/SeoHead';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

export const HomePage: React.FC = () => {
  const { userTags, setIsOnboardingOpen } = usePreferences();

  const [heroGames, setHeroGames] = useState<Game[]>([]);
  const [forYouGames, setForYouGames] = useState<Game[]>([]);
  const [trendingGames, setTrendingGames] = useState<Game[]>([]);
  const [paidGames, setPaidGames] = useState<Game[]>([]);
  const [classicGames, setClassicGames] = useState<Game[]>([]);
  const [freeGames, setFreeGames] = useState<Game[]>([]);
  const [hiddenGems, setHiddenGems] = useState<Game[]>([]);
  const [genres, setGenres] = useState<GenreItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial homepage data
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const [featured, trending, paid, classics, free, gems, genreList] = await Promise.all([
          fetchFeaturedGame(),
          fetchTrendingGames(12),
          fetchPaidGames(12),
          fetchClassicGames(12),
          fetchFreeGames(12),
          fetchHiddenGems(12),
          fetchGenres()
        ]);

        if (isMounted) {
          // Dynamic trending blockbusters lineup for the hero carousel (Cyberpunk, GTA V, Elden Ring, Baldur's Gate 3, RDR2)
          const trendingBlockbusters = [
            ...trending.filter(g => g.slug?.includes('cyberpunk') || g.title?.toLowerCase().includes('cyberpunk')),
            ...trending.filter(g => !g.slug?.includes('cyberpunk') && !g.title?.toLowerCase().includes('cyberpunk'))
          ].slice(0, 5);

          const heroes = trendingBlockbusters.length > 0
            ? trendingBlockbusters
            : (featured ? [featured, ...paid.filter(g => g.id !== featured.id).slice(0, 3)] : paid.slice(0, 4));

          setHeroGames(heroes);
          setTrendingGames(trending);
          setPaidGames(paid);
          setClassicGames(classics);
          setFreeGames(free);
          setHiddenGems(gems);
          setGenres(genreList);
        }
      } catch (err) {
        console.error('Failed to load homepage:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, []);

  // Update recommendations whenever user preferences change
  useEffect(() => {
    let isMounted = true;
    async function loadRecommendations() {
      const recs = await fetchRecommendations(userTags, 8);
      if (isMounted) setForYouGames(recs);
    }
    loadRecommendations();
    return () => { isMounted = false; };
  }, [userTags]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-14">
      {/* Dynamic Search Engine Optimization & Google JSON-LD */}
      <SeoHead
        title="GamerGoats — Discover Your Next PC Game | Premium Game Discovery"
        description="Discover your next PC game with GamerGoats. Personalized recommendations, AAA blockbusters, PC system specifications, Metascores, and free giveaways."
        keywords={['PC games', 'video game discovery', 'steam games', 'gamergoats', 'cyberpunk 2077', 'elden ring']}
      />

      {/* A. HERO CINEMATIC CAROUSEL (Top Trending Blockbusters) */}
      <HeroSection games={heroGames} />

      {/* B. TRENDING SECTION */}
      <GameRow
        title="Trending Right Now"
        subtitle="The most popular and actively played games across PC gaming today."
        games={trendingGames}
        viewAllLink="/search?sort=popularity"
      />

      {/* C. FOR YOU SECTION (Personalized Recommendations) */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
        className="pt-2"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 px-1">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                Adaptive Recommendation
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              For You
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Curated matches calculated from your taste: <strong className="text-zinc-200">{userTags.slice(0, 4).join(', ')}</strong>
              {userTags.length > 4 ? ` +${userTags.length - 4} more` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOnboardingOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10 hover:border-emerald-500/40 transition-colors cursor-pointer shadow-sm"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
              Adjust Preferences
            </motion.button>
            <Link
              to="/categories"
              className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-emerald-400 transition-colors ml-2 group"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* For You Grid with Staggered Entrance */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {loading && forYouGames.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            forYouGames.map((game) => (
              <motion.div key={game.id} variants={itemVariants}>
                <GameCard game={game} showMatchScore={true} />
              </motion.div>
            ))
          )}
        </motion.div>
      </motion.section>

      {/* TOP PAID & AAA BLOCKBUSTERS */}
      <GameRow
        title="Top Paid & AAA Blockbusters"
        subtitle="Critically acclaimed PC masterpieces, GOTY winners, and studio blockbusters."
        games={paidGames}
        viewAllLink="/paid-games"
      />

      {/* ALL-TIME PC CLASSICS & RETRO MASTERPIECES */}
      <GameRow
        title="All-Time PC Classics & Retro Masterpieces"
        subtitle="Timeless PC milestones with universal acclaim — Half-Life 2, Portal 2, Skyrim, BioShock, and more."
        games={classicGames}
        viewAllLink="/search?tag=Classic"
      />

      {/* D. FREE TO PLAY & GIVEAWAYS */}
      <GameRow
        title="Free to Play & Giveaways"
        subtitle="100% free PC games and time-limited official giveaways."
        games={freeGames}
        viewAllLink="/free-games"
      />

      {/* E. HIDDEN GEMS */}
      <GameRow
        title="Hidden Gems"
        subtitle="Critically acclaimed, atmospheric, and underrated PC experiences."
        games={hiddenGems}
        viewAllLink="/search?tag=Stylized"
      />

      {/* F. EXPLORE BY GENRE */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
        className="pt-4"
      >
        <div className="flex items-end justify-between mb-6 px-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              Explore by Genre
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Browse PC titles categorised by their core gameplay style.
            </p>
          </div>
          <Link
            to="/categories"
            className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-emerald-400 transition-colors group"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {genres.map((genre) => (
            <Link
              key={genre.name}
              to={`/search?genre=${encodeURIComponent(genre.name)}`}
              className="group relative h-32 sm:h-40 rounded-2xl overflow-hidden border border-white/10 hover:border-emerald-500/40 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-black/70 hover:-translate-y-1"
            >
              {/* Background artwork */}
              <img
                src={genre.image}
                alt={genre.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out filter brightness-[0.75] group-hover:brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

              <div className="relative h-full p-4 flex flex-col justify-end">
                <span className="text-base sm:text-lg font-black text-white group-hover:text-emerald-400 transition-colors">
                  {genre.name}
                </span>
                <span className="text-[11px] text-zinc-400 font-mono mt-0.5">
                  {genre.count} PC Games
                </span>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>
    </div>
  );
};
