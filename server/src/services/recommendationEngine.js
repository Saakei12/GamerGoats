export const ALL_TAG_CATEGORIES = {
  GENRE: [
    'Action', 'Adventure', 'Racing', 'Horror', 'RPG',
    'Strategy', 'Simulation', 'Sports', 'Shooter'
  ],
  GAMEPLAY: [
    'Open World', 'Survival', 'Story Rich', 'Stealth',
    'Exploration', 'Sandbox'
  ],
  MULTIPLAYER: [
    'Single Player', 'Co-op', 'PvP', 'Online Multiplayer'
  ],
  VISUAL_STYLE: [
    'Realistic', 'Pixel Art', 'Anime', 'Stylized'
  ],
  PERFORMANCE: [
    'Low-End PC', 'Mid-Range PC', 'High-End PC'
  ]
};

// Flatten all tags for quick reference
export const ALL_AVAILABLE_TAGS = Object.values(ALL_TAG_CATEGORIES).flat();

/**
 * Calculates a match score between user tags and a game,
 * with the game's cross-web rating acting as a foundational base pillar.
 * Returns an object with matchScore (0 - 99) and matchedTags array.
 */
export function calculateMatch(game, userTags = []) {
  // Extract effective cross-platform average rating
  const effectiveRating = game.ratings?.average_rating || game.rating || 75;

  if (!userTags || userTags.length === 0) {
    // Default baseline when no preference tags are selected:
    // Purely driven by the game's cross-web quality rating
    const baseScore = Math.min(98, Math.max(65, Math.round(effectiveRating * 0.96)));
    return {
      matchScore: baseScore,
      matchedTags: []
    };
  }

  // Build normalized game tag set
  const gameTagSet = new Set();
  const addTags = (items) => {
    if (!items) return;
    if (Array.isArray(items)) {
      items.forEach(t => t && gameTagSet.add(t.toLowerCase().trim()));
    } else if (typeof items === 'string') {
      gameTagSet.add(items.toLowerCase().trim());
    }
  };

  addTags(game.genres);
  addTags(game.tags);
  addTags(game.gameplay_tags);
  addTags(game.multiplayer_mode);
  addTags(game.visual_style);
  addTags(game.hardware_tier);

  // Normalize user tags
  const matched = [];
  userTags.forEach(ut => {
    const normalizedUt = ut.toLowerCase().trim();
    if (gameTagSet.has(normalizedUt)) {
      matched.push(ut);
    } else {
      // Fuzzy / partial match e.g. "shooter" in "mmo shooter"
      for (const gt of gameTagSet) {
        if (gt.includes(normalizedUt) || normalizedUt.includes(gt)) {
          matched.push(ut);
          break;
        }
      }
    }
  });

  const matchedCount = matched.length;
  const totalUserTags = userTags.length;

  // FOUNDATIONAL WEIGHT FORMULA:
  // 1. Tag Coverage Component (up to 50 points): User preference alignment
  const coverageRatio = matchedCount / Math.max(1, totalUserTags);
  const tagPoints = coverageRatio * 50;

  // 2. Cross-Web Rating Component (up to 40 points): Web-wide critic & player quality
  const ratingNormalized = effectiveRating / 100;
  const ratingPoints = ratingNormalized * 40;

  // 3. Universal Acclaim & Masterpiece Tier Bonus (up to 6 points)
  let acclaimBonus = 0;
  if (effectiveRating >= 94) {
    acclaimBonus = 6;
  } else if (effectiveRating >= 90) {
    acclaimBonus = 4;
  } else if (effectiveRating >= 84) {
    acclaimBonus = 2;
  }

  // 4. Multi-Category Synergy Bonus (up to 4 points)
  const categoryBonus = matchedCount > 2 ? 4 : matchedCount > 0 ? 2 : 0;

  let finalScore = Math.round(tagPoints + ratingPoints + acclaimBonus + categoryBonus);

  // Clamp score between 40% and 99%
  if (matchedCount === 0) {
    finalScore = Math.min(65, Math.max(35, Math.round((effectiveRating / 100) * 60)));
  } else {
    finalScore = Math.min(99, Math.max(55, finalScore));
  }

  return {
    matchScore: finalScore,
    matchedTags: matched
  };
}

/**
 * Recommends games tailored to user's tags, strongly prioritizing
 * high-rated masterpieces matching user preferences.
 */
export function rankGamesForUser(games, userTags = [], limit = 20) {
  const scoredGames = games.map(game => {
    const { matchScore, matchedTags } = calculateMatch(game, userTags);
    const effectiveRating = game.ratings?.average_rating || game.rating || 75;
    return {
      ...game,
      matchScore,
      matchedTags,
      effectiveRating
    };
  });

  // Dual-Pillar Sorting:
  // 60% weight to user preference match + 40% weight to cross-web rating consensus
  scoredGames.sort((a, b) => {
    const compositeA = (a.matchScore * 0.60) + (a.effectiveRating * 0.40);
    const compositeB = (b.matchScore * 0.60) + (b.effectiveRating * 0.40);

    if (Math.abs(compositeB - compositeA) > 0.5) {
      return compositeB - compositeA;
    }
    // Secondary tie-breaker: raw rating
    return b.effectiveRating - a.effectiveRating;
  });

  return scoredGames.slice(0, limit);
}

