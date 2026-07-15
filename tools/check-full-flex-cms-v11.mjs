import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const issues = [];
const checks = {};
const read = rel => fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), 'utf8') : '';
const exists = rel => fs.existsSync(path.join(root, rel));
const json = rel => { try { return JSON.parse(read(rel)); } catch { issues.push(`Invalid JSON: ${rel}`); return {}; } };

const required = [
  '.pages.yml','src/_data/site.json','src/_data/siteHeader.json','src/_data/siteFooter.json','src/_data/homePage.json','src/_data/theme.json','src/_data/formsConfig.json','src/_data/taxonomies.json','src/_data/menu.json',
  'src/_includes/components/header.njk','src/_includes/components/footer.njk','src/_includes/layouts/base.njk','src/index.njk','src/plan-a-trip/index.njk','src/contact-us/index.njk','src/theme-vars.css.njk'
];
for (const rel of required) { checks[`exists:${rel}`] = exists(rel); if (!exists(rel)) issues.push(`Missing ${rel}`); }

const pages = read('.pages.yml');
const requiredCmsTokens = [
  'settings:', 'merge: true', '01 — Site Identity, Logos, Contacts & Social', '02 — Header & Top Bar', '03 — Navbar & Multi-level Menus',
  '04 — Footer, Newsletter & Link Columns', '05 — Homepage Builder & Section Order', '06 — Theme Colors, Radius & Spacing',
  '07 — Forms, Labels & Required Fields', '08 — Categories, Statuses & Taxonomy Lists', 'create: true', 'rename: true', 'delete: true'
];
checks.cms_tokens = requiredCmsTokens.every(token => pages.includes(token));
if (!checks.cms_tokens) issues.push('Pages CMS configuration is missing one or more full-flex control groups.');
checks.cms_collections = ['src/content/tours','src/content/trekking','src/content/expeditions','src/content/jeep-safaris','src/content/hunting-services','src/content/blog','src/content/vehicles','src/content/pages'].every(token => pages.includes(token));
if (!checks.cms_collections) issues.push('One or more content collections are not editable in Pages CMS.');

const dataNames = ['site','siteHeader','siteFooter','homePage','theme','formsConfig','taxonomies','menu'];
const data = Object.fromEntries(dataNames.map(name => [name, json(`src/_data/${name}.json`)]));
checks.menu_editable = Array.isArray(data.menu.items) && data.menu.items.length > 0;
checks.header_controls = Boolean(data.siteHeader?.top_strip && data.siteHeader?.search && data.siteHeader?.primary_cta);
checks.footer_controls = Boolean(Array.isArray(data.siteFooter?.columns) && data.siteFooter?.contact && data.siteFooter?.bottom);
checks.home_builder = Array.isArray(data.homePage?.section_order) && data.homePage.section_order.length >= 5;
checks.theme_controls = Boolean(data.theme?.primary && data.theme?.accent && data.theme?.header_glass);
checks.forms_controls = Boolean(data.formsConfig?.plan_trip?.fields && data.formsConfig?.contact);
for (const [key,value] of Object.entries(checks)) if (value === false && !key.startsWith('exists:')) issues.push(`Failed check: ${key}`);

const base = read('src/_includes/layouts/base.njk');
checks.theme_css_linked = base.includes('/assets/css/theme-vars.css?v=11.0.0');
checks.v11_ui_version = base.includes('data-ui-version="11.0.0"');
const header = read('src/_includes/components/header.njk');
checks.header_uses_cms = header.includes('siteHeader') && header.includes('item.enabled') && header.includes('target_blank');
const footer = read('src/_includes/components/footer.njk');
checks.footer_uses_cms = footer.includes('siteFooter') && footer.includes('f.columns') && footer.includes('platform_order');
const home = read('src/index.njk');
checks.home_uses_order = home.includes('hp.section_order') && home.includes("section == 'services'") && home.includes("section == 'cta'");
const plan = read('src/plan-a-trip/index.njk');
checks.form_uses_cms = plan.includes('formsConfig.plan_trip') && plan.includes('form.fields.requirements.enabled');
for (const name of ['theme_css_linked','v11_ui_version','header_uses_cms','footer_uses_cms','home_uses_order','form_uses_cms']) if (!checks[name]) issues.push(`Failed source integration check: ${name}`);

if (exists('_site/index.html')) {
  const built = read('_site/index.html');
  checks.built_home = built.includes('/assets/css/theme-vars.css?v=11.0.0') && built.includes('Journey Beyond the Ordinary');
  if (!checks.built_home) issues.push('Built homepage does not contain the V11 CMS/theme integration.');
}
if (exists('_site/plan-a-trip/index.html')) {
  const builtForm = read('_site/plan-a-trip/index.html');
  checks.built_form = builtForm.includes('trip-request-form') && builtForm.includes('Send trip request');
  if (!checks.built_form) issues.push('Built Plan-a-Trip form is missing.');
}

const report = { version:'11.0.0', checks, issues_count:issues.length, issues };
fs.writeFileSync(path.join(root,'FULL_FLEX_CMS_V11_REPORT.json'), JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if (issues.length) process.exit(1);
console.log('FULL_FLEX_OWNER_CMS_V11_AUDIT_PASSED');
