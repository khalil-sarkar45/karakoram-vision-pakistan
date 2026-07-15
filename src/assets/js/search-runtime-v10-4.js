(() => {
  'use strict';

  const TYPES = new Set(['all','tours','trekking','expeditions','jeep-safaris','hunting-services','blog','vehicles','pages']);
  const TYPE_LABELS = {
    all: 'all content', tours: 'tours', trekking: 'trekking journeys', expeditions: 'expeditions',
    'jeep-safaris': 'jeep safaris', 'hunting-services': 'hunting services', blog: 'travel guides',
    vehicles: 'vehicles', pages: 'destinations and pages'
  };
  const FILTER_LABELS = {
    'fixed-departures': 'Fixed Departures', 'best-sellers': 'Best Sellers', 'k2-treks': 'K2 Treks',
    'cultural-tours': 'Cultural Tours', '8000m-peaks': '8,000m Peaks'
  };
  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
  const normalizeType = value => TYPES.has(String(value || '').trim()) ? String(value).trim() : 'all';
  const cleanText = value => String(value || '').replace(/[&<>"']/g, '').replace(/\s+/g, ' ').trim();
  let searchController = null;
  let debounceTimer = null;
  let lastRequestedKey = '';

  function inferState(input) {
    const originalQuery = cleanText(input.q || '');
    let type = normalizeType(input.type || 'all');
    let filter = String(input.filter || '').trim().toLowerCase();
    const normalized = originalQuery.toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();

    if (!filter) {
      if (/\bfixed\s+departures?\b|\bscheduled\s+departures?\b/.test(normalized)) filter = 'fixed-departures';
      else if (/\bbest\s*seller(?:s)?\b|\bbestselling\b/.test(normalized)) filter = 'best-sellers';
    }

    if (type === 'all') {
      if (/\bexpedition(?:s)?\b|\bmountaineering\b|\bclimb(?:ing)?\b/.test(normalized)) type = 'expeditions';
      else if (/\btrek(?:s|king)?\b|\bhik(?:e|ing)\b/.test(normalized)) type = 'trekking';
      else if (/\bjeep\s+safari(?:s)?\b/.test(normalized)) type = 'jeep-safaris';
      else if (/\bhunting\b|\bmarkhor\b/.test(normalized)) type = 'hunting-services';
      else if (/\bvehicle(?:s)?\b|\bcar\s+rental(?:s)?\b/.test(normalized)) type = 'vehicles';
      else if (/\bblog(?:s)?\b|\btravel\s+guide(?:s)?\b|\barticle(?:s)?\b/.test(normalized)) type = 'blog';
      else if (/\btour(?:s)?\b|\bholiday(?:s)?\b/.test(normalized)) type = 'tours';
    }

    return { type, q: originalQuery, filter };
  }

  function readUrlState() {
    const params = new URLSearchParams(location.search);
    return inferState({
      type: params.get('type') || 'all',
      q: params.get('q') || '',
      filter: params.get('filter') || ''
    });
  }

  function formState(form) {
    return inferState({
      type: qs('[name="type"]', form)?.value || 'all',
      q: qs('[name="q"]', form)?.value || '',
      filter: qs('[name="filter"]', form)?.value || ''
    });
  }

  function setMainFormState(form, state) {
    const typeInput = qs('[name="type"]', form);
    const qInput = qs('[name="q"]', form);
    const filterInput = qs('[name="filter"]', form);
    if (typeInput) typeInput.value = state.type;
    if (qInput) {
      qInput.value = state.q;
      qInput.defaultValue = state.q;
    }
    if (filterInput) {
      filterInput.value = state.filter;
      filterInput.defaultValue = state.filter;
    }
  }

  function syncHeaderSearch(state) {
    qsa('[data-global-search-form]').forEach(form => {
      const qInput = qs('[name="q"]', form);
      const typeInput = qs('[name="type"]', form);
      if (qInput && location.pathname.includes('/search/')) qInput.value = state.q;
      if (typeInput) typeInput.value = state.type;
    });
  }

  function renderChips(state) {
    const root = qs('#active-search-filters');
    if (!root) return;
    const chips = [];
    if (state.type !== 'all') chips.push(`<span class="bk-search-chip">${TYPE_LABELS[state.type] || state.type}</span>`);
    if (state.filter) chips.push(`<span class="bk-search-chip">${FILTER_LABELS[state.filter] || state.filter.replaceAll('-', ' ')}</span>`);
    if (state.q) chips.push(`<span class="bk-search-chip">Search: ${cleanText(state.q)}</span>`);
    root.innerHTML = chips.join('');
  }

  function updateAddress(state, mode = 'replace') {
    if (!location.pathname.includes('/search/')) return;
    const params = new URLSearchParams();
    if (state.type !== 'all') params.set('type', state.type);
    if (state.q) params.set('q', state.q);
    if (state.filter) params.set('filter', state.filter);
    const next = `/search/${params.size ? `?${params.toString()}` : ''}`;
    if (`${location.pathname}${location.search}` === next) return;
    history[mode === 'push' ? 'pushState' : 'replaceState']({}, '', next);
  }

  async function loadResults(rawState, { historyMode = 'replace', force = false } = {}) {
    const form = qs('[data-catalog-search-form]');
    const target = qs('#search-results');
    const context = qs('#search-context');
    if (!form || !target) return;

    const state = inferState(rawState);
    setMainFormState(form, state);
    syncHeaderSearch(state);
    renderChips(state);
    updateAddress(state, historyMode);

    const shouldLoad = Boolean(state.q || state.filter || state.type !== 'all');
    if (!shouldLoad) {
      lastRequestedKey = '';
      target.innerHTML = '<p class="col-span-full rounded-xl bg-slate-50 p-8 text-slate-600">Choose a category or enter a search term above.</p>';
      if (context) context.textContent = 'Choose a category or enter a search term.';
      return;
    }

    const key = JSON.stringify(state);
    if (!force && key === lastRequestedKey && target.dataset.searchLoaded === 'true') return;
    lastRequestedKey = key;

    searchController?.abort();
    searchController = new AbortController();
    const params = new URLSearchParams({ type: state.type, q: state.q, filter: state.filter, size: '48' });
    target.dataset.searchLoaded = 'false';
    target.setAttribute('aria-busy', 'true');
    target.innerHTML = '<p class="col-span-full rounded-xl bg-slate-50 p-8 text-slate-600">Loading the most relevant journeys…</p>';
    if (context) context.textContent = 'Searching…';

    try {
      const response = await fetch(`/api/catalog?${params.toString()}`, {
        headers: { 'HX-Request': 'true', 'Accept': 'text/html' },
        signal: searchController.signal
      });
      if (!response.ok) throw new Error(`Search request failed: ${response.status}`);
      const total = Number(response.headers.get('x-total-count') || 0);
      const effectiveType = normalizeType(response.headers.get('x-effective-type') || state.type);
      const effectiveFilter = response.headers.get('x-effective-filter') || state.filter;
      const html = await response.text();
      target.innerHTML = html;
      target.dataset.searchLoaded = 'true';
      window.htmx?.process?.(target);

      if (effectiveType !== state.type || effectiveFilter !== state.filter) {
        state.type = effectiveType;
        state.filter = effectiveFilter;
        setMainFormState(form, state);
        renderChips(state);
        updateAddress(state, 'replace');
      }

      if (context) {
        const parts = [`${total} ${TYPE_LABELS[state.type] || state.type} result${total === 1 ? '' : 's'}`];
        if (state.filter) parts.push(FILTER_LABELS[state.filter] || state.filter.replaceAll('-', ' '));
        if (state.q) parts.push(`matching “${state.q}”`);
        context.textContent = parts.join(' · ');
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
      console.error(error);
      target.dataset.searchLoaded = 'false';
      target.innerHTML = '<p class="col-span-full rounded-xl bg-red-50 p-8 text-red-800">Search could not load. Please try again.</p>';
      if (context) context.textContent = 'Search unavailable.';
    } finally {
      target.setAttribute('aria-busy', 'false');
    }
  }

  function bindMainSearchForm(form) {
    if (!form || form.dataset.searchRuntimeBound === 'true') return;
    form.dataset.searchRuntimeBound = 'true';

    form.addEventListener('submit', event => {
      event.preventDefault();
      loadResults(formState(form), { historyMode: 'push', force: true });
    });

    qs('[name="type"]', form)?.addEventListener('change', () => {
      loadResults(formState(form), { historyMode: 'push', force: true });
    });

    qs('[name="q"]', form)?.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => loadResults(formState(form), { historyMode: 'replace', force: true }), 350);
    });
  }

  function initSearchPage() {
    if (!location.pathname.includes('/search/')) return;
    const form = qs('[data-catalog-search-form]');
    if (!form) return;
    bindMainSearchForm(form);
    const state = readUrlState();
    setMainFormState(form, state);
    syncHeaderSearch(state);
    loadResults(state, { historyMode: 'replace', force: true });
  }

  function forceGlobalSearchNavigation(form) {
    const q = cleanText(qs('[name="q"]', form)?.value || '');
    if (!q) return;
    const state = inferState({ type: qs('[name="type"]', form)?.value || 'all', q, filter: '' });
    const params = new URLSearchParams();
    if (state.type !== 'all') params.set('type', state.type);
    params.set('q', state.q);
    location.assign(`/search/?${params.toString()}`);
  }

  function bindGlobalSearchForms() {
    qsa('[data-global-search-form]').forEach(form => {
      if (form.dataset.globalSearchBound === 'true') return;
      form.dataset.globalSearchBound = 'true';
      form.setAttribute('hx-boost', 'false');
      form.addEventListener('submit', event => {
        event.preventDefault();
        forceGlobalSearchNavigation(form);
      });
    });
  }

  function prefillAndJumpToTripForm() {
    if (!location.pathname.includes('/plan-a-trip/')) return;
    const section = qs('#trip-request-form');
    const form = qs('[data-trip-planner]');
    if (!section || !form) return;
    const params = new URLSearchParams(location.search);
    const mappings = { journey: 'journey', service: 'service', start: 'start_date', end: 'end_date', q: 'destination', request: 'request_type', travelers: 'travelers', budget: 'budget' };
    Object.entries(mappings).forEach(([parameter, field]) => {
      const value = params.get(parameter);
      const input = qs(`[name="${field}"]`, form);
      if (value && input) input.value = value;
    });
    const direct = location.hash === '#trip-request-form' || [...params.keys()].some(key => Object.hasOwn(mappings, key));
    if (!direct || section.dataset.directFormJumped === 'true') return;
    section.dataset.directFormJumped = 'true';
    const jump = () => section.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    requestAnimationFrame(() => requestAnimationFrame(jump));
    setTimeout(jump, 220);
    setTimeout(() => {
      const journey = qs('[name="journey"]', form);
      const name = qs('[name="name"]', form);
      (journey?.value ? name : journey)?.focus({ preventScroll: true });
    }, 520);
  }

  function ensureBookingLinksTargetForm(root = document) {
    qsa('a[href^="/plan-a-trip/"]', root).forEach(link => {
      const url = new URL(link.getAttribute('href'), location.origin);
      if (!url.hash) url.hash = 'trip-request-form';
      link.setAttribute('href', `${url.pathname}${url.search}${url.hash}`);
    });
  }

  function boot(root = document) {
    bindGlobalSearchForms();
    ensureBookingLinksTargetForm(root);
    initSearchPage();
    prefillAndJumpToTripForm();
  }

  document.addEventListener('DOMContentLoaded', () => boot(document), { once: true });
  document.addEventListener('htmx:load', event => boot(event.detail?.elt || document));
  document.addEventListener('htmx:afterSettle', event => boot(event.detail?.elt || document));
  addEventListener('pageshow', () => boot(document));
  addEventListener('popstate', () => {
    if (location.pathname.includes('/search/')) initSearchPage();
  });
})();
