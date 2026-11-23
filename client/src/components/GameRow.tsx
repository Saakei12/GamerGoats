import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Game } from '../types/game';
import { GameCard } from './GameCard';
import { Link } from 'react-router-dom';

interface GameRowProps {
  title: string;
  subtitle?: string;
  games: Game[];
  viewAllLink?: string;
  showMatchScore?: boolean;
}

export const GameRow: React.FC<GameRowProps> = ({
  title,
  subtitle,
  games,
  viewAllLink,
  showMatchScore = false
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 600;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (!games || games.length === 0) return null;

  return (
    <section className="relative my-8">
      {/* Row Header */}
      <div className="flex items-end justify-between mb-4 px-1">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-xs font-medium text-zinc-400 hover:text-emerald-400 transition-colors"
            >
              View All →
            </Link>
          )}

          {/* Scroll Nav buttons */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-3 scroll-smooth snap-x snap-mandatory"
      >
        {games.map((game) => (
          <div
            key={game.id}
            className="w-[260px] sm:w-[280px] md:w-[300px] flex-shrink-0 snap-start"
          >
            <GameCard game={game} showMatchScore={showMatchScore} />
          </div>
        ))}
      </div>
    </section>
  );
};
