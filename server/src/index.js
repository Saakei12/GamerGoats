import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import gamesRouter from './routes/games.js';
import sitemapRouter from './routes/sitemap.js';
import { aggregator } from './services/apiAggregator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

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

// Serve frontend static build in production
app.use(express.static(clientDistPath));

// Fallback to React index.html for Single Page Application client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/sitemap.xml' || req.path === '/robots.txt') {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) next();
  });
});

// Scheduled sync
setInterval(() => {
  aggregator.syncAll().catch(err => console.error('[Cron] Sync failed:', err));
}, config.syncIntervalMs);

// Start server and initialize aggregator
async function startServer() {
  await aggregator.init();

  if (process.env.NODE_ENV !== 'test') {
    app.listen(config.port, () => {
      console.log(`[GamerGoats] Server running on http://localhost:${config.port}`);
    });
  }
}

// Ensure aggregator initializes for both standalone and serverless environments
aggregator.init().catch(err => console.error('[Aggregator] Init failed:', err));

startServer().catch(err => {
  console.error('Failed to start server:', err);
});

export default app;

