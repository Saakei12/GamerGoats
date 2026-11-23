import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ExternalLink,
  Bookmark,
  Sparkles,
  Calendar,
  Layers,
  Cpu,
  Monitor,
  HardDrive,
  Activity,
  Star,
  ChevronLeft,
  Gift,
  CheckCircle2,
  Share2,
  Search
} from 'lucide-react';
import type { Game } from '../types/game';
import { fetchGameDetail, fetchGamesByGenre, searchGames, fetchTrendingGames } from '../services/api';
import { usePreferences } from '../context/PreferencesContext';
import { ScreenshotLightbox } from '../components/ScreenshotLightbox';
import { GameCard } from '../components/GameCard';
import { SeoHead } from '../components/SeoHead';
import { RatingBreakdownWidget } from '../components/RatingBreakdownWidget';

export const GameDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isBookmarked, toggleBookmark, userTags } = usePreferences();

  const [game, setGame] = useState<Game | null>(null);
  const [similarGames, setSimilarGames] = useState<Game[]>([]);
  const [fallbackGames, setFallbackGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadGame() {
      if (!id) return;
      try {
        setLoading(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const data = await fetchGameDetail(id);
        if (isMounted && data) {
          setGame(data);
          const initialImg = (data.screenshots && data.screenshots.length > 0 && data.screenshots[0]) || data.background_image || data.thumbnail || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80';
          setActiveImage(initialImg);

          // Fetch similar games based on main genre
          if (data.genres && data.genres.length > 0) {
            const similar = await fetchGamesByGenre(data.genres[0], 6);
            if (isMounted) {
              setSimilarGames(similar.filter((g) => g.id !== data.id).slice(0, 4));
            }
          }
        } else if (isMounted) {
          // Game not found by direct lookup - trigger fallback catalog search
          const cleanQuery = decodeURIComponent(id).replace(/[-_]/g, ' ').trim();
          setSearchQuery(cleanQuery);
          const searchResult = await searchGames({ q: cleanQuery, limit: 8 });
          if (isMounted) {
            if (searchResult.games && searchResult.games.length > 0) {
              setFallbackGames(searchResult.games);
            } else {
              const trending = await fetchTrendingGames(8);
              if (isMounted) setFallbackGames(trending);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load game detail:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadGame();
    return () => { isMounted = false; };
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-8">
        <div className="h-8 w-48 bg-zinc-800 rounded-md" />
        <div className="h-96 w-full bg-zinc-900 rounded-3xl" />
        <div className="space-y-4 max-w-2xl">
          <div className="h-8 bg-zinc-800 rounded w-3/4" />
          <div className="h-4 bg-zinc-800/60 rounded w-full" />
          <div className="h-4 bg-zinc-800/40 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (!game) {
    const rawQuery = decodeURIComponent(id || '').replace(/[-_]/g, ' ').trim();
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <SeoHead
          title={`Search "${rawQuery || 'Game'}" - GamerGoats`}
          description={`Explore games matching "${rawQuery}" on GamerGoats. Discover free games, AAA hits, and PC classics.`}
        />

        {/* Not Found Hero / Search Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-900 to-[#121215] border border-white/10 p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <Search className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700">
              Game Not Found
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              No exact match for &ldquo;<span className="text-emerald-400">{rawQuery || 'this game'}</span>&rdquo;
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
              We couldn&apos;t find an exact game page for this title. Search our catalog of 500+ verified PC games below or explore recommended titles:
            </p>
          </div>

          {/* Interactive Search Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
            className="flex items-center gap-2 max-w-xl mx-auto bg-black/60 border border-white/15 rounded-2xl p-2 focus-within:border-emerald-500/60 transition-colors shadow-inner"
          >
            <Search className="w-5 h-5 text-zinc-500 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, genre, or keyword..."
              className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 px-2 py-2 focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-md"
            >
              Search
            </button>
          </form>

          {/* Quick Genre Links */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {['Action', 'RPG', 'Shooter', 'Open World', 'Free to Play', 'Indie'].map((cat) => (
              <Link
                key={cat}
                to={`/search?genre=${encodeURIComponent(cat)}`}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-900/90 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-white/5 transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>

          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Return to Discover Homepage
            </Link>
          </div>
        </div>

        {/* Fallback Suggestions Grid */}
        {fallbackGames.length > 0 && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  Recommended Games Matching &ldquo;{rawQuery}&rdquo;
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Popular and relevant titles discovered in our catalog
                </p>
              </div>

              <Link
                to={rawQuery ? `/search?q=${encodeURIComponent(rawQuery)}` : '/search'}
                className="text-xs text-emerald-400 hover:underline font-semibold"
              >
                Browse All Games →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {fallbackGames.map((g) => (
                <GameCard key={g.id} game={g} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const bookmarked = isBookmarked(game.id);
  const heroImage = game.background_image || game.thumbnail || activeImage;
  const screenshots = game.screenshots && game.screenshots.length > 0
    ? game.screenshots
    : game.background_image ? [game.background_image] : [];

  const matchedUserTags = (game.tags || []).filter(t => userTags.includes(t));
  const matchScore = game.matchScore || Math.min(99, Math.round(75 + (game.rating ? game.rating * 0.22 : 12)));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen pb-20"
    >
      {/* Dynamic SEO Meta Tags & schema.org/VideoGame JSON-LD */}
      <SeoHead game={game} />

      {/* Background Artwork Banner Header with Smooth Gradient Overlay */}
      <div className="relative w-full h-[400px] md:h-[540px] overflow-hidden bg-zinc-950">
        <img
          src={heroImage}
          alt={game.title}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          className="w-full h-full object-cover object-center filter brightness-[0.78] scale-102 transition-all duration-700"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            const fallback = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80';
            if (target.src !== fallback) {
              target.src = fallback;
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090b]/80 via-transparent to-transparent w-1/3" />

        {/* Back Link Overlay */}
        <div className="absolute top-6 left-4 sm:left-8 z-20 flex items-center gap-2">
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Discover</span>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-44 relative z-20 space-y-12">
        {/* Header Information Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div className="max-w-3xl space-y-3.5">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 backdrop-blur-md shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                {matchScore}% Match for You
              </span>

              {game.rating && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900/80 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {game.ratings?.average_rating || game.rating} Cross-Web Average
                </span>
              )}

              {game.is_classic && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-md">
                  All-Time PC Classic
                </span>
              )}

              {game.is_giveaway ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Gift className="w-3.5 h-3.5" />
                  Giveaway {game.giveaway_worth ? `(${game.giveaway_worth})` : ''}
                </span>
              ) : game.is_free ? (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Free to Play
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-800/80 text-zinc-300 border border-white/5">
                  PC Release
                </span>
              )}
            </div>

            {/* Game Logo or Title */}
            {game.logo && (
              <div className="max-w-[260px] sm:max-w-[320px] mb-2">
                <img
                  src={game.logo}
                  alt={`${game.title} Logo`}
                  className="max-h-16 w-auto object-contain filter drop-shadow-xl"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              </div>
            )}

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.08] drop-shadow-md">
              {game.title}
            </h1>

            {/* Sub-meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1">
              {game.developer && (
                <span>
                  Developer: <strong className="text-zinc-200 font-medium">{game.developer}</strong>
                </span>
              )}
              {game.publisher && (
                <span>
                  Publisher: <strong className="text-zinc-200 font-medium">{game.publisher}</strong>
                </span>
              )}
              {game.release_date && (
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  {game.release_date}
                </span>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="p-3 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
              title="Share game"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleBookmark(game)}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-full text-xs font-bold border backdrop-blur-md transition-all cursor-pointer shadow-md ${
                bookmarked
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow-emerald-500/20'
                  : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border-white/10'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
              <span>{bookmarked ? 'Saved to Bookmarks' : 'Bookmark Game'}</span>
            </motion.button>

            {game.official_url && (
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                href={game.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-full text-xs font-bold bg-white hover:bg-zinc-200 text-black shadow-xl hover:shadow-white/10 transition-all cursor-pointer"
              >
                <span>{game.is_giveaway ? 'Claim Giveaway' : game.is_free ? 'Play Free Now' : 'Official Store Page'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </motion.a>
            )}
          </div>
        </div>

        {/* 2-Column Grid: Details and Metadata */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column (2 spans): Overview & Screenshots */}
          <div className="lg:col-span-2 space-y-10">
            {/* Overview Section */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white tracking-tight">Overview</h2>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed whitespace-pre-line font-normal">
                {game.description || game.short_description}
              </p>
            </section>

            {/* Cross-Web Average Rating & Multi-Source Breakdown Widget */}
            <RatingBreakdownWidget game={game} />

            {/* Screenshots Gallery with Active View & Thumbnails */}
            {screenshots.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Screenshots & Media
                  </h2>
                  <span className="text-xs text-zinc-400">Click any image for fullscreen lightbox</span>
                </div>

                {/* Primary Preview */}
                <div
                  onClick={() => {
                    const idx = screenshots.indexOf(activeImage);
                    setLightboxIndex(idx >= 0 ? idx : 0);
                    setLightboxOpen(true);
                  }}
                  className="group relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 cursor-pointer shadow-xl glow-card"
                >
                  <img
                    src={activeImage}
                    alt={game.title}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const nextFallback = (game.background_image && game.background_image !== target.src)
                        ? game.background_image
                        : (game.thumbnail && game.thumbnail !== target.src)
                        ? game.thumbnail
                        : 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80';
                      if (target.src !== nextFallback) {
                        target.src = nextFallback;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                </div>

                {/* Thumbnail Strip */}
                {screenshots.length > 1 && (
                  <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2">
                    {screenshots.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(img)}
                        className={`relative aspect-[16/10] w-28 sm:w-32 rounded-xl overflow-hidden flex-shrink-0 border transition-all cursor-pointer ${
                          activeImage === img
                            ? 'border-emerald-400 ring-2 ring-emerald-500/30'
                            : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${game.title} screenshot ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const btn = (e.target as HTMLElement).closest('button');
                            if (btn) btn.style.display = 'none';
                            if (activeImage === img) {
                              const alternative = screenshots.find((s) => s !== img) || game.background_image || game.thumbnail;
                              if (alternative) setActiveImage(alternative);
                            }
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* System Requirements Section */}
            {(game.minimum_requirements || game.recommended_requirements) && (
              <section className="space-y-5 pt-6 border-t border-white/[0.08]">
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-emerald-400" />
                  System Requirements (PC)
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Minimum */}
                  {game.minimum_requirements && (
                    <div className="p-5 rounded-2xl bg-[#121215] border border-white/5 space-y-3.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                        Minimum Specifications
                      </span>
                      <div className="space-y-2.5 text-xs text-zinc-300">
                        {game.minimum_requirements.os && (
                          <div className="flex items-start gap-2">
                            <Monitor className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                            <span><strong>OS:</strong> {game.minimum_requirements.os}</span>
                          </div>
                        )}
                        {game.minimum_requirements.processor && (
                          <div className="flex items-start gap-2">
                            <Cpu className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                            <span><strong>CPU:</strong> {game.minimum_requirements.processor}</span>
                          </div>
                        )}
                        {game.minimum_requirements.memory && (
                          <div className="flex items-start gap-2">
                            <Activity className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                            <span><strong>RAM:</strong> {game.minimum_requirements.memory}</span>
                          </div>
                        )}
                        {game.minimum_requirements.graphics && (
                          <div className="flex items-start gap-2">
                            <Layers className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                            <span><strong>GPU:</strong> {game.minimum_requirements.graphics}</span>
                          </div>
                        )}
                        {game.minimum_requirements.storage && (
                          <div className="flex items-start gap-2">
                            <HardDrive className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                            <span><strong>Storage:</strong> {game.minimum_requirements.storage}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recommended */}
                  {game.recommended_requirements && (
                    <div className="p-5 rounded-2xl bg-[#121215] border border-emerald-500/20 space-y-3.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                        Recommended Specifications
                      </span>
                      <div className="space-y-2.5 text-xs text-zinc-300">
                        {game.recommended_requirements.os && (
                          <div className="flex items-start gap-2">
                            <Monitor className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                            <span><strong>OS:</strong> {game.recommended_requirements.os}</span>
                          </div>
                        )}
                        {game.recommended_requirements.processor && (
                          <div className="flex items-start gap-2">
                            <Cpu className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                            <span><strong>CPU:</strong> {game.recommended_requirements.processor}</span>
                          </div>
                        )}
                        {game.recommended_requirements.memory && (
                          <div className="flex items-start gap-2">
                            <Activity className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                            <span><strong>RAM:</strong> {game.recommended_requirements.memory}</span>
                          </div>
                        )}
                        {game.recommended_requirements.graphics && (
                          <div className="flex items-start gap-2">
                            <Layers className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                            <span><strong>GPU:</strong> {game.recommended_requirements.graphics}</span>
                          </div>
                        )}
                        {game.recommended_requirements.storage && (
                          <div className="flex items-start gap-2">
                            <HardDrive className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                            <span><strong>Storage:</strong> {game.recommended_requirements.storage}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Metadata Sidebar */}
          <div className="space-y-6">
            {/* Game Meta Card */}
            <div className="p-6 rounded-3xl bg-[#121215] border border-white/10 space-y-5 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-white/[0.08] pb-3">
                Game Specifications
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-zinc-500 block mb-1">Supported Platforms</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(game.platforms || ['PC (Windows)']).map((p) => (
                      <span key={p} className="px-2.5 py-1 rounded-md bg-zinc-900 text-zinc-300 font-semibold border border-white/5">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {game.hardware_tier && (
                  <div>
                    <span className="text-zinc-500 block mb-1">Hardware Tier</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 text-zinc-200 font-medium border border-white/10">
                      <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                      {game.hardware_tier}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-zinc-500 block mb-2">Genres</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(game.genres || []).map((genre) => (
                      <Link
                        key={genre}
                        to={`/search?genre=${encodeURIComponent(genre)}`}
                        className="px-3 py-1 rounded-full text-[11px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/5 transition-colors"
                      >
                        {genre}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-zinc-500 block mb-2">Tags & Attributes</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(game.tags || []).map((tag) => {
                      const isUserFavorite = userTags.includes(tag);
                      return (
                        <Link
                          key={tag}
                          to={`/search?tag=${encodeURIComponent(tag)}`}
                          className={`px-3 py-1 rounded-full text-[11px] transition-colors ${
                            isUserFavorite
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 font-medium'
                              : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 border border-white/5'
                          }`}
                        >
                          {tag}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Matched Tags Widget */}
            {matchedUserTags.length > 0 && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/25 space-y-2 shadow-lg">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Matches Your Taste
                </span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  This game aligns with your preferred preferences: <strong>{matchedUserTags.join(', ')}</strong>.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Similar Games Rail */}
        {similarGames.length > 0 && (
          <section className="pt-10 border-t border-white/[0.08] space-y-5">
            <h2 className="text-2xl font-black text-white tracking-tight">
              More Games Like {game.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {similarGames.map((similar) => (
                <GameCard key={similar.id} game={similar} showMatchScore={false} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Screenshot Lightbox */}
      <ScreenshotLightbox
        images={screenshots}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={(idx) => setLightboxIndex(idx)}
      />
    </motion.div>
  );
};
