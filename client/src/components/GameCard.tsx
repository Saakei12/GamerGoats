import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, Sparkles, Monitor, Gift, ArrowUpRight } from 'lucide-react';
import type { Game } from '../types/game';
import { usePreferences } from '../context/PreferencesContext';

interface GameCardProps {
  game: Game;
  showMatchScore?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({ game, showMatchScore = true }) => {
  const { isBookmarked, toggleBookmark } = usePreferences();
  const bookmarked = isBookmarked(game.id);

  const [imgSrc, setImgSrc] = React.useState(
    game.thumbnail || game.background_image || game.logo || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'
  );

  const handleImgError = () => {
    // Chain fallback: thumbnail -> background_image -> logo -> high-res fallback
    if (imgSrc === game.thumbnail && game.background_image) {
      setImgSrc(game.background_image);
    } else if (imgSrc !== game.logo && game.logo) {
      setImgSrc(game.logo);
    } else {
      setImgSrc('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80');
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(game);
  };

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
      className="group relative flex flex-col bg-[#121215] rounded-2xl overflow-hidden border border-white/[0.07] hover:border-emerald-500/30 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-black/70 glow-card"
    >
      <Link to={`/game/${game.id}`} className="flex flex-col flex-1">
        {/* Artwork Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
          <img
            src={imgSrc}
            alt={game.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
            onError={handleImgError}
          />

          {/* Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-black/40 opacity-90" />

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 z-10">
            {/* Match score badge with animated gradient glow */}
            {showMatchScore && game.matchScore ? (
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-gradient-to-r from-emerald-500/25 to-teal-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md shadow-sm">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                  {game.matchScore}% MATCH
                </span>
                {(game.ratings?.average_rating || game.rating) && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-950/80 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                    ★ {game.ratings?.average_rating || game.rating}
                  </span>
                )}
              </div>
            ) : (game.ratings?.average_rating || game.rating) ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-950/90 text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-sm">
                <span className="text-amber-400 font-bold">★</span>
                <span>{game.ratings?.average_rating || game.rating}</span>
                <span className="text-[9px] text-zinc-400 font-normal">AVG</span>
              </span>
            ) : <div />}

            {/* Bookmark button with tap animation */}
            <motion.button
              whileTap={{ scale: 0.82 }}
              onClick={handleBookmark}
              className={`p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
                bookmarked
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'bg-black/60 text-zinc-300 hover:text-white hover:bg-black/90 border border-white/10'
              }`}
              title={bookmarked ? 'Remove bookmark' : 'Bookmark game'}
              aria-label="Bookmark"
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
            </motion.button>
          </div>

          {/* Bottom Tags / Status Over Artwork */}
          <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between z-10 text-[10px]">
            {game.is_giveaway ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium backdrop-blur-sm">
                <Gift className="w-2.5 h-2.5" />
                Giveaway {game.giveaway_worth ? `(${game.giveaway_worth})` : ''}
              </span>
            ) : game.is_free ? (
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium backdrop-blur-sm">
                Free to Play
              </span>
            ) : game.price ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-950/90 text-emerald-400 border border-emerald-500/30 font-bold backdrop-blur-md shadow-sm">
                {game.is_aaa && <span className="text-[9px] text-zinc-400 uppercase font-semibold">AAA</span>}
                {game.price}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-zinc-900/80 text-zinc-300 border border-zinc-800 font-medium backdrop-blur-sm">
                PC
              </span>
            )}

            {game.hardware_tier && (
              <span className="inline-flex items-center gap-1 text-zinc-300 bg-black/65 px-2 py-0.5 rounded-full backdrop-blur-md border border-white/5">
                <Monitor className="w-2.5 h-2.5 text-zinc-400" />
                {game.hardware_tier.replace(' PC', '')}
              </span>
            )}
          </div>
        </div>

        {/* Info Content */}
        <div className="p-4 flex flex-col flex-1 justify-between gap-3">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm text-zinc-100 group-hover:text-emerald-400 transition-colors line-clamp-1">
                {game.title}
              </h3>
              <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0 opacity-0 group-hover:opacity-100" />
            </div>

            <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
              {game.short_description || game.description || 'Explore rich gameplay and mechanics.'}
            </p>
          </div>

          {/* Genres / Tags Footnote */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/[0.04]">
            {(game.genres || []).slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="px-2 py-0.5 rounded-md text-[10px] bg-zinc-900 text-zinc-400 border border-white/5 font-medium"
              >
                {genre}
              </span>
            ))}
            {(game.tags || [])
              .filter((t) => !(game.genres || []).includes(t))
              .slice(0, 1)
              .map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md text-[10px] bg-zinc-900/60 text-zinc-500"
                >
                  {tag}
                </span>
              ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
