import { config } from '../config.js';

const RAWG_BASE = 'https://api.rawg.io/api';

export async function fetchRawgGames(pageSize = 20) {
  if (!config.rawgApiKey) {
    return [];
  }

  try {
    const url = `${RAWG_BASE}/games?key=${config.rawgApiKey}&platforms=4&page_size=${pageSize}&ordering=-rating`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`RAWG HTTP ${res.status}`);
    const data = await res.json();

    return (data.results || []).map((item) => {
      const genres = (item.genres || []).map((g) => g.name);
      const tags = (item.tags || []).slice(0, 10).map((t) => t.name);

      return {
        id: `rawg-${item.id}`,
        original_id: item.id,
        slug: item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title: item.name,
        short_description: `Critically acclaimed ${genres.join(', ')} experience.`,
        description: '',
        genres: genres.length > 0 ? genres : ['Action'],
        tags: tags.length > 0 ? tags : ['Single Player', 'Action'],
        thumbnail: item.background_image,
        background_image: item.background_image,
        screenshots: (item.short_screenshots || []).map((s) => s.image),
        release_date: item.released || 'N/A',
        platforms: ['PC (Windows)'],
        rating: Math.round((item.rating || 4.2) * 20), // Convert to 100-scale
        rating_count: item.ratings_count || 1000,
        official_url: `https://rawg.io/games/${item.slug}`,
        is_free: false,
        developer: 'Various',
        publisher: 'Various',
        hardware_tier: 'Mid-Range PC',
        source: 'rawg'
      };
    });
  } catch (error) {
    console.warn('[RAWG] Error fetching games:', error.message);
    return [];
  }
}

export async function fetchRawgGameDetail(id) {
  if (!config.rawgApiKey) return null;
  try {
    const rawgId = String(id).replace('rawg-', '');
    const url = `${RAWG_BASE}/games/${rawgId}?key=${config.rawgApiKey}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      description: data.description_raw || data.description || '',
      official_url: data.website || `https://rawg.io/games/${data.slug}`,
      developer: (data.developers || []).map((d) => d.name).join(', ') || 'Unknown',
      publisher: (data.publishers || []).map((p) => p.name).join(', ') || 'Unknown'
    };
  } catch (err) {
    console.warn('[RAWG] Detail fetch failed:', err.message);
    return null;
  }
}

