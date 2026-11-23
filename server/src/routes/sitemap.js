import express from 'express';
import { aggregator } from '../services/apiAggregator.js';

const router = express.Router();

/**
 * Dynamic XML Sitemap for Google Search Engine indexing
 */
router.get('/sitemap.xml', (req, res) => {
  const host = req.get('host') || 'localhost:5000';
  const protocol = req.protocol || 'http';
  const siteUrl = process.env.SITE_URL || 'https://gamergoats.com';
  const now = new Date().toISOString().split('T')[0];

  const staticUrls = [
    { loc: `${siteUrl}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${siteUrl}/categories`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${siteUrl}/paid-games`, priority: '0.9', changefreq: 'daily' },
    { loc: `${siteUrl}/free-games`, priority: '0.9', changefreq: 'daily' },
    { loc: `${siteUrl}/search`, priority: '0.8', changefreq: 'daily' }
  ];

  const games = aggregator.games || [];
  const gameUrls = games.map((g) => ({
    loc: `${siteUrl}/game/${g.slug || g.id}`,
    lastmod: now,
    changefreq: 'weekly',
    priority: g.is_aaa ? '0.9' : '0.8',
    image: g.background_image || g.thumbnail || '',
    title: g.title
  }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
${gameUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${
      u.image
        ? `\n    <image:image>
      <image:loc>${u.image.replace(/&/g, '&amp;')}</image:loc>
      <image:title>${u.title.replace(/&/g, '&amp;')}</image:title>
    </image:image>`
        : ''
    }
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.header('Content-Type', 'application/xml; charset=utf-8');
  res.send(xml);
});

/**
 * Robots.txt for search engine crawlers
 */
router.get('/robots.txt', (req, res) => {
  const siteUrl = process.env.SITE_URL || 'https://gamergoats.com';
  const robots = `# GamerGoats Robots.txt for Google Search Engine and Web Crawlers
User-agent: *
Allow: /

# Sitemap Index
Sitemap: ${siteUrl}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain; charset=utf-8');
  res.send(robots);
});

export default router;

