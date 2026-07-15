const fs=require('fs'); const path=require('path');
let pages=[];
function walk(d){ for(const name of fs.readdirSync(d,{withFileTypes:true})){ const p=path.join(d,name.name); if(name.isDirectory()) walk(p); else if(p.endsWith('.html')) pages.push(p); } }
walk('_site');
const results=[];
pages.forEach(p=>{
  const t=fs.readFileSync(p,'utf8');
  if(!t.includes('<nav id="bk-mobile-menu"')) return;
  const navStart = t.indexOf('<nav id="bk-mobile-menu"');
  const navEnd = t.indexOf('</nav>', navStart);
  const nav = t.slice(navStart, navEnd === -1 ? t.length : navEnd+6);
  const hx = (nav.match(/hx-[a-zA-Z-]+/g) || []);
  const summaries = (nav.match(/<summary/gi) || []).length;
  const details = (nav.match(/bk-mobile-details/gi) || []).length;
  const links = (nav.match(/<a /gi) || []).length;
  results.push({page: p, summaries, details, links, hx: Array.from(new Set(hx))});
});
console.log(JSON.stringify(results, null, 2));
