import { fetchFreeToGameDetail } from './freetogame.js';
import { fetchRawgGameDetail } from './rawg.js';

// Cache for enriched game assets (appId, screenshots, high-res banners)
const assetCache = new Map();

// High-resolution genre fallback imagery matrix (1920x1080)
const GENRE_FALLBACK_SCREENSHOTS = {
  Action: [
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1920&q=80'
  ],
  RPG: [
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1920&q=80'
  ],
  Shooter: [
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=80'
  ],
  Racing: [
    'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1920&q=80'
  ],
  Horror: [
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80'
  ],
  Strategy: [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=80'
  ],
  Adventure: [
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=80'
  ],
  Survival: [
    'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80'
  ]
};

/**
 * Clean title by stripping giveaway, store, and platform parenthetical content
 */
function cleanTitleForSearch(title) {
  return (title || '')
    .replace(/\(.*?\)/g, '')
    .replace(/giveaway/gi, '')
    .replace(/free/gi, '')
    .replace(/bundle/gi, '')
    .replace(/loot/gi, '')
    .replace(/key/gi, '')
    .replace(/pack/gi, '')
    .replace(/DLC/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Directly fetch Steam App Details by AppID
 */
async function fetchSteamAppDetails(appId) {
  try {
    const detailsUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}`;
    const detailsRes = await fetch(detailsUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(6000)
    });

    if (!detailsRes.ok) return null;
    const detailsData = await detailsRes.json();
    const appData = detailsData[appId]?.data;

    if (!appData) return null;

    const screenshots = (appData.screenshots || []).map((s) => s.path_full || s.path_thumbnail);
    const bgImage = appData.background_raw || appData.background || appData.header_image;
    const logoUrl = `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/logo.png`;
    const headerImage = appData.header_image;

    return {
      screenshots: screenshots.length > 0 ? screenshots : null,
      background_image: bgImage || null,
      thumbnail: headerImage || null,
      logo: logoUrl,
      steam_app_id: appId,
      minimum_requirements: appData.pc_requirements?.minimum ? parseSteamRequirements(appData.pc_requirements.minimum) : null,
      recommended_requirements: appData.pc_requirements?.recommended ? parseSteamRequirements(appData.pc_requirements.recommended) : null
    };
  } catch (err) {
    console.warn(`[AssetEnricher] Direct Steam fetch failed for AppID ${appId}:`, err.message);
    return null;
  }
}

/**
 * Searches Steam public store API for rich screenshots, background art, and logos
 */
async function fetchSteamAssets(title) {
  try {
    const cleanTitle = cleanTitleForSearch(title);
    if (!cleanTitle || cleanTitle.length < 2) return null;

    const searchUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(cleanTitle)}&l=english&cc=US`;
    const searchRes = await fetch(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(5000)
    });

    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();

    if (!searchData.items || searchData.items.length === 0) return null;
    const appId = searchData.items[0].id;

    return await fetchSteamAppDetails(appId);
  } catch (err) {
    console.warn(`[AssetEnricher] Steam search failed for "${title}":`, err.message);
    return null;
  }
}

/**
 * Extracts clean OS, CPU, RAM, GPU from Steam html requirements string
 */
function parseSteamRequirements(htmlString) {
  if (!htmlString || typeof htmlString !== 'string') return null;
  const clean = htmlString.replace(/<[^>]*>?/gm, ' ');
  const extract = (regex) => {
    const match = clean.match(regex);
    return match ? match[1].trim() : null;
  };

  return {
    os: extract(/OS:\s*([^,;]+)/i) || null,
    processor: extract(/Processor:\s*([^,;]+)/i) || null,
    memory: extract(/Memory:\s*([^,;]+)/i) || null,
    graphics: extract(/Graphics:\s*([^,;]+)/i) || null,
    storage: extract(/Storage:\s*([^,;]+)/i) || null
  };
}

/**
 * Multi-source asset enricher:
 * 1. Checks direct Steam AppID if available (e.g. curated AAA titles)
 * 2. Checks FreeToGame detail API
 * 3. Checks Steam search API
 * 4. Checks RAWG API
 * 5. Fallbacks to high-res thematic genre matrix
 */
export async function enrichGameAssets(game) {
  if (!game) return game;

  // Check cache
  if (assetCache.has(game.id)) {
    return { ...game, ...assetCache.get(game.id) };
  }

  const enriched = { ...game };

  // SOURCE 0: Direct Steam App ID (Curated AAA Games)
  if (enriched.steam_app_id) {
    try {
      const steamData = await fetchSteamAppDetails(enriched.steam_app_id);
      if (steamData) {
        if (steamData.screenshots && steamData.screenshots.length > 0) {
          enriched.screenshots = steamData.screenshots;
        }
        if (steamData.background_image) {
          enriched.background_image = steamData.background_image;
        }
        if (steamData.logo) {
          enriched.logo = steamData.logo;
        }
        if (steamData.thumbnail) {
          enriched.thumbnail = steamData.thumbnail;
        }
        if (!enriched.minimum_requirements && steamData.minimum_requirements) {
          enriched.minimum_requirements = steamData.minimum_requirements;
        }
        if (!enriched.recommended_requirements && steamData.recommended_requirements) {
          enriched.recommended_requirements = steamData.recommended_requirements;
        }
      }
    } catch (e) {
      console.warn('[AssetEnricher] Direct Steam App ID enrichment error:', e.message);
    }
  }

  let needsScreenshots = !enriched.screenshots || enriched.screenshots.length <= 1;
  let needsBackground = !enriched.background_image || enriched.background_image === enriched.thumbnail;
  let needsLogo = !enriched.logo;

  // SOURCE 1: FreeToGame Detail API
  if (needsScreenshots && (enriched.source === 'freetogame' || enriched.original_id)) {
    try {
      const ftgDetail = await fetchFreeToGameDetail(enriched.id);
      if (ftgDetail) {
        if (ftgDetail.screenshots && ftgDetail.screenshots.length > 0) {
          enriched.screenshots = ftgDetail.screenshots;
          needsScreenshots = false;
        }
        if (ftgDetail.background_image) {
          enriched.background_image = ftgDetail.background_image;
          needsBackground = false;
        }
        if (ftgDetail.minimum_requirements && !enriched.minimum_requirements) {
          enriched.minimum_requirements = ftgDetail.minimum_requirements;
        }
        if (ftgDetail.description && (!enriched.description || enriched.description.length < 50)) {
          enriched.description = ftgDetail.description;
        }
      }
    } catch (e) {
      console.warn('[AssetEnricher] FTG detail failed:', e.message);
    }
  }

  // SOURCE 2: Steam Store API & CDN
  if (needsScreenshots || needsBackground || needsLogo) {
    try {
      const steamData = await fetchSteamAssets(enriched.title);
      if (steamData) {
        if (needsScreenshots && steamData.screenshots) {
          enriched.screenshots = steamData.screenshots;
          needsScreenshots = false;
        }
        if (needsBackground && steamData.background_image) {
          enriched.background_image = steamData.background_image;
          needsBackground = false;
        }
        if (steamData.logo) {
          enriched.logo = steamData.logo;
          needsLogo = false;
        }
        if (!enriched.thumbnail && steamData.thumbnail) {
          enriched.thumbnail = steamData.thumbnail;
        }
        if (!enriched.minimum_requirements && steamData.minimum_requirements) {
          enriched.minimum_requirements = steamData.minimum_requirements;
        }
        if (!enriched.recommended_requirements && steamData.recommended_requirements) {
          enriched.recommended_requirements = steamData.recommended_requirements;
        }
      }
    } catch (e) {
      console.warn('[AssetEnricher] Steam lookup error:', e.message);
    }
  }

  // SOURCE 3: RAWG API
  if (needsScreenshots && enriched.source === 'rawg') {
    try {
      const rawgDetail = await fetchRawgGameDetail(enriched.id);
      if (rawgDetail) {
        if (rawgDetail.description && !enriched.description) {
          enriched.description = rawgDetail.description;
        }
      }
    } catch (e) {
      console.warn('[AssetEnricher] RAWG detail error:', e.message);
    }
  }

  // SOURCE 4: Genre Fallback Matrix
  // If screenshots are still missing, provide verified high-res 1920x1080 cinematic imagery for that genre
  if (!enriched.screenshots || enriched.screenshots.length === 0) {
    const primaryGenre = (enriched.genres && enriched.genres[0]) || 'Action';
    const fallbackScreenshots = GENRE_FALLBACK_SCREENSHOTS[primaryGenre] || GENRE_FALLBACK_SCREENSHOTS.Action;
    enriched.screenshots = fallbackScreenshots;
  }

  if (!enriched.background_image) {
    enriched.background_image = enriched.screenshots[0];
  }

  // Cache enriched result
  assetCache.set(game.id, {
    screenshots: enriched.screenshots,
    background_image: enriched.background_image,
    thumbnail: enriched.thumbnail,
    logo: enriched.logo,
    minimum_requirements: enriched.minimum_requirements,
    recommended_requirements: enriched.recommended_requirements
  });

  return enriched;
}
