export interface SystemRequirements {
  os?: string;
  processor?: string;
  memory?: string;
  graphics?: string;
  storage?: string;
}

export interface RatingBreakdown {
  metacritic: number;        // e.g. 96 (out of 100)
  steam_score: number;       // e.g. 97 (% positive)
  steam_sentiment: string;   // e.g. 'Overwhelmingly Positive'
  ign: number;               // e.g. 9.5 (out of 10)
  opencritic: number;        // e.g. 95 (out of 100)
  community_score: number;   // e.g. 94 (out of 100)
  average_rating: number;    // e.g. 96 (Weighted cross-web aggregate score out of 100)
  review_count: number;      // e.g. 620,000+ total reviews
}

export interface Game {
  id: string;
  original_id?: number | string;
  slug: string;
  title: string;
  short_description: string;
  description?: string;
  genres: string[];
  tags: string[];
  gameplay_tags?: string[];
  multiplayer_mode?: string[];
  visual_style?: string[];
  hardware_tier?: 'Low-End PC' | 'Mid-Range PC' | 'High-End PC';
  thumbnail: string;
  background_image?: string;
  logo?: string;
  screenshots?: string[];
  release_date: string;
  platforms: string[];
  rating: number; // 0 - 100
  rating_count?: number;
  ratings?: RatingBreakdown;
  is_classic?: boolean;
  official_url: string;
  is_free: boolean;
  price?: string;
  is_aaa?: boolean;
  is_giveaway?: boolean;
  giveaway_url?: string;
  giveaway_worth?: string;
  instructions?: string;
  developer: string;
  publisher: string;
  minimum_requirements?: SystemRequirements | null;
  recommended_requirements?: SystemRequirements | null;
  source: 'freetogame' | 'gamerpower' | 'rawg' | 'curated';
  matchScore?: number;
  matchedTags?: string[];
}

export interface TagCategories {
  GENRE: string[];
  GAMEPLAY: string[];
  MULTIPLAYER: string[];
  VISUAL_STYLE: string[];
  PERFORMANCE: string[];
}

export interface SearchResponse {
  games: Game[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GenreItem {
  name: string;
  image: string;
  count: number;
}

