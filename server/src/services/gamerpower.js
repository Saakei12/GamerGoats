const GAMERPOWER_BASE = 'https://www.gamerpower.com/api';

export async function fetchGamerPowerGiveaways() {
  try {
    const res = await fetch(`${GAMERPOWER_BASE}/giveaways?platform=pc`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) throw new Error(`GamerPower HTTP ${res.status}`);
    const data = await res.json();

    if (!Array.isArray(data)) return [];

    return data
      .filter((item) => item.type === 'Game' || item.type === 'Early Access' || item.type === 'Full Game')
      .slice(0, 40) // Pick top active giveaways
      .map((item) => {
        const title = item.title || 'Unknown Title';
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        return {
          id: `gp-${item.id}`,
          original_id: item.id,
          slug,
          title,
          short_description: item.description ? item.description.slice(0, 180) + '...' : 'Free game giveaway.',
          description: item.description || '',
          genres: ['Action', 'Adventure'],
          tags: ['Single Player', 'Action', 'Mid-Range PC'],
          gameplay_tags: ['Exploration'],
          multiplayer_mode: ['Single Player'],
          visual_style: ['Realistic'],
          hardware_tier: 'Mid-Range PC',
          thumbnail: item.thumbnail || item.image,
          background_image: item.image || item.thumbnail,
          screenshots: item.image ? [item.image] : [],
          release_date: item.published_date || 'Active',
          platforms: [item.platforms || 'PC (Windows)'],
          rating: 85,
          rating_count: 12000,
          official_url: item.open_giveaway_url || item.gamerpower_url,
          is_free: true,
          is_giveaway: true,
          giveaway_url: item.open_giveaway_url,
          giveaway_worth: item.worth || 'Free',
          instructions: item.instructions || '',
          developer: 'Various',
          publisher: 'Various',
          source: 'gamerpower'
        };
      });
  } catch (error) {
    console.warn('[GamerPower] Failed to fetch giveaways:', error.message);
    return [];
  }
}

