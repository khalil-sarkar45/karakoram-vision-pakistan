import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const exists = file => fs.existsSync(path.join(root, file));
const menu = JSON.parse(read('src/_data/menu.json'));
const searchLinks = [];
const walk = items => {
  for (const item of items || []) {
    if (String(item.url || '').startsWith('/search/')) searchLinks.push({label:item.label,url:item.url});
    walk(item.children);
  }
};
walk(menu.items);
const validTypes = new Set(['all','tours','trekking','expeditions','jeep-safaris','hunting-services','blog','vehicles','pages']);
const badMenuLinks = searchLinks.filter(item => {
  const url = new URL(item.url, 'https://example.test');
  const type = url.searchParams.get('type') || 'all';
  return !validTypes.has(type) || !(url.searchParams.get('q') || url.searchParams.get('filter'));
});

const apiModule = await import(`${pathToFileURL(path.join(root,'functions/api/catalog.js')).href}?v=${Date.now()}`);
async function query(params) {
  const response = await apiModule.onRequestGet({request:new Request(`https://example.test/api/catalog?${new URLSearchParams(params)}`)});
  return {
    status: response.status,
    total: Number(response.headers.get('x-total-count') || 0),
    type: response.headers.get('x-effective-type') || '',
    filter: response.headers.get('x-effective-filter') || '',
    scoring: response.headers.get('x-scoring-query') || '',
    html: await response.text()
  };
}

const cases = {
  global_k2_expedition: await query({type:'all',q:'K2 expedition',size:'48'}),
  trekking_k2_base_camp: await query({type:'trekking',q:'K2 Base Camp Trek',size:'48'}),
  global_hunza_tour: await query({type:'all',q:'Hunza tour',size:'48'}),
  global_deosai_jeep: await query({type:'all',q:'Deosai jeep safari',size:'48'}),
  trekking_fixed: await query({type:'trekking',filter:'fixed-departures',size:'48'}),
  tours_fixed: await query({type:'tours',filter:'fixed-departures',size:'48'}),
  expeditions_fixed: await query({type:'expeditions',filter:'fixed-departures',size:'48'})
};

const base = read('src/_includes/layouts/base.njk');
const header = read('src/_includes/components/header.njk');
const search = read('src/search/index.njk');
const runtime = read('src/assets/js/search-runtime-v10-4.js');
const builtSearch = exists('_site/search/index.html') ? read('_site/search/index.html') : '';

const checks = {
  runtime_source_exists: exists('src/assets/js/search-runtime-v10-4.js'),
  runtime_loaded_once: (base.match(/search-runtime-v10-4\.js/g) || []).length === 1,
  old_search_runtime_not_loaded: !base.includes('search-booking-v10-2.js'),
  global_header_search_forces_navigation: header.includes('data-global-search-form') && header.includes('hx-boost="false"'),
  submenu_search_links_force_full_navigation: header.includes("item.url.includes('/search/')") && header.includes('hx-boost="false"'),
  main_search_form_not_boosted: search.includes('data-catalog-search-form') && search.includes('hx-boost="false"'),
  htmx_reinitialization: runtime.includes("htmx:load") && runtime.includes("htmx:afterSettle"),
  url_form_sync: runtime.includes('readUrlState') && runtime.includes('setMainFormState') && runtime.includes('syncHeaderSearch'),
  global_intent_inference: runtime.includes("type = 'expeditions'") && runtime.includes("type = 'trekking'"),
  menu_search_links_present: searchLinks.length >= 50,
  menu_search_links_valid: badMenuLinks.length === 0,
  built_search_has_runtime: builtSearch.includes('/assets/js/search-runtime-v10-4.js?v=10.4.0'),
  built_search_has_global_form: builtSearch.includes('data-global-search-form') && builtSearch.includes('data-catalog-search-form'),
  global_k2_expedition_inferred: cases.global_k2_expedition.type === 'expeditions' && cases.global_k2_expedition.total > 0 && /k2/i.test(cases.global_k2_expedition.html),
  global_k2_expedition_terms_stripped: cases.global_k2_expedition.scoring === 'k2',
  trekking_k2_relevant: cases.trekking_k2_base_camp.type === 'trekking' && cases.trekking_k2_base_camp.total > 0 && /k2/i.test(cases.trekking_k2_base_camp.html),
  global_hunza_tour_inferred: cases.global_hunza_tour.type === 'tours' && cases.global_hunza_tour.total > 0,
  global_deosai_jeep_inferred: cases.global_deosai_jeep.type === 'jeep-safaris',
  all_fixed_departure_types_work: cases.trekking_fixed.total > 0 && cases.tours_fixed.total > 0 && cases.expeditions_fixed.total > 0,
  categories_hub_correct: search.includes('href="/journey-categories/"') && exists('_site/journey-categories/index.html')
};

const issues = Object.entries(checks).filter(([,ok]) => !ok).map(([name]) => name);
const report = {
  version:'10.4.0',
  checks,
  menu_search_links:searchLinks.length,
  bad_menu_links:badMenuLinks,
  query_results:Object.fromEntries(Object.entries(cases).map(([name,value]) => [name,{status:value.status,total:value.total,type:value.type,filter:value.filter,scoring:value.scoring}])),
  issues_count:issues.length,
  issues
};
fs.writeFileSync(path.join(root,'GLOBAL_SEARCH_ALL_CATEGORIES_V10_4_REPORT.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if (issues.length) process.exit(1);
console.log('GLOBAL_SEARCH_ALL_CATEGORIES_V10_4_AUDIT_PASSED');
