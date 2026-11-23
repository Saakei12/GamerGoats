import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  rawgApiKey: process.env.RAWG_API_KEY || '',
  cacheTtlMs: 1000 * 60 * 60 * 6, // 6 hours
  syncIntervalMs: 1000 * 60 * 60 * 12, // 12 hours scheduled auto-sync
};

