import type { Game, GenreItem, SearchResponse, TagCategories } from '../types/game';

const API_BASE = (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/games` : '/api/games');

export async function fetchFeaturedGame(): Promise<Game | null> {
  try {
    const res = await fetch(`${API_BASE}/featured`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch featured game:', err);
    return null;
  }
}

export async function fetchTrendingGames(limit = 10): Promise<Game[]> {
  try {
    const res = await fetch(`${API_BASE}/trending?limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch trending games:', err);
    return [];
  }
}

const EMERGENCY_FREE_GAMES: Game[] = [
  {
    id: 'curated-cs2',
    slug: 'counter-strike-2',
    title: 'Counter-Strike 2',
    short_description: 'For over two decades, Counter-Strike has offered an elite competitive experience, one shaped by millions of players worldwide.',
    genres: ['Shooter', 'Action'],
    tags: ['FPS', 'Shooter', 'Competitive', 'Online Multiplayer', 'PvP', 'Action', 'Free to Play'],
    thumbnail: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/header.jpg',
    background_image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/ss_e1da629e4b6c31cae9a0e676d498aa255ca8a4cf.1920x1080.jpg',
    release_date: '2023-09-27',
    platforms: ['PC (Windows)'],
    rating: 88,
    is_free: true,
    developer: 'Valve',
    publisher: 'Valve',
    source: 'curated',
    official_url: 'https://store.steampowered.com/app/730/CounterStrike_2/'
  },
  {
    id: 'curated-dota-2',
    slug: 'dota-2',
    title: 'Dota 2',
    short_description: 'Every day, millions of players worldwide enter battle as one of over a hundred Dota heroes in competitive 5v5 MOBA action.',
    genres: ['Strategy', 'Action', 'RPG'],
    tags: ['MOBA', 'Strategy', 'Competitive', 'Online Multiplayer', 'PvP', 'Co-op', 'Free to Play'],
    thumbnail: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/570/header.jpg',
    background_image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/570/ss_891e4a3c26ea680ce6ecda34bf385b2e6fbfa4fb.1920x1080.jpg',
    release_date: '2013-07-09',
    platforms: ['PC (Windows)', 'Mac'],
    rating: 90,
    is_free: true,
    developer: 'Valve',
    publisher: 'Valve',
    source: 'curated',
    official_url: 'https://store.steampowered.com/app/570/Dota_2/'
  },
  {
    id: 'curated-apex-legends',
    slug: 'apex-legends',
    title: 'Apex Legends',
    short_description: 'Conquer with character in Apex Legends, a free-to-play Hero shooter where legendary characters with powerful abilities team up.',
    genres: ['Shooter', 'Action'],
    tags: ['Battle Royale', 'Hero Shooter', 'FPS', 'Online Multiplayer', 'PvP', 'Co-op', 'Free to Play'],
    thumbnail: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1172470/header.jpg',
    background_image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1172470/ss_072dfec5344cba3ebf9c3ff2e032d849dfb3e404.1920x1080.jpg',
    release_date: '2020-11-04',
    platforms: ['PC (Windows)'],
    rating: 88,
    is_free: true,
    developer: 'Respawn Entertainment',
    publisher: 'Electronic Arts',
    source: 'curated',
    official_url: 'https://store.steampowered.com/app/1172470/Apex_Legends/'
  },
  {
    id: 'curated-warframe',
    slug: 'warframe',
    title: 'Warframe',
    short_description: 'Awaken as an unstoppable warrior and battle alongside your friends in this story-driven free-to-play action MMORPG.',
    genres: ['Action', 'RPG'],
    tags: ['Action RPG', 'Third-Person Shooter', 'Co-op', 'Sci-Fi', 'Free to Play', 'Online Multiplayer'],
    thumbnail: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/230410/header.jpg',
    background_image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/230410/ss_f73d2ff9ce959aa3891404c00067c296ef137f84.1920x1080.jpg',
    release_date: '2013-03-25',
    platforms: ['PC (Windows)'],
    rating: 86,
    is_free: true,
    developer: 'Digital Extremes',
    publisher: 'Digital Extremes',
    source: 'curated',
    official_url: 'https://store.steampowered.com/app/230410/Warframe/'
  },
  {
    id: 'curated-tf2',
    slug: 'team-fortress-2',
    title: 'Team Fortress 2',
    short_description: 'Nine distinct classes provide a broad range of tactical abilities and personalities in this celebrated free-to-play team shooter.',
    genres: ['Shooter', 'Action'],
    tags: ['Hero Shooter', 'FPS', 'Classic', 'Co-op', 'Online Multiplayer', 'PvP', 'Free to Play'],
    thumbnail: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/440/header.jpg',
    background_image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/440/ss_91e028b030b42f618a80d56574caab161eef3dc9.1920x1080.jpg',
    release_date: '2007-10-10',
    platforms: ['PC (Windows)', 'Mac'],
    rating: 92,
    is_free: true,
    developer: 'Valve',
    publisher: 'Valve',
    source: 'curated',
    official_url: 'https://store.steampowered.com/app/440/Team_Fortress_2/'
  },
  {
    id: 'curated-pubg',
    slug: 'pubg-battlegrounds',
    title: 'PUBG: BATTLEGROUNDS',
    short_description: 'Land on strategic locations, loot weapons and supplies, and survive to become the last team standing across diverse Battlegrounds.',
    genres: ['Shooter', 'Action'],
    tags: ['Battle Royale', 'Shooter', 'Survival', 'PvP', 'Online Multiplayer', 'Co-op', 'Free to Play'],
    thumbnail: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/578080/header.jpg',
    background_image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/578080/ss_752a926a8d790757753443a7a97262ff252875c7.1920x1080.jpg',
    release_date: '2017-12-21',
    platforms: ['PC (Windows)'],
    rating: 80,
    is_free: true,
    developer: 'KRAFTON, Inc.',
    publisher: 'KRAFTON, Inc.',
    source: 'curated',
    official_url: 'https://store.steampowered.com/app/578080/PUBG_BATTLEGROUNDS/'
  }
];

export async function fetchFreeGames(limit = 12): Promise<Game[]> {
  try {
    const res = await fetch(`${API_BASE}/free?limit=${limit}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.error('Failed to fetch free games:', err);
  }

  // Fault-tolerant secondary fallback if external API is slow or cold-starting
  try {
    const searchRes = await fetch(`${API_BASE}/search?tag=Free to Play&limit=${limit}`);
    if (searchRes.ok) {
      const data = await searchRes.json();
      if (Array.isArray(data?.games) && data.games.length > 0) {
        return data.games;
      }
    }
  } catch {}

  return EMERGENCY_FREE_GAMES.slice(0, limit);
}

export async function fetchPaidGames(limit = 16): Promise<Game[]> {
  try {
    const res = await fetch(`${API_BASE}/paid?limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch paid games:', err);
    return [];
  }
}

export async function fetchClassicGames(limit = 12): Promise<Game[]> {
  try {
    const res = await fetch(`${API_BASE}/classics?limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch classic games:', err);
    return [];
  }
}

export async function fetchHiddenGems(limit = 10): Promise<Game[]> {
  try {
    const res = await fetch(`${API_BASE}/hidden-gems?limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch hidden gems:', err);
    return [];
  }
}

export async function fetchGenres(): Promise<GenreItem[]> {
  try {
    const res = await fetch(`${API_BASE}/genres`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch genres:', err);
    return [];
  }
}

export async function fetchGamesByGenre(genre: string, limit = 24): Promise<Game[]> {
  try {
    const res = await fetch(`${API_BASE}/genre/${encodeURIComponent(genre)}?limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch games for genre ${genre}:`, err);
    return [];
  }
}

export async function fetchRecommendations(userTags: string[], limit = 16): Promise<Game[]> {
  try {
    const res = await fetch(`${API_BASE}/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: userTags, limit })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.recommendations || [];
  } catch (err) {
    console.error('Failed to fetch recommendations:', err);
    return [];
  }
}

export async function searchGames(params: {
  q?: string;
  genre?: string;
  tag?: string;
  is_free?: string;
  hardware?: string;
  sort?: string;
  page?: number;
  limit?: number;
  tags?: string[];
}): Promise<SearchResponse> {
  try {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.genre) query.set('genre', params.genre);
    if (params.tag) query.set('tag', params.tag);
    if (params.is_free) query.set('is_free', params.is_free);
    if (params.hardware) query.set('hardware', params.hardware);
    if (params.sort) query.set('sort', params.sort);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.tags && params.tags.length > 0) query.set('tags', params.tags.join(','));

    const res = await fetch(`${API_BASE}/search?${query.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Search failed:', err);
    return {
      games: [],
      pagination: { total: 0, page: 1, limit: 24, totalPages: 0 }
    };
  }
}

export async function fetchGameDetail(id: string): Promise<Game | null> {
  try {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch game detail for ${id}:`, err);
    return null;
  }
}

export async function fetchTags(): Promise<{ categories: TagCategories; allTags: string[] }> {
  try {
    const res = await fetch(`${API_BASE}/tags`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch tags:', err);
    return {
      categories: {
        GENRE: ['Action', 'Adventure', 'Racing', 'Horror', 'RPG', 'Strategy', 'Simulation', 'Sports', 'Shooter'],
        GAMEPLAY: ['Open World', 'Survival', 'Story Rich', 'Stealth', 'Exploration', 'Sandbox'],
        MULTIPLAYER: ['Single Player', 'Co-op', 'PvP', 'Online Multiplayer'],
        VISUAL_STYLE: ['Realistic', 'Pixel Art', 'Anime', 'Stylized'],
        PERFORMANCE: ['Low-End PC', 'Mid-Range PC', 'High-End PC']
      },
      allTags: []
    };
  }
}
