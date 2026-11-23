import express from 'express';
import { aggregator } from '../services/apiAggregator.js';

const router = express.Router();

function escapeXml(unsafe) {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Dynamic XML Sitemap for Google Search Engine indexing
 * Official Production Domain: https://gamergoats.online
 */
router.get('/sitemap.xml', (req, res) => {
  const siteUrl = process.env.SITE_URL || 'https://gamergoats.online';
  const now = new Date().toISOString().split('T')[0];

  const staticUrls = [
    { loc: `${siteUrl}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${siteUrl}/categories`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${siteUrl}/paid-games`, priority: '0.9', changefreq: 'daily' },
    { loc: `${siteUrl}/free-games`, priority: '0.9', changefreq: 'daily' },
    { loc: `${siteUrl}/search`, priority: '0.8', changefreq: 'daily' }
  ];

  const categoryGenres = [
    'Action', 'Adventure', 'RPG', 'Shooter', 'Strategy',
    'Simulation', 'Horror', 'Survival', 'Racing', 'Sports'
  ];

  const categoryUrls = categoryGenres.map((genre) => ({
    loc: `${siteUrl}/categories?genre=${encodeURIComponent(genre)}`,
    priority: '0.8',
    changefreq: 'weekly'
  }));

  const games = aggregator.games || [];
  const seenLocs = new Set();
  const rawUrls = [...staticUrls, ...categoryUrls];

  const validEntries = [];
  for (const item of rawUrls) {
    if (!seenLocs.has(item.loc)) {
      seenLocs.add(item.loc);
      validEntries.push({
        ...item,
        lastmod: now
      });
    }
  }

  for (const g of games) {
    const slugOrId = g.slug || g.id;
    if (!slugOrId) continue;

    const loc = `${siteUrl}/game/${slugOrId}`;
    if (seenLocs.has(loc)) continue;
    seenLocs.add(loc);

    const image = (g.background_image || g.thumbnail || (g.screenshots && g.screenshots[0]) || '').trim();

    validEntries.push({
      loc,
      lastmod: now,
      changefreq: 'weekly',
      priority: g.is_aaa ? '0.9' : '0.8',
      image: image.startsWith('http') ? image : '',
      title: g.title || ''
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${validEntries
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${
      u.image
        ? `\n    <image:image>
      <image:loc>${escapeXml(u.image)}</image:loc>
      <image:title>${escapeXml(u.title)}</image:title>
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
  const siteUrl = process.env.SITE_URL || 'https://gamergoats.online';
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

