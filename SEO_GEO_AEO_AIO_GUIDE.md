# Karakoram Vision Pakistan — SEO + GEO + AEO + AIO Guide

This project uses one technical foundation rather than four disconnected “SEO plugins.” Canonical HTML remains the source of truth.

## SEO — Search Engine Optimization

Implemented:

- complete pre-rendered HTML for public pages
- unique title, meta description, robots and canonical fields
- Open Graph and Twitter metadata
- XML sitemap with last-modified and image entries
- clean internal category silos for Tours, Trekking, Expeditions, Jeep Safaris and Hunting Services
- BreadcrumbList, TravelAgency, WebSite, TouristTrip, Article, WebPage and conditional FAQPage JSON-LD
- local Tailwind, Alpine and HTMX assets
- image alt, width, height, loading and decoding safeguards
- noindex protection for thin, duplicate, registration, WooCommerce and obsolete payment pages
- IndexNow helper for supported search engines

## GEO — Generative Engine and Geographic Optimization

Generative discovery:

- visible “Quick answer” summaries
- visible key facts for duration, destination, price and difficulty
- concise server-readable page excerpts
- sources, author, reviewer and last-verified CMS fields
- machine-readable `/api/content` endpoint
- `llms.txt` and `llms-full.txt` as supplemental discovery files
- full semantic HTML, headings and direct internal links

Geographic/local discovery:

- TravelAgency + LocalBusiness entity data
- editable country, city, coordinates and service areas
- consistent business name, address, email and phone fields
- areaServed and TouristDestination schema foundations

## AEO — Answer Engine Optimization

- answers appear in visible HTML, not hidden JavaScript
- quick-answer blocks precede long content
- structured facts use semantic `<dl>` markup
- optional visible FAQs generate matching FAQPage JSON-LD
- server-side catalogue search and content endpoints
- headings and passage structure designed for concise answer extraction

Do not add FAQ schema unless the same question and answer are visible on the page.

## AIO — AI Discovery Optimization

- OAI-SearchBot is allowed for ChatGPT search visibility
- GPTBot is disallowed by default to opt out of model-training crawl
- Google-Extended is disallowed by default; normal Googlebot search crawling remains allowed
- crawler policies are editable and must reflect the owner’s final preference
- ARIA landmarks, labels and accessible navigation improve machine and agent understanding
- canonical HTML, sitemap, RSS and server content API provide multiple reliable discovery paths

`llms.txt` is supplemental only. It does not replace crawlable HTML, robots, sitemap, structured data or strong content.

## Content integrity protection

The extraction contained 488 journey records with empty body content. They remain editable in Pages CMS but are set to `noindex, follow` until complete content is added. Another 292 legacy registration/WooCommerce/payment/system pages are also retained but excluded from indexing and public search discovery.

To make a protected page indexable after completing it:

1. Open the page in Pages CMS.
2. Add complete, accurate and original content.
3. Verify title, description, image, facts, dates, prices and legal claims.
4. Change Robots to `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`.
5. Save; Cloudflare rebuilds the page and sitemap automatically.

## Ranking reality

The project can create a strong technical foundation, but it cannot guarantee a number-one position or reproduce an external checker score. Rankings also depend on the new domain, backlinks, competition, content accuracy, brand trust, engagement and crawl/indexing history.
