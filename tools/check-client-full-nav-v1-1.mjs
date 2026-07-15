import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const menuPath = path.join(root, 'src/_data/menu.json');
const menu = JSON.parse(fs.readFileSync(menuPath, 'utf8'));
const expectedTop = [
  'Home', 'Holiday Types', 'Tours', 'International Travelers', 'Trekking',
  'Expeditions', 'Special Interests', 'Jeep Safaris', 'Hunting', 'News',
  'Contact', 'About'
];
const actualTop = (menu.items || []).filter(i => i.enabled !== false).map(i => i.label);
for (const label of expectedTop) {
  if (!actualTop.includes(label)) throw new Error(`Missing top-level menu: ${label}`);
}
let maxDepth = 0;
let totalItems = 0;
let nestedGroups = 0;
const directRoutes = [];
function walk(items, depth = 1) {
  maxDepth = Math.max(maxDepth, depth);
  for (const item of items || []) {
    if (item.enabled === false) continue;
    totalItems += 1;
    if (item.url && !item.url.includes('?') && !item.url.startsWith('/search/')) directRoutes.push(item.url);
    if (item.children?.length) {
      nestedGroups += 1;
      walk(item.children, depth + 1);
    }
  }
}
walk(menu.items);
if (maxDepth < 3) throw new Error(`Nested navigation missing. Found depth ${maxDepth}, expected at least 3.`);
if (nestedGroups < 10) throw new Error(`Too few nested menu groups: ${nestedGroups}`);

const missing = [];
for (const url of new Set(directRoutes)) {
  const clean = url.replace(/^\//, '').replace(/\/$/, '');
  const built = clean ? path.join(root, '_site', clean, 'index.html') : path.join(root, '_site', 'index.html');
  if (!fs.existsSync(built)) missing.push(url);
}
if (missing.length) throw new Error(`Missing built menu routes: ${missing.join(', ')}`);

const home = fs.readFileSync(path.join(root, '_site/index.html'), 'utf8');
for (const token of ['data-nav-menu', 'data-submenu-trigger', 'bk-submenu-level-2', 'bk-mobile-details']) {
  if (!home.includes(token)) throw new Error(`Built navigation missing token: ${token}`);
}
if (!home.includes('Contact Karakoram Vision Pakistan')) throw new Error('Client contact branding missing in menu.');
if (!home.includes('About Karakoram Vision Pakistan')) throw new Error('Client about branding missing in menu.');

console.log(JSON.stringify({
  status: 'KARAKORAM_VISION_FULL_NAV_V1_1_AUDIT_PASSED',
  topLevelItems: actualTop.length,
  totalVisibleItems: totalItems,
  maxDepth,
  nestedGroups,
  missingRoutes: 0
}, null, 2));
