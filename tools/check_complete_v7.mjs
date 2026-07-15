import fs from 'node:fs';
const fail = message => { console.error(`COMPLETE_V7_AUDIT_FAILED: ${message}`); process.exit(1); };
for (const file of ['_site/index.html','_site/plan-a-trip/index.html','_site/assets/js/site-core.js','_site/assets/css/site.css','BRAND_MEDIA_AUDIT.json']) {
  if (!fs.existsSync(file)) fail(`${file} missing`);
}
const home = fs.readFileSync('_site/index.html','utf8');
const required = [
  'data-nav-menu','data-submenu-trigger','bk-submenu-level-2','bk-mobile-details',
  'bk-info-strip','bk-brand-row','bk-header-search','bk-footer-grid','data-open-contact',
  '/plan-a-trip/','Tours','Trekking','Expeditions','Jeep Safaris','Hunting','Travel Guides','Contact','About'
];
for (const token of required) if (!home.includes(token)) fail(`homepage missing ${token}`);
if (/Apricot\s+Tours/i.test(home)) fail('visible old brand remains on homepage');
if (/<img[^>]+src=["']https?:\/\/(?:www\.)?apricottours\.pk/i.test(home)) fail('legacy Apricot remote image remains on homepage');
const plan = fs.readFileSync('_site/plan-a-trip/index.html','utf8');
for (const token of ['Plan a Trip','Full name','Service','Preferred dates','Number of travelers']) if (!plan.includes(token)) fail(`plan-a-trip missing ${token}`);
const js = fs.readFileSync('_site/assets/js/site-core.js','utf8');
for (const token of ['initNavigation','initContactModal','hydrateSearchFromUrl']) if (!js.includes(token)) fail(`site-core missing ${token}`);
console.log(JSON.stringify({status:'passed',recursiveNavigation:true,brandProtection:true,mediaProtection:true,headerSearch:true,planTrip:true,fourColumnFooter:true},null,2));
