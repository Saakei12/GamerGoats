import { Router } from 'express';
import { aggregator } from '../services/apiAggregator.js';
import { ALL_TAG_CATEGORIES, ALL_AVAILABLE_TAGS } from '../services/recommendationEngine.js';

const router = Router();

// Get tag categories
router.get('/tags', (req, res) => {
  res.json({
    categories: ALL_TAG_CATEGORIES,
    allTags: ALL_AVAILABLE_TAGS
  });
});

// Featured hero game
router.get('/featured', (req, res) => {
  const game = aggregator.getFeatured();
  if (!game) return res.status(404).json({ error: 'No featured game found' });
  res.json(game);
});

// Trending games
router.get('/trending', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const games = aggregator.getTrending(limit);
  res.json(games);
});

// Free to play & giveaways
router.get('/free', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 12;
  const games = aggregator.getFree(limit);
  res.json(games);
});

// Top Paid & AAA Blockbusters
router.get('/paid', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 16;
  const games = aggregator.getPaid(limit);
  res.json(games);
});

// All-Time PC Classics & Retro Masterpieces
router.get('/classics', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 12;
  const games = aggregator.getClassics(limit);
  res.json(games);
});

// Hidden gems
router.get('/hidden-gems', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const games = aggregator.getHiddenGems(limit);
  res.json(games);
});

// Genres overview
router.get('/genres', (req, res) => {
  const genres = aggregator.getGenresSummary();
  res.json(genres);
});

// Games by genre
router.get('/genre/:genre', (req, res) => {
  const { genre } = req.params;
  const limit = parseInt(req.query.limit, 10) || 20;
  const games = aggregator.getByGenre(genre, limit);
  res.json(games);
});

// Personalized recommendations
router.post('/recommendations', (req, res) => {
  const { tags = [], limit = 16 } = req.body;
  const games = aggregator.getRecommendations(tags, limit);
  res.json({
    tags,
    count: games.length,
    recommendations: games
  });
});

// Search and filter
router.get('/search', (req, res) => {
  const {
    q = '',
    genre = '',
    tag = '',
    is_free = '',
    hardware = '',
    sort = 'relevance',
    page = 1,
    limit = 24,
    tags = ''
  } = req.query;

  const userTags = tags ? tags.split(',').filter(Boolean) : [];

  const result = aggregator.search({
    q,
    genre,
    tag,
    is_free,
    hardware,
    sort,
    page,
    limit,
    userTags
  });

  res.json(result);
});

// Game detail by ID or Slug
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const game = await aggregator.getGameById(id);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  res.json(game);
});

// Trigger sync
router.post('/sync', async (req, res) => {
  try {
    await aggregator.syncAll();
    res.json({ success: true, message: 'Sync complete', lastSync: aggregator.lastSync });
  } catch (err) {
    res.status(500).json({ error: 'Sync failed', details: err.message });
  }
});

export default router;

