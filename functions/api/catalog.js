import {catalog} from "../_data/catalog.js";

const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const normalize = value => String(value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
const TYPES = new Set(["all","tours","trekking","expeditions","jeep-safaris","hunting-services","blog","vehicles","pages"]);
const labels = {"tours":"Tours","trekking":"Trekking","expeditions":"Expeditions","jeep-safaris":"Jeep Safaris","hunting-services":"Hunting Services","blog":"Travel Guide","vehicles":"Vehicle","pages":"Destination"};
const booking = item => `/plan-a-trip/?journey=${encodeURIComponent(item.title || "")}&service=${encodeURIComponent(item.type || "")}#trip-request-form`;

const card = item => `<article class="bk-journey-card"><a class="bk-card-media" href="${esc(item.url)}"><img src="${esc(item.image)}" alt="${esc(item.title)}" width="800" height="500" loading="lazy" decoding="async"><span class="bk-card-type">${esc(labels[item.type] || String(item.type || "").replaceAll("-", " "))}</span>${item.best_seller ? '<span class="bk-card-star" aria-label="Featured journey">★</span>' : ''}</a><div class="bk-card-body"><h3><a href="${esc(item.url)}">${esc(item.title)}</a></h3>${item.destination ? `<p class="bk-card-destination">${esc(item.destination)}</p>` : ""}<p>${esc(item.summary)}</p><div class="bk-card-meta">${item.duration ? `<span>${esc(item.duration)}</span>` : ""}${item.price_from ? `<span>${esc(item.price_from)}</span>` : ""}${item.difficulty ? `<span>${esc(item.difficulty)}</span>` : ""}</div></div><div class="bk-card-actions"><a href="${esc(item.url)}">More details</a><a class="bk-book-button" href="${esc(booking(item))}">Book now</a></div></article>`;

function resolveIntent(rawType, rawQuery, rawFilter) {
  let type = TYPES.has(rawType) ? rawType : "all";
  let filter = normalize(rawFilter).replaceAll(" ", "-");
  const originalQuery = String(rawQuery || "").trim();
  let scoringQuery = normalize(originalQuery);

  if (!filter) {
    if (/\bfixed departures?\b|\bscheduled departures?\b/.test(scoringQuery)) filter = "fixed-departures";
    else if (/\bbest sellers?\b|\bbestselling\b/.test(scoringQuery)) filter = "best-sellers";
  }

  if (type === "all") {
    if (/\bexpeditions?\b|\bmountaineering\b|\bclimbing\b/.test(scoringQuery)) type = "expeditions";
    else if (/\btreks?\b|\btrekking\b|\bhiking\b/.test(scoringQuery)) type = "trekking";
    else if (/\bjeep safari(?:s)?\b/.test(scoringQuery)) type = "jeep-safaris";
    else if (/\bhunting\b|\bmarkhor\b/.test(scoringQuery)) type = "hunting-services";
    else if (/\bvehicles?\b|\bcar rentals?\b/.test(scoringQuery)) type = "vehicles";
    else if (/\bblogs?\b|\btravel guides?\b|\barticles?\b/.test(scoringQuery)) type = "blog";
    else if (/\btours?\b|\bholidays?\b/.test(scoringQuery)) type = "tours";
  }

  const removable = [
    /\bfixed departures?\b/g, /\bscheduled departures?\b/g, /\bbest sellers?\b/g, /\bbestselling\b/g,
    /\bexpeditions?\b/g, /\bmountaineering\b/g, /\bclimbing\b/g,
    /\btreks?\b/g, /\btrekking\b/g, /\bhiking\b/g,
    /\bjeep safari(?:s)?\b/g, /\bhunting services?\b/g,
    /\bvehicles?\b/g, /\bcar rentals?\b/g, /\btravel guides?\b/g, /\bblogs?\b/g, /\barticles?\b/g,
    /\btours?\b/g, /\bholidays?\b/g
  ];
  let stripped = scoringQuery;
  for (const pattern of removable) stripped = stripped.replace(pattern, " ");
  stripped = stripped.replace(/\s+/g, " ").trim();
  if (stripped) scoringQuery = stripped;
  else if (filter || type !== "all") scoringQuery = "";

  return { type, filter, originalQuery, scoringQuery };
}

function matchesFilter(item, filter) {
  if (!filter) return true;
  if (filter === "fixed-departures") return Boolean(item.fixed_departure);
  if (filter === "best-sellers") return Boolean(item.best_seller);
  if (filter === "k2-treks") return Boolean(item.k2_trek);
  if (filter === "cultural-tours") return Boolean(item.cultural_tour);
  if (filter === "8000m-peaks") return Boolean(item.peak_8000m);
  return true;
}

function tokenVariants(word) {
  const variants = new Set([word]);
  if (word.length > 4 && word.endsWith("ies")) variants.add(`${word.slice(0, -3)}y`);
  if (word.length > 4 && word.endsWith("ing")) variants.add(word.slice(0, -3));
  if (word.length > 3 && word.endsWith("es")) variants.add(word.slice(0, -2));
  if (word.length > 3 && word.endsWith("s")) variants.add(word.slice(0, -1));
  return [...variants].filter(Boolean);
}

function containsToken(haystack, word) {
  return tokenVariants(word).some(variant => haystack.includes(variant));
}

function relevance(item, query, allowBody = false) {
  if (!query) return 1 + (item.best_seller ? 8 : 0);
  const q = normalize(query);
  const words = q.split(" ").filter(Boolean);
  const title = normalize(item.normalized_title || item.title);
  const slug = normalize(item.normalized_slug);
  const tags = normalize(item.normalized_tags);
  const destination = normalize(item.normalized_destination);
  const summary = normalize(item.normalized_summary);
  const departures = normalize(item.normalized_departures);
  const primary = `${title} ${slug} ${tags} ${destination} ${summary} ${departures}`.trim();
  const combined = allowBody ? `${primary} ${normalize(item.search_text)}` : primary;
  if (!words.every(word => containsToken(combined, word))) return 0;

  let score = 10;
  if (title === q) score += 1600;
  else if (title.startsWith(q)) score += 1200;
  else if (title.includes(q)) score += 950;
  if (slug.includes(q)) score += 620;
  if (tags.includes(q)) score += 460;
  if (destination.includes(q)) score += 340;
  if (departures.includes(q)) score += 260;
  if (summary.includes(q)) score += 180;
  score += words.reduce((sum, word) => sum
    + (containsToken(title, word) ? 125 : 0)
    + (containsToken(slug, word) ? 70 : 0)
    + (containsToken(tags, word) ? 55 : 0)
    + (containsToken(destination, word) ? 45 : 0)
    + (containsToken(summary, word) ? 20 : 0), 0);
  if (item.best_seller) score += 8;
  return score;
}

export async function onRequestGet({request}) {
  const url = new URL(request.url);
  const intent = resolveIntent(
    url.searchParams.get("type") || "all",
    url.searchParams.get("q") || "",
    url.searchParams.get("filter") || ""
  );
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const size = Math.min(48, Math.max(6, Number(url.searchParams.get("size") || 24)));

  const candidates = catalog.filter(item => (intent.type === "all" || item.type === intent.type) && matchesFilter(item, intent.filter));
  let ranked = candidates.map(item => ({item, score: relevance(item, intent.scoringQuery, false)})).filter(entry => entry.score > 0);
  if (intent.scoringQuery && ranked.length === 0) {
    ranked = candidates.map(item => ({item, score: relevance(item, intent.scoringQuery, true)})).filter(entry => entry.score > 0);
  }
  ranked.sort((a, b) => b.score - a.score || String(a.item.title).localeCompare(String(b.item.title)));

  const total = ranked.length;
  const slice = ranked.slice((page - 1) * size, page * size).map(entry => entry.item);
  const more = page * size < total;
  let html = slice.length
    ? slice.map(card).join("")
    : '<p class="col-span-full rounded-lg bg-slate-100 p-6">No relevant matches were found. Try a shorter phrase or remove one filter.</p>';

  if (more) {
    html += `<div class="bk-load-more" hx-get="/api/catalog?type=${encodeURIComponent(intent.type)}&q=${encodeURIComponent(intent.originalQuery)}&filter=${encodeURIComponent(intent.filter)}&page=${page + 1}&size=${size}" hx-trigger="revealed" hx-swap="outerHTML"><span>Loading more…</span></div>`;
  }

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=UTF-8",
      "cache-control": "public, max-age=60, stale-while-revalidate=300",
      "x-content-type-options": "nosniff",
      "x-total-count": String(total),
      "x-search-query": intent.originalQuery,
      "x-effective-type": intent.type,
      "x-effective-filter": intent.filter,
      "x-scoring-query": intent.scoringQuery
    }
  });
}
