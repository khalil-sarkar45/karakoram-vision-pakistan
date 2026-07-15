import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const menu=JSON.parse(fs.readFileSync(path.join(root,'src/_data/menu.json'),'utf8'));
let maxDepth=0, links=[];
function walk(items,depth=1){
  maxDepth=Math.max(maxDepth,depth);
  for(const item of items||[]){
    if(item.url) links.push(item.url);
    if(item.children) walk(item.children,depth+1);
  }
}
walk(menu.items);
if(maxDepth<3) throw new Error(`Expected at least 3 menu levels, found ${maxDepth}`);
const missing=[];
for(const url of links){
  if(url.startsWith('/search/')||url.includes('?')) continue;
  const clean=url.replace(/^\//,'').replace(/\/$/,'');
  const file=path.join(root,'_site',clean,'index.html');
  if(!fs.existsSync(file)) missing.push(url);
}
const home=fs.readFileSync(path.join(root,'_site/index.html'),'utf8');
for(const token of ['data-nav-menu','data-submenu-trigger','bk-submenu-level-2','bk-mobile-details','Plan a Trip']){
  if(!home.includes(token)) throw new Error(`Built navigation missing ${token}`);
}
if(missing.length) throw new Error(`Missing menu routes: ${missing.join(', ')}`);
console.log(JSON.stringify({status:'passed',maxDepth,menuLinks:links.length,missingRoutes:0},null,2));
