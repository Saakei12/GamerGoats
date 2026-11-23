import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Bookmark, Flame, Monitor, Star, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import type { Game } from '../types/game';
import { usePreferences } from '../context/PreferencesContext';

interface HeroSectionProps {
  games: Game[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ games }) => {
  const { isBookmarked, toggleBookmark } = usePreferences();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Pick top 4 cinematic games for hero showcase
  const heroGames = games && games.length > 0 ? games.slice(0, 4) : [];
  const currentGame = heroGames[currentIndex];

  // Preload upcoming hero images for instantaneous slide transitions
  useEffect(() => {
    if (!heroGames.length) return;
    heroGames.forEach((g) => {
      const imgUrl = g.background_image || g.thumbnail;
      if (imgUrl) {
        const img = new Image();
        img.src = imgUrl;
      }
    });
  }, [heroGames]);

  // Auto-slide every 6 seconds if not paused by mouse hover
  useEffect(() => {
    if (isPaused || heroGames.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroGames.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, heroGames.length]);

  if (!currentGame) {
    return (
      <div className="w-full h-[500px] md:h-[580px] rounded-3xl bg-zinc-900/40 border border-zinc-800/60 animate-pulse my-4" />
    );
  }

  const bookmarked = isBookmarked(currentGame.id);
  const heroImage = (currentGame.screenshots && currentGame.screenshots.length > 0 && currentGame.screenshots[0]) || currentGame.background_image || currentGame.thumbnail || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80';

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-[520px] md:h-[600px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group my-4 select-none bg-zinc-950"
    >
      {/* Background Cinematic Artwork with Crossfade */}
      <AnimatePresence initial={false}>
        <motion.div
          key={currentGame.id}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={heroImage}
            alt={currentGame.title}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            className="w-full h-full object-cover object-center filter brightness-[1.05] contrast-[1.02]"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const fallback = currentGame.thumbnail || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80';
              if (target.src !== fallback) {
                target.src = fallback;
              }
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Cinematic Focused Vignette Gradients: Soft at text, Clear at right */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/20 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#09090b]/80 via-[#09090b]/20 to-transparent w-full md:w-3/5 pointer-events-none" />

      {/* Ambient Glow Orb */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Content Container */}
      <div className="relative h-full flex flex-col justify-end p-6 sm:p-10 md:p-14 max-w-3xl z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentGame.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-4"
          >
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
                <Flame className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Trending Game #{currentIndex + 1}
              </span>

              {currentGame.rating && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-900/80 text-zinc-200 border border-zinc-700/60 backdrop-blur-md flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {currentGame.rating} Metascore
                </span>
              )}

              {currentGame.hardware_tier && (
                <span className="px-2.5 py-1 rounded-full text-xs bg-zinc-900/80 text-zinc-300 border border-zinc-700/40 backdrop-blur-md flex items-center gap-1.5">
                  <Monitor className="w-3 h-3 text-zinc-400" />
                  {currentGame.hardware_tier}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.08] drop-shadow-lg">
              {currentGame.title}
            </h1>

            {/* Tagline / Description */}
            <p className="text-sm sm:text-base text-zinc-300 line-clamp-2 leading-relaxed max-w-2xl font-normal drop-shadow">
              {currentGame.short_description || currentGame.description}
            </p>

            {/* Genres & Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {(currentGame.genres || []).map((genre) => (
                <span
                  key={genre}
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-900/90 text-zinc-200 border border-zinc-700/60 backdrop-blur-md"
                >
                  {genre}
                </span>
              ))}
              {(currentGame.gameplay_tags || []).slice(0, 2).map((gt) => (
                <span
                  key={gt}
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/60 text-zinc-400 border border-zinc-800"
                >
                  {gt}
                </span>
              ))}
            </div>

            {/* Call to Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Link
                to={`/game/${currentGame.id}`}
                className="group/btn relative flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold bg-white hover:bg-zinc-200 text-black shadow-xl hover:shadow-white/10 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Explore Game</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>

              <button
                onClick={() => toggleBookmark(currentGame)}
                className={`flex items-center gap-2 px-4 py-3.5 rounded-full text-sm font-medium border backdrop-blur-md transition-all cursor-pointer active:scale-95 ${
                  bookmarked
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border-zinc-700/60'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                <span>{bookmarked ? 'Saved' : 'Bookmark'}</span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Hero Carousel Navigation Pill (Bottom-Right) */}
      {heroGames.length > 1 && (
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
          {heroGames.map((g, i) => (
            <button
              key={g.id}
              onClick={() => setCurrentIndex(i)}
              className="relative py-1 px-1 cursor-pointer group"
              aria-label={`Slide to ${g.title}`}
            >
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-7 bg-emerald-400 shadow-sm'
                    : 'w-2 bg-zinc-600 hover:bg-zinc-400'
                }`}
              />
            </button>
          ))}

          <div className="w-[1px] h-3 bg-zinc-700 mx-1" />

          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + heroGames.length) % heroGames.length)}
            className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % heroGames.length)}
            className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
