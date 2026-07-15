import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const exists = p => fs.existsSync(path.join(root, p));
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const checks = {};
const sourceChecks = {
  floating_contact_component:'src/_includes/components/floating-contact.njk',
  international_contact_modal:'src/_includes/components/contact-modal.njk',
  social_footer:'src/_includes/components/footer.njk',
  premium_journey_layout:'src/_includes/layouts/journey.njk',
  local_icon_sprite:'src/assets/icons/bk-icons.svg',
  trip_calendar:'src/trip-calendar/index.njk',
  travel_resources:'src/travel-resources/index.njk',
  v10_javascript:'src/assets/js/site-core.js'
};
for (const [name,file] of Object.entries(sourceChecks)) checks[name] = exists(file);
const base = exists('src/_includes/layouts/base.njk') ? read('src/_includes/layouts/base.njk') : '';
const journey = exists('src/_includes/layouts/journey.njk') ? read('src/_includes/layouts/journey.njk') : '';
const footer = exists('src/_includes/components/footer.njk') ? read('src/_includes/components/footer.njk') : '';
const modal = exists('src/_includes/components/contact-modal.njk') ? read('src/_includes/components/contact-modal.njk') : '';
const css = exists('src/assets/css/input.css') ? read('src/assets/css/input.css') : '';
const js = exists('src/assets/js/site-core.js') ? read('src/assets/js/site-core.js') : '';
const pages = exists('.pages.yml') ? read('.pages.yml') : '';
checks.base_includes_floating_contact = base.includes('components/floating-contact.njk');
checks.base_v10_cache_version = base.includes('v=10.0.0');
checks.modal_supports_global_apps = ['whatsapp','telegram','messenger','signal','line','wechat','viber','kakao','zalo','imo','vk','max','skype'].every(app => modal.toLowerCase().includes(app));
checks.footer_supports_all_social_accounts = ['facebook','instagram','youtube','linkedin','tripadvisor','site.social.x','tiktok','pinterest','threads','google_business','bluesky'].every(key => footer.includes(key));
checks.journey_has_gallery_summary = journey.includes('bk-trip-showcase') && journey.includes('bk-trip-summary-card') && journey.includes('bk-trip-lightbox');
checks.journey_has_departure_pricing = journey.includes('departure_details') && journey.includes('bk-departure-table');
checks.journey_has_epic_style_sections = ['highlights','packing_list','trip_leader','reviews','included','excluded'].every(key => journey.includes(key));
checks.javascript_contact_dock = js.includes('initFloatingContact');
checks.javascript_trip_gallery = js.includes('initTripGallery');
checks.css_v10_marker = css.includes('Karakoram Vision Pakistan Global Contact + Trip Experience V10');
checks.cms_contact_apps = ['signal','zalo','imo','skype'].every(key => pages.includes(`- name: ${key}`));
checks.cms_social_accounts = pages.includes('- name: social') && pages.includes('- name: google_business');
checks.cms_trip_fields = ['group_size','deposit','departure_details','trip_leader','reviews','packing_list'].every(key => pages.includes(`- name: ${key}`));
checks.built_home = exists('_site/index.html');
checks.built_calendar = exists('_site/trip-calendar/index.html');
checks.built_resources = exists('_site/travel-resources/index.html');
if (checks.built_home) {
  const home = read('_site/index.html');
  checks.built_floating_contact = home.includes('data-contact-dock');
  checks.built_contact_modal = home.includes('International contact hub');
  checks.built_all_social_footer = home.includes('Social media accounts');
  checks.built_trip_calendar_link = home.includes('/trip-calendar/');
  checks.built_resources_link = home.includes('/travel-resources/');
  checks.built_v10_css = home.includes('site.css?v=10.0.0');
}
const journeyFiles = [];
for (const service of ['tours','trekking','expeditions','jeep-safaris','hunting-services']) {
  const dir = path.join(root, '_site', service);
  if (!fs.existsSync(dir)) continue;
  for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
    const file = path.join(dir, entry.name, 'index.html');
    if (entry.isDirectory() && fs.existsSync(file)) journeyFiles.push(file);
    if (journeyFiles.length >= 10) break;
  }
  if (journeyFiles.length >= 10) break;
}
checks.built_journey_sample_found = journeyFiles.length > 0;
checks.built_journey_premium_layout = journeyFiles.some(file => {
  const html = fs.readFileSync(file,'utf8');
  return html.includes('bk-trip-showcase') && html.includes('bk-trip-summary-card') && html.includes('data-open-contact');
});
const issues = Object.entries(checks).filter(([,ok]) => !ok).map(([name]) => name);
const report = {version:'10.0.0',checks,issues_count:issues.length,issues};
fs.writeFileSync(path.join(root,'GLOBAL_CONTACT_TRIP_EXPERIENCE_V10_REPORT.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if (issues.length) process.exit(1);
console.log('GLOBAL_CONTACT_TRIP_EXPERIENCE_V10_AUDIT_PASSED');
