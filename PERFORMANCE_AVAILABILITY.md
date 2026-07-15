# Performance, Responsiveness, Integrity and Availability

## Current production budgets

- compiled CSS: approximately 40 KB
- local JavaScript: approximately 99 KB
- median generated HTML: approximately 26 KB
- largest generated HTML: approximately 104 KB
- external script tags in audited HTML: 0
- pages with missing image dimensions/decoding attributes: 0

## Speed architecture

- Cloudflare edge delivery and HTTPS
- pre-rendered HTML; core page content does not wait for API calls
- locally bundled Tailwind CSS, Alpine.js and HTMX
- immutable one-year caching for versioned static assets
- CSS preload and priority hero image
- lazy loading and async decoding for non-critical images
- WebP conversion through `IMPORT_ASSETS.bat`
- `content-visibility` for below-the-fold sections
- service worker for repeat visits and offline fallback
- server-side HTMX fragments cached with stale-while-revalidate

## Core Web Vitals targets

- LCP target: 2.5 seconds or less
- INP target: under 200 milliseconds
- CLS target: under 0.1

A real 0.2-second full-page load cannot be guaranteed before the final domain, optimized images, user location and live network are tested. The old “0.2” result may have represented cached response time or one specific metric rather than full visual loading.

## Responsive and compatibility controls

- mobile-first Tailwind layouts
- keyboard-accessible navigation and modals
- visible focus states
- reduced-motion support
- no-JavaScript fallback links for primary navigation
- semantic landmarks and skip navigation
- local browser-compatible ES modules

## Integrity and security

- Content Security Policy
- HSTS
- nosniff and referrer policy
- restricted permissions policy
- frame protection
- rel=noopener for external new-tab links
- `.well-known/security.txt`
- automated broken-link, schema, metadata and performance audits

## Availability

Cloudflare Pages serves static HTML from its distributed edge network. Cloudflare Pages Functions handle `/api/health`, `/api/catalog`, `/api/content` and `/api/vitals`. The public core pages remain available even if a runtime Function has a temporary issue because their primary content is already pre-rendered.

Availability is strengthened by the service worker and cached assets, but no provider can truthfully promise absolute 100% uptime.
