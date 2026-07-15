# Karakoram Vision Pakistan — Final One-Phase Advanced Build

**Use only this package. Do not download, combine or apply any older phase ZIP.**

## Separate catalogues

- Tours: 827 retained source records
- Trekking: 231 retained source records
- Expeditions: 136 retained source records
- Jeep Safaris: 2
- Hunting Services: 2

Tours, Trekking and Expeditions are physically separate Pages CMS collections, folders, landing pages, URL namespaces, search filters and sitemap entries.

## Advanced foundation included

- Eleventy pre-rendered/server-generated HTML
- clean Tailwind CSS source and compiled CSS
- local Alpine.js and HTMX
- Cloudflare Pages Functions
- Pages CMS + private GitHub workflow
- SEO, GEO, AEO and AI-discovery controls
- structured data and clean canonicals
- sitemap, RSS, robots, llms files and IndexNow helper
- Core Web Vitals safeguards, service worker and security headers
- automated integrity, accessibility, schema, link and performance auditing

## Indexing safety

All extracted records are retained, but only 1,033 currently complete/approved pages are indexable. The build protects:

- 488 empty-body journey pages with `noindex, follow`
- 292 registration, WooCommerce, sample and obsolete payment pages with `noindex, follow`
- legacy redirect routes with noindex behavior

This prevents thin and duplicate content from weakening the new domain. Complete any protected page in Pages CMS before switching it to index.

## First action on your PC

1. Extract this ZIP to a short path such as `D:\KarakoramVisionPakistan`.
2. Run `IMPORT_ASSETS.bat`.
3. Point it to the local `apricottours_public_extract` folder containing the 3.9 GB raw backup.
4. Wait for `ASSET_IMPORT_REPORT.json`.

Then run:

```bat
npm install
npm run build
npm test
npm run dev:full
```

Do not publish the final domain until asset import, exact contact/form settings and high-priority content review are complete.

Read:

- `SETUP_STEP_BY_STEP.md`
- `SEO_GEO_AEO_AIO_GUIDE.md`
- `PERFORMANCE_AVAILABILITY.md`
- `SERVER_SIDE_ARCHITECTURE.md`
