import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import gamesRouter from './routes/games.js';
import sitemapRouter from './routes/sitemap.js';
import { aggregator } from './services/apiAggregator.js';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/', sitemapRouter);
app.use('/api/games', gamesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'GamerGoats API Service',
    totalGames: aggregator.games.length,
    lastSync: aggregator.lastSync,
    uptime: process.uptime()
  });
});

// Scheduled sync
setInterval(() => {
  aggregator.syncAll().catch(err => console.error('[Cron] Sync failed:', err));
}, config.syncIntervalMs);

// Start server and initialize aggregator
async function startServer() {
  await aggregator.init();

  app.listen(config.port, () => {
    console.log(`[GamerGoats] Server running on http://localhost:${config.port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

