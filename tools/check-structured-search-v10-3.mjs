import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const checks={
  menu_fixed_trekking:read('src/_data/menu.json').includes('/trekking/fixed-departures/'),
  menu_fixed_tours:read('src/_data/menu.json').includes('/tours/fixed-departures/'),
  menu_fixed_expeditions:read('src/_data/menu.json').includes('/expeditions/fixed-departures/'),
  menu_k2_landing:read('src/_data/menu.json').includes('/trekking/k2-treks/'),
  search_categories_hub:read('src/search/index.njk').includes('/journey-categories/'),
  search_no_htmx_form:!read('src/search/index.njk').includes('hx-get="/api/catalog"'),
  relevance_api:read('functions/api/catalog.js').includes('normalized_title===q')&&read('functions/api/catalog.js').includes('x-total-count'),
  url_sync:read('src/assets/js/search-booking-v10-2.js').includes('readUrlState')&&read('src/assets/js/search-booking-v10-2.js').includes('history[push'),
  structured_data:fs.existsSync(path.join(root,'src/_data/structuredCatalog.json')),
  fixed_route_built:fs.existsSync(path.join(root,'_site/trekking/fixed-departures/index.html')),
  categories_route_built:fs.existsSync(path.join(root,'_site/journey-categories/index.html')),
  k2_route_built:fs.existsSync(path.join(root,'_site/trekking/k2-treks/index.html')),
  cards_server_rendered:fs.existsSync(path.join(root,'_site/trekking/fixed-departures/index.html'))&&read('_site/trekking/fixed-departures/index.html').includes('bk-journey-card'),
  booking_anchor:fs.existsSync(path.join(root,'_site/trekking/fixed-departures/index.html'))&&read('_site/trekking/fixed-departures/index.html').includes('#trip-request-form')
};
const issues=Object.entries(checks).filter(([,ok])=>!ok).map(([name])=>name);
const report={version:'10.3.0',checks,issues_count:issues.length,issues};
fs.writeFileSync(path.join(root,'STRUCTURED_SEARCH_NAVIGATION_V10_3_REPORT.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(issues.length)process.exit(1);console.log('STRUCTURED_SEARCH_NAVIGATION_V10_3_AUDIT_PASSED');
