import React, { useEffect } from 'react';
import type { Game } from '../types/game';

interface SeoHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'video_game';
  game?: Game;
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  game
}) => {
  useEffect(() => {
    // 1. Calculate SEO parameters
    const computedTitle = game
      ? `${game.title} — PC Requirements, Metascore & Specs | GamerGoats`
      : title || 'GamerGoats — Discover Your Next PC Game';

    const cleanDescription = (game?.description || game?.short_description || description || 'Discover your next favorite PC game on GamerGoats. Browse verified specs, Metascores, genres, and personalized game recommendations.')
      .replace(/<[^>]*>?/gm, ' ')
      .replace(/\s+/g, ' ')
      .slice(0, 160);

    const computedImage = game
      ? (game.background_image || game.thumbnail || (game.screenshots && game.screenshots[0]) || '')
      : (image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80');

    const prodDomain = 'https://gamergoats.online';
    const path = typeof window !== 'undefined' ? (window.location.pathname + window.location.search) : '';
    const computedUrl = url || (game ? `${prodDomain}/game/${game.slug || game.id}` : `${prodDomain}${path === '/' ? '' : path}`);

    const baseKeywords = [
      'PC games',
      'game discovery',
      'PC requirements',
      'system specs',
      'GamerGoats',
      'steam games',
      'game recommendations'
    ];

    if (game) {
      baseKeywords.push(game.title);
      if (game.genres) baseKeywords.push(...game.genres);
      if (game.tags) baseKeywords.push(...game.tags);
      if (game.developer) baseKeywords.push(game.developer);
      if (game.publisher) baseKeywords.push(game.publisher);
    } else if (keywords) {
      baseKeywords.push(...keywords);
    }

    // 2. Update Document Title
    document.title = computedTitle;

    // 3. Helper to update or create meta tags
    const setMetaTag = (attribute: string, attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attribute}="${attrValue}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard meta tags
    setMetaTag('name', 'description', cleanDescription);
    setMetaTag('name', 'keywords', baseKeywords.join(', '));
    setMetaTag('name', 'author', 'GamerGoats');
    setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', computedUrl);

    // OpenGraph (Facebook / LinkedIn / Discord / WhatsApp)
    setMetaTag('property', 'og:title', computedTitle);
    setMetaTag('property', 'og:description', cleanDescription);
    setMetaTag('property', 'og:image', computedImage);
    setMetaTag('property', 'og:url', computedUrl);
    setMetaTag('property', 'og:type', game ? 'video_game' : type);
    setMetaTag('property', 'og:site_name', 'GamerGoats');

    // Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', computedTitle);
    setMetaTag('name', 'twitter:description', cleanDescription);
    setMetaTag('name', 'twitter:image', computedImage);

    // 4. Structured Data: schema.org/VideoGame for Google Rich Search Results
    let scriptTag = document.getElementById('seo-json-ld') as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'seo-json-ld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    if (game) {
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'VideoGame',
        name: game.title,
        description: cleanDescription,
        image: computedImage,
        genre: game.genres || ['Action'],
        gamePlatform: game.platforms || ['PC (Windows)'],
        operatingSystem: 'Windows 10, Windows 11',
        applicationCategory: 'Game',
        url: computedUrl,
        datePublished: game.release_date || undefined,
        author: game.developer ? { '@type': 'Organization', name: game.developer } : undefined,
        publisher: game.publisher ? { '@type': 'Organization', name: game.publisher } : undefined,
        aggregateRating: game.rating ? {
          '@type': 'AggregateRating',
          ratingValue: (game.rating / 20).toFixed(1), // Normalized out of 5
          bestRating: '5',
          worstRating: '1',
          ratingCount: game.rating_count || 120
        } : undefined,
        offers: {
          '@type': 'Offer',
          price: game.is_free ? '0.00' : (game.price ? game.price.replace(/[^0-9.]/g, '') : '29.99'),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: game.official_url || computedUrl
        }
      };
      scriptTag.textContent = JSON.stringify(jsonLd);
    } else {
      // General WebSite schema for homepage / category pages
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'GamerGoats',
        url: computedUrl,
        description: cleanDescription,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${window.location.origin}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      };
      scriptTag.textContent = JSON.stringify(jsonLd);
    }

    return () => {
      // Clean up script tag on unmount if needed
    };
  }, [title, description, keywords, image, url, type, game]);

  return null;
};

