import { curatedGames } from './curatedGames.js';
import { fallbackFreeGames } from './fallbackFreeGames.js';
import { fetchAllSteamGames } from './steamGames.js';
import { fetchFreeToGameList, fetchFreeToGameDetail } from './freetogame.js';
import { fetchGamerPowerGiveaways } from './gamerpower.js';
import { fetchRawgGames, fetchRawgGameDetail } from './rawg.js';
import { rankGamesForUser, calculateMatch } from './recommendationEngine.js';
import { enrichGameAssets } from './assetEnricher.js';

function computeCrossWebRatings(game) {
  if (game.ratings) return game.ratings;
  const base = game.rating || 82;
  const metacritic = base;
  const steam_score = Math.min(99, Math.max(68, Math.round(base * 1.02 + 1)));
  const steam_sentiment = steam_score >= 94 ? 'Overwhelmingly Positive' : steam_score >= 82 ? 'Very Positive' : 'Mostly Positive';
  const ign = Number((base / 10).toFixed(1));
  const opencritic = Math.round((metacritic + steam_score) / 2);
  const community_score = Math.min(98, Math.max(70, Math.round((metacritic * 0.4) + (steam_score * 0.6))));
  const average_rating = Math.round(
    (metacritic * 0.35) + (steam_score * 0.35) + (opencritic * 0.20) + (community_score * 0.10)
  );
  const review_count = game.rating_count || Math.max(1200, Math.round(base * 1100));

  return {
    metacritic,
    steam_score,
    steam_sentiment,
    ign,
    opencritic,
    community_score,
    average_rating,
    review_count
  };
}

class ApiAggregator {
  constructor() {
    this.games = [];
    this.gamesById = new Map();
    this.gamesBySlug = new Map();
    this.lastSync = null;
    this.isSyncing = false;
    this.detailCache = new Map();
    this.initPromise = null;
  }

  normalizeTitle(title) {
    return (title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }

  async syncAll() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    console.log('[ApiAggregator] Starting scheduled data synchronization...');

    try {
      // Fetch in parallel with fault tolerance
      const [f2pGames, gpGiveaways, rawgGames, steamGames] = await Promise.allSettled([
        fetchFreeToGameList(),
        fetchGamerPowerGiveaways(),
        fetchRawgGames(30),
        fetchAllSteamGames()
      ]);

      const f2pList = f2pGames.status === 'fulfilled' ? f2pGames.value : [];
      const gpList = gpGiveaways.status === 'fulfilled' ? gpGiveaways.value : [];
      const rawgList = rawgGames.status === 'fulfilled' ? rawgGames.value : [];
      const steamList = steamGames.status === 'fulfilled' ? steamGames.value : [];

      console.log(`[ApiAggregator] Fetched: ${f2pList.length} F2P, ${gpList.length} Giveaways, ${rawgList.length} RAWG, ${steamList.length} Steam, ${curatedGames.length} Curated.`);

      // Deduplication map by normalized title
      const uniqueMap = new Map();

      // Priority 1: Curated (AAA & verified PC hits with highest detail)
      for (const game of curatedGames) {
        const norm = this.normalizeTitle(game.title);
        uniqueMap.set(norm, { ...game });
      }

      // Priority 2: Steam Top 100 All-Time & Trending Releases
      for (const game of steamList) {
        const norm = this.normalizeTitle(game.title);
        if (!uniqueMap.has(norm)) {
          uniqueMap.set(norm, { ...game });
        }
      }

      // Priority 2: GamerPower Giveaways
      for (const game of gpList) {
        const norm = this.normalizeTitle(game.title);
        if (!uniqueMap.has(norm)) {
          uniqueMap.set(norm, { ...game });
        } else {
          // If already exists, mark giveaway flag and worth
          const existing = uniqueMap.get(norm);
          existing.is_giveaway = true;
          existing.giveaway_url = game.giveaway_url;
          existing.giveaway_worth = game.giveaway_worth;
        }
      }

      // Priority 3: RAWG Games (if configured)
      for (const game of rawgList) {
        const norm = this.normalizeTitle(game.title);
        if (!uniqueMap.has(norm)) {
          uniqueMap.set(norm, { ...game });
        }
      }

      // Priority 4: FreeToGame catalog
      for (const game of f2pList) {
        const norm = this.normalizeTitle(game.title);
        if (!uniqueMap.has(norm)) {
          uniqueMap.set(norm, { ...game });
        }
      }

      // Rebuild in-memory indexing
      this.games = Array.from(uniqueMap.values()).map(g => ({
        ...g,
        ratings: computeCrossWebRatings(g)
      }));
      this.gamesById.clear();
      this.gamesBySlug.clear();

      for (const game of this.games) {
        this.gamesById.set(game.id, game);
        if (game.slug) {
          this.gamesBySlug.set(game.slug, game);
        }
      }

      this.lastSync = new Date().toISOString();
      console.log(`[ApiAggregator] Sync complete. Total aggregated catalog: ${this.games.length} games.`);
    } catch (err) {
      console.error('[ApiAggregator] Sync error:', err);
    } finally {
      this.isSyncing = false;
    }
  }

  async init() {
    // Populate immediately with curated games and verified free games while external sync runs
    const initialSeed = [...curatedGames, ...fallbackFreeGames];
    for (const game of initialSeed) {
      const withRatings = { ...game, ratings: computeCrossWebRatings(game) };
      this.gamesById.set(game.id, withRatings);
      if (game.slug) this.gamesBySlug.set(game.slug, withRatings);
    }
    this.games = initialSeed.map(g => ({ ...g, ratings: computeCrossWebRatings(g) }));

    // Sync external APIs
    await this.syncAll();
  }

  async ensureInitialized() {
    if (!this.initPromise) {
      this.initPromise = this.init();
    }
    return this.initPromise;
  }

  getClassics(limit = 12) {
    return this.games
      .filter(g => g.is_classic || (g.release_date && parseInt(g.release_date.slice(0, 4), 10) < 2015 && g.rating >= 84))
      .sort((a, b) => {
        if (a.is_classic && !b.is_classic) return -1;
        if (!a.is_classic && b.is_classic) return 1;
        return (b.ratings?.average_rating || b.rating || 0) - (a.ratings?.average_rating || a.rating || 0);
      })
      .slice(0, limit);
  }

  getFeatured() {
    // Prefer curated high-production game like Cyberpunk 2077 or Elden Ring
    const featured = this.games.find(g => g.slug === 'cyberpunk-2077') ||
                     this.games.find(g => g.rating >= 90 && g.background_image) ||
                     this.games[0];
    return featured;
  }

  getTrending(limit = 12) {
    const isExcluded = (g) => {
      const lower = (g.title || '').toLowerCase();
      return lower.includes('wallpaper engine') || lower.includes('soundpad') || (g.genres && g.genres.includes('Utilities'));
    };
    const seen = new Set();
    return [...this.games]
      .filter(g => !isExcluded(g))
      .sort((a, b) => {
        const countA = Math.log10(Math.max(10, a.rating_count || 1000));
        const countB = Math.log10(Math.max(10, b.rating_count || 1000));
        const rateA = a.ratings?.average_rating || a.rating || 75;
        const rateB = b.ratings?.average_rating || b.rating || 75;
        const aaaBonusA = a.is_aaa ? 28 : 0;
        const aaaBonusB = b.is_aaa ? 28 : 0;
        // High-production games with rich screenshot galleries get cinematic precedence in trending
        const mediaBonusA = (a.screenshots && a.screenshots.length > 1) ? 12 : 0;
        const mediaBonusB = (b.screenshots && b.screenshots.length > 1) ? 12 : 0;
        const scoreA = (countA * 14) + rateA + aaaBonusA + mediaBonusA;
        const scoreB = (countB * 14) + rateB + aaaBonusB + mediaBonusB;
        return scoreB - scoreA;
      })
      .filter(g => {
        const cleanTitle = (g.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const key = cleanTitle.replace(/(remastered|phantomliberty|definitiveedition)/g, '');
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, limit);
  }

  getFree(limit = 12) {
    return this.games
      .filter(g => g.is_free || g.is_giveaway)
      .slice(0, limit);
  }

  getPaid(limit = 16) {
    return this.games
      .filter(g => !g.is_free && !g.is_giveaway)
      .sort((a, b) => {
        // Prioritize AAA and high Metacritic scores
        const scoreA = (a.is_aaa ? 50 : 0) + (a.rating || 0);
        const scoreB = (b.is_aaa ? 50 : 0) + (b.rating || 0);
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  getHiddenGems(limit = 10) {
    // High rating, slightly more indie or distinct tags, but not in top 3 mass-market
    return this.games
      .filter(g => {
        const isIndieOrStylized = g.tags.includes('Stylized') || g.tags.includes('Pixel Art') || g.tags.includes('Story Rich');
        return isIndieOrStylized && (g.rating >= 87 || g.rating_count < 150000);
      })
      .slice(0, limit);
  }

  getGenresSummary() {
    const GENRE_LIST = [
      { name: 'Action', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80' },
      { name: 'Adventure', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80' },
      { name: 'Racing', image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80' },
      { name: 'Horror', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80' },
      { name: 'RPG', image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80' },
      { name: 'Survival', image: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=600&q=80' },
      { name: 'Strategy', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80' },
      { name: 'Simulation', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80' }
    ];

    return GENRE_LIST.map(g => {
      const count = this.games.filter(game =>
        (game.genres || []).some(genre => genre.toLowerCase() === g.name.toLowerCase()) ||
        (game.tags || []).some(tag => tag.toLowerCase() === g.name.toLowerCase())
      ).length;

      return {
        ...g,
        count
      };
    });
  }

  getByGenre(genreName, limit = 20) {
    const target = genreName.toLowerCase();
    return this.games
      .filter(game =>
        (game.genres || []).some(g => g.toLowerCase() === target) ||
        (game.tags || []).some(t => t.toLowerCase() === target)
      )
      .slice(0, limit);
  }

  getRecommendations(userTags = [], limit = 16) {
    return rankGamesForUser(this.games, userTags, limit);
  }

  async getGameById(id) {
    let game = this.gamesById.get(id) || this.gamesBySlug.get(id);
    if (!game) return null;

    // Multi-source enrichment for screenshots, background, and logos
    const enriched = await enrichGameAssets(game);
    enriched.ratings = computeCrossWebRatings(enriched);
    this.gamesById.set(game.id, enriched);
    return enriched;
  }

  search({ q = '', genre = '', tag = '', is_free = '', hardware = '', sort = 'relevance', page = 1, limit = 24, userTags = [] }) {
    let results = [...this.games];

    // Filter by search query
    if (q && q.trim()) {
      const query = q.toLowerCase().trim();
      const normQuery = query.replace(/[^a-z0-9]/g, '');
      const terms = query.split(/\s+/).filter(Boolean);

      results = results.filter(game => {
        const titleLower = game.title.toLowerCase();
        const normTitle = titleLower.replace(/[^a-z0-9]/g, '');
        const descLower = (game.short_description || '').toLowerCase();
        const normDesc = descLower.replace(/[^a-z0-9]/g, '');
        const devLower = (game.developer || '').toLowerCase();

        // 1. Exact or normalized full match
        if (titleLower.includes(query) || normTitle.includes(normQuery)) return true;
        if (descLower.includes(query) || normDesc.includes(normQuery)) return true;
        if (devLower.includes(query)) return true;

        // 2. All words match title
        if (terms.length > 1 && terms.every(term => normTitle.includes(term.replace(/[^a-z0-9]/g, '')))) {
          return true;
        }

        // 3. Genre or Tag match
        const genreMatch = (game.genres || []).some(g => g.toLowerCase().includes(query));
        const tagMatch = (game.tags || []).some(t => t.toLowerCase().includes(query));
        return genreMatch || tagMatch;
      });
    }

    // Filter by genre
    if (genre && genre !== 'All') {
      const gLower = genre.toLowerCase();
      results = results.filter(game =>
        (game.genres || []).some(g => g.toLowerCase() === gLower) ||
        (game.tags || []).some(t => t.toLowerCase() === gLower)
      );
    }

    // Filter by specific tag
    if (tag && tag !== 'All') {
      const tLower = tag.toLowerCase();
      results = results.filter(game =>
        (game.tags || []).some(t => t.toLowerCase() === tLower) ||
        (game.genres || []).some(g => g.toLowerCase() === tLower) ||
        (game.gameplay_tags || []).some(gt => gt.toLowerCase() === tLower) ||
        (game.multiplayer_mode || []).some(m => m.toLowerCase() === tLower) ||
        (game.visual_style || []).some(v => v.toLowerCase() === tLower)
      );
    }

    // Filter by Free / Paid
    if (is_free === 'true') {
      results = results.filter(game => game.is_free || game.is_giveaway);
    } else if (is_free === 'false') {
      results = results.filter(game => !game.is_free && !game.is_giveaway);
    }

    // Filter by Hardware Tier
    if (hardware && hardware !== 'All') {
      results = results.filter(game => game.hardware_tier === hardware);
    }

    // Calculate match score for every game if userTags provided
    results = results.map(game => {
      const match = calculateMatch(game, userTags);
      return {
        ...game,
        matchScore: match.matchScore,
        matchedTags: match.matchedTags
      };
    });

    // Sorting
    switch (sort) {
      case 'rating':
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popularity':
        results.sort((a, b) => (b.rating_count || 0) - (a.rating_count || 0));
        break;
      case 'release_date':
        results.sort((a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0));
        break;
      case 'relevance':
      default:
        if (userTags && userTags.length > 0) {
          results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        } else {
          // Sort by combined score and popularity
          results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }
        break;
    }

    const total = results.length;
    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const startIndex = (pageNum - 1) * pageSize;
    const paginatedGames = results.slice(startIndex, startIndex + pageSize);

    return {
      games: paginatedGames,
      pagination: {
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }
}

export const aggregator = new ApiAggregator();

