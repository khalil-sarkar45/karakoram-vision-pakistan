import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const menuPath=path.join(root,'src/_data/menu.json');
const menu=JSON.parse(fs.readFileSync(menuPath,'utf8'));
const findTop=label=>menu.items.find(item=>item.label===label);
const findChild=(parent,label)=>(parent?.children||[]).find(item=>item.label===label);
const setUrl=(item,url)=>{if(item)item.url=url;};

const tours=findTop('Tours');
setUrl(findChild(tours,'Fixed Departures'),'/tours/fixed-departures/');
const trekking=findTop('Trekking');
setUrl(findChild(trekking,'All Fixed Departures'),'/trekking/fixed-departures/');
const k2=findChild(trekking,'K2 Treks'); if(k2){k2.url='/trekking/k2-treks/';const view=findChild(k2,'View all K2 treks');setUrl(view,'/trekking/k2-treks/');}
const trekBest=findChild(trekking,'Best Sellers'); if(trekBest){trekBest.url='/trekking/best-sellers/';if(!findChild(trekBest,'View all best-selling treks'))trekBest.children.push({label:'View all best-selling treks',url:'/trekking/best-sellers/'});}
const expeditions=findTop('Expeditions');
setUrl(findChild(expeditions,'All Fixed Departures'),'/expeditions/fixed-departures/');
const peaks=findChild(expeditions,'8,000m Peaks');if(peaks){peaks.url='/expeditions/8000m-peaks/';if(!findChild(peaks,'View all 8,000m expeditions'))peaks.children.push({label:'View all 8,000m expeditions',url:'/expeditions/8000m-peaks/'});}
const holiday=findTop('Holiday Types');setUrl(findChild(holiday,'Cultural Tours'),'/tours/cultural-tours/');
const international=findTop('International Travelers');setUrl(findChild(international,'Tour Calendar'),'/trip-calendar/');
fs.writeFileSync(menuPath,JSON.stringify(menu,null,2)+'\n');

const pagesPath=path.join(root,'.pages.yml');
if(fs.existsSync(pagesPath)){
  let text=fs.readFileSync(pagesPath,'utf8');
  const entry=/^- name: ([^\n]+)$/gm;
  const entries=[...text.matchAll(entry)].map(m=>({name:m[1].trim(),start:m.index}));
  const targets=new Set(['tours','trekking','expeditions','jeep_safaris','hunting_services']);
  const fields=`  - name: fixed_departure\n    label: Fixed departure\n    type: boolean\n    default: false\n  - name: departure_type\n    label: Departure type\n    type: select\n    options:\n    - fixed\n    - private\n    - on-request\n  - name: best_seller\n    label: Best seller / featured\n    type: boolean\n    default: false\n`;
  for(let i=entries.length-1;i>=0;i--){const e=entries[i];if(!targets.has(e.name))continue;const end=i+1<entries.length?entries[i+1].start:text.length;const chunk=text.slice(e.start,end);if(chunk.includes('  - name: fixed_departure\n'))continue;const anchor='  - name: group_size\n';const at=chunk.indexOf(anchor);if(at>=0)text=text.slice(0,e.start+at)+fields+text.slice(e.start+at);else text=text.slice(0,end)+fields+text.slice(end);}
  fs.writeFileSync(pagesPath,text);
}
console.log('STRUCTURED_NAVIGATION_AND_CMS_V10_3_UPDATED');
