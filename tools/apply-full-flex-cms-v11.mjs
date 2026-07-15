import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const defaultsDir = path.join(root, 'V11_PATCH', 'defaults');
const dataDir = path.join(root, 'src', '_data');

function readJson(file, fallback = {}) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}
function isObject(value) { return value && typeof value === 'object' && !Array.isArray(value); }
function mergeDefaults(existing, defaults) {
  if (Array.isArray(defaults)) return Array.isArray(existing) ? existing : defaults;
  if (!isObject(defaults)) return existing === undefined || existing === null || existing === '' ? defaults : existing;
  const output = isObject(existing) ? { ...existing } : {};
  for (const [key, value] of Object.entries(defaults)) output[key] = mergeDefaults(output[key], value);
  return output;
}
function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

const dataFiles = ['siteHeader', 'siteFooter', 'homePage', 'theme', 'formsConfig', 'taxonomies'];
for (const name of dataFiles) {
  const defaults = readJson(path.join(defaultsDir, `${name}.json`));
  const target = path.join(dataDir, `${name}.json`);
  writeJson(target, mergeDefaults(readJson(target), defaults));
}

const sitePath = path.join(dataDir, 'site.json');
const site = readJson(sitePath, {});
const siteExtras = {
  logo_dark: '',
  logo_light: '',
  mobile_logo: '',
  team: [],
  forms: { booking_google_form: '', contact_formspree: '', newsletter_formspree: '' },
  contact: { whatsapp:'', telegram:'', messenger:'', line:'', wechat_id:'', wechat_qr:'', viber:'', kakaotalk:'', vk:'', max_russia:'', signal:'', zalo:'', imo:'', skype:'' },
  social: { facebook:'', instagram:'', youtube:'', linkedin:'', tripadvisor:'', x:'', tiktok:'', pinterest:'', threads:'', google_business:'', bluesky:'' },
  ratings: { google_score:'', google_url:'', tripadvisor_score:'', tripadvisor_url:'' },
  seo: { default_social_image:'/assets/uploads/brand/karakoram-vision-og.jpg', twitter_handle:'', default_author:'Karakoram Vision Editorial Team', default_reviewer:'Karakoram Vision Travel Team' },
  business: { legal_name:site.name || 'Karakoram Vision Pakistan', founded_year:'', license_number:'', price_currency:'USD' },
  geo: { country_code:'PK', country:'Pakistan', city:'Islamabad', latitude:'', longitude:'', service_areas:[] },
  verification: { google:'', bing:'', yandex:'' },
  performance: { web_vitals_endpoint:'', service_worker:true },
  ai: { allow_search_crawlers:true, allow_model_training:false, content_license:'All rights reserved.' },
  home_faqs: []
};
writeJson(sitePath, mergeDefaults(site, siteExtras));

const menuPath = path.join(dataDir, 'menu.json');
const menu = readJson(menuPath, { items: [] });
function normalizeMenu(items = []) {
  return items.map(item => ({
    enabled: item.enabled !== false,
    target_blank: item.target_blank === true,
    ...item,
    ...(Array.isArray(item.children) ? { children: normalizeMenu(item.children) } : {})
  }));
}
menu.items = normalizeMenu(menu.items || []);
writeJson(menuPath, menu);

const gitignorePath = path.join(root, '.gitignore');
const requiredIgnores = ['.v*-backup-*', '.v*-theme-backup-*', 'V*_PATCH/', '*_PATCH_ROOT.zip', 'FULL_FLEX_CMS_V11_REPORT.json'];
const existingIgnore = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
const additions = requiredIgnores.filter(line => !existingIgnore.split(/\r?\n/).includes(line));
if (additions.length) fs.appendFileSync(gitignorePath, `\n# Local patch backups and payloads\n${additions.join('\n')}\n`, 'utf8');

console.log(JSON.stringify({
  completed: true,
  data_files_ready: dataFiles.map(name => `src/_data/${name}.json`),
  site_settings_extended: true,
  menu_items_normalized: menu.items.length,
  pages_cms_config: '.pages.yml'
}, null, 2));
console.log('FULL_FLEX_CMS_V11_DATA_READY');
