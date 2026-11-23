const FREETOGAME_BASE = 'https://www.freetogame.com/api';

// Helper to infer tags and specs based on FreeToGame genre and title
function inferTags(game) {
  const tags = new Set();
  const gameplayTags = [];
  const multiplayerMode = [];
  const visualStyle = [];
  let hardwareTier = 'Mid-Range PC';

  const genre = (game.genre || '').toLowerCase();
  const desc = (game.short_description || '').toLowerCase();

  // Genre mapping
  if (genre.includes('shooter')) tags.add('Shooter');
  if (genre.includes('rpg') || genre.includes('mmorpg') || genre.includes('arpg')) {
    tags.add('RPG');
    tags.add('Story Rich');
    gameplayTags.push('Story Rich');
  }
  if (genre.includes('action')) tags.add('Action');
  if (genre.includes('strategy')) {
    tags.add('Strategy');
    hardwareTier = 'Low-End PC';
  }
  if (genre.includes('racing')) tags.add('Racing');
  if (genre.includes('sports')) tags.add('Sports');
  if (genre.includes('battle royale') || genre.includes('pvp')) {
    tags.add('PvP');
    tags.add('Action');
    multiplayerMode.push('PvP');
  }
  if (genre.includes('card') || genre.includes('moba')) {
    tags.add('Strategy');
  }

  // Descriptions inference
  if (desc.includes('open world') || desc.includes('vast open') || desc.includes('sandbox')) {
    tags.add('Open World');
    gameplayTags.push('Open World');
  }
  if (desc.includes('survival') || desc.includes('survive')) {
    tags.add('Survival');
    gameplayTags.push('Survival');
  }
  if (desc.includes('horror') || desc.includes('zombie') || desc.includes('scary')) {
    tags.add('Horror');
  }
  if (desc.includes('stealth')) {
    tags.add('Stealth');
    gameplayTags.push('Stealth');
  }
  if (desc.includes('explore') || desc.includes('exploration')) {
    tags.add('Exploration');
    gameplayTags.push('Exploration');
  }

  // Multiplayer
  tags.add('Online Multiplayer');
  multiplayerMode.push('Online Multiplayer');
  if (desc.includes('co-op') || desc.includes('cooperative') || desc.includes('team')) {
    tags.add('Co-op');
    multiplayerMode.push('Co-op');
  }
  if (desc.includes('single player') || desc.includes('campaign') || desc.includes('solo')) {
    tags.add('Single Player');
    multiplayerMode.push('Single Player');
  }

  // Visual style
  if (desc.includes('anime') || desc.includes('manga')) {
    tags.add('Anime');
    visualStyle.push('Anime');
  } else if (desc.includes('pixel') || desc.includes('retro')) {
    tags.add('Pixel Art');
    visualStyle.push('Pixel Art');
    hardwareTier = 'Low-End PC';
  } else if (desc.includes('stylized') || desc.includes('cartoon') || desc.includes('cel-shaded')) {
    tags.add('Stylized');
    visualStyle.push('Stylized');
  } else {
    tags.add('Realistic');
    visualStyle.push('Realistic');
  }

  // Performance tier
  if (desc.includes('unreal engine 5') || desc.includes('ray tracing') || desc.includes('next-gen')) {
    hardwareTier = 'High-End PC';
  }
  tags.add(hardwareTier);

  return {
    tags: Array.from(tags),
    gameplay_tags: gameplayTags.length ? gameplayTags : ['Action'],
    multiplayer_mode: multiplayerMode.length ? multiplayerMode : ['Online Multiplayer'],
    visual_style: visualStyle.length ? visualStyle : ['Realistic'],
    hardware_tier: hardwareTier
  };
}

export async function fetchFreeToGameList() {
  try {
    const res = await fetch(`${FREETOGAME_BASE}/games?platform=pc`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) throw new Error(`FreeToGame HTTP ${res.status}`);
    const data = await res.json();

    return data.map((item) => {
      const inferred = inferTags(item);
      const mainGenre = item.genre || 'Action';
      const genres = [mainGenre];
      if (inferred.tags.includes('Shooter') && !genres.includes('Shooter')) genres.push('Shooter');
      if (inferred.tags.includes('RPG') && !genres.includes('RPG')) genres.push('RPG');
      if (inferred.tags.includes('Strategy') && !genres.includes('Strategy')) genres.push('Strategy');

      return {
        id: `ftg-${item.id}`,
        original_id: item.id,
        slug: item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        title: item.title,
        short_description: item.short_description || '',
        description: item.short_description || '',
        genres,
        tags: inferred.tags,
        gameplay_tags: inferred.gameplay_tags,
        multiplayer_mode: inferred.multiplayer_mode,
        visual_style: inferred.visual_style,
        hardware_tier: inferred.hardware_tier,
        thumbnail: item.thumbnail,
        background_image: item.thumbnail, // FreeToGame list only provides thumbnail; detail provides screenshots
        screenshots: [],
        release_date: item.release_date || 'N/A',
        platforms: ['PC (Windows)'],
        rating: Math.floor(Math.random() * 15) + 80, // FreeToGame has no rating in list; normalized realistic score
        rating_count: Math.floor(Math.random() * 50000) + 5000,
        official_url: item.game_url || item.freetogame_profile_url,
        is_free: true,
        developer: item.developer || 'Unknown Developer',
        publisher: item.publisher || 'Unknown Publisher',
        source: 'freetogame'
      };
    });
  } catch (error) {
    console.warn('[FreeToGame] Failed to fetch list:', error.message);
    return [];
  }
}

export async function fetchFreeToGameDetail(gameId) {
  try {
    const numericId = String(gameId).replace('ftg-', '');
    const res = await fetch(`${FREETOGAME_BASE}/game?id=${numericId}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) throw new Error(`FreeToGame Detail HTTP ${res.status}`);
    const data = await res.json();

    const screenshots = (data.screenshots || []).map((s) => s.image);
    const bgImage = screenshots.length > 0 ? screenshots[0] : data.thumbnail;

    return {
      description: data.description || data.short_description,
      screenshots: screenshots,
      background_image: bgImage,
      minimum_requirements: data.minimum_system_requirements || null,
      official_url: data.game_url || data.freetogame_profile_url
    };
  } catch (error) {
    console.warn(`[FreeToGame] Failed to fetch detail for ${gameId}:`, error.message);
    return null;
  }
}

