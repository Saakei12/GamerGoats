import type { Game, GenreItem, SearchResponse, TagCategories } from '../types/game';

const API_BASE = '/api/games';

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

export async function fetchFreeGames(limit = 12): Promise<Game[]> {
  try {
    const res = await fetch(`${API_BASE}/free?limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch free games:', err);
    return [];
  }
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
