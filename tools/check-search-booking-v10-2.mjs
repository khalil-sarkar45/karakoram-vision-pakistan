import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const read=p=>fs.existsSync(path.join(root,p))?fs.readFileSync(path.join(root,p),'utf8'):'';
const base=read('src/_includes/layouts/base.njk');
const search=read('src/search/index.njk');
const plan=read('src/plan-a-trip/index.njk');
const api=read('functions/api/catalog.js');
const gen=read('tools/generate_runtime_catalog.mjs');
const js=read('src/assets/js/search-booking-v10-2.js');
const builtSearch=read('_site/search/index.html');
const builtPlan=read('_site/plan-a-trip/index.html');
const checks={
 runtime_loaded:base.includes('search-booking-v10-2.js'),
 search_form_marker:search.includes('data-catalog-search-form'),
 search_query_not_required:!search.includes('name="q" placeholder="Search by destination, activity or route" aria-label="Search query" required'),
 plan_anchor_source:plan.includes('id="trip-request-form"'),
 plan_anchor_built:builtPlan.includes('id="trip-request-form"'),
 search_built:builtSearch.includes('data-catalog-search-form'),
 api_fixed_filter:api.includes('wantsFixed'),
 api_booking_anchor:api.includes('#trip-request-form'),
 catalog_search_text:gen.includes('search_text'),
 catalog_fixed_flag:gen.includes('fixed_departure'),
 direct_scroll_runtime:js.includes('scrollIntoView'),
 auto_catalog_runtime:js.includes('loadCatalogFromUrl'),
};
const sourceFiles=[];
function walk(dir){if(!fs.existsSync(dir))return;for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(/\.(njk|html)$/.test(e.name))sourceFiles.push(p);}}
walk(path.join(root,'src'));
const missed=[];
for(const file of sourceFiles){const text=fs.readFileSync(file,'utf8');const matches=[...text.matchAll(/href="(\/plan-a-trip\/[^\"]*)"/g)];for(const m of matches)if(!m[1].includes('#trip-request-form'))missed.push(path.relative(root,file)+': '+m[1]);}
checks.all_plan_links_anchored=missed.length===0;
const issues=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
const report={version:'10.2.0',checks,unanchored_plan_links:missed.slice(0,30),issues_count:issues.length,issues};
fs.writeFileSync(path.join(root,'SEARCH_BOOKING_V10_2_REPORT.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(issues.length)process.exit(1);
console.log('SEARCH_BOOKING_DIRECT_FORM_V10_2_AUDIT_PASSED');
