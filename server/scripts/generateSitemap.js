import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { aggregator } from '../src/services/apiAggregator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function escapeXml(unsafe) {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function generate() {
  console.log('[SitemapGenerator] Initializing aggregator...');
  await aggregator.init();

  const siteUrl = 'https://gamergoats.online';
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

  const targetPath = path.resolve(__dirname, '../../client/public/sitemap.xml');
  fs.writeFileSync(targetPath, xml, 'utf8');
  console.log(`[SitemapGenerator] Wrote ${validEntries.length} unique URLs to ${targetPath}`);

  // Also check for any occurrence of gamergoats.com in the file
  if (xml.includes('gamergoats.com')) {
    console.error('[Error] Found gamergoats.com in generated sitemap!');
    process.exit(1);
  } else {
    console.log('[Verification] Confirmed: 100% of URLs use https://gamergoats.online');
  }
}

generate().catch(err => {
  console.error('[SitemapGenerator] Error:', err);
  process.exit(1);
});
