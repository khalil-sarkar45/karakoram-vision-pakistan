import {readFile,writeFile} from 'node:fs/promises';
const key=(process.env.INDEXNOW_KEY||'').trim();
if(!key){console.error('Set INDEXNOW_KEY first. Example in PowerShell: $env:INDEXNOW_KEY="your-key"');process.exit(1)}
const site=JSON.parse(await readFile('src/_data/site.json','utf8'));const base=site.url.replace(/\/$/,'');
await writeFile(`src/${key}.txt`,key+'\n','utf8');
let xml='';try{xml=await readFile('_site/sitemap.xml','utf8')}catch{console.error('Run npm run build first. The key file was created in src/. Deploy it before submitting.');process.exit(1)}
const urls=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]).filter(u=>u.startsWith(base)).slice(0,10000);
if(process.env.SUBMIT_INDEXNOW!=='1'){console.log(`Prepared src/${key}.txt and found ${urls.length} URLs. Deploy, then run with SUBMIT_INDEXNOW=1.`);process.exit(0)}
const response=await fetch('https://api.indexnow.org/indexnow',{method:'POST',headers:{'content-type':'application/json; charset=utf-8'},body:JSON.stringify({host:new URL(base).host,key,keyLocation:`${base}/${key}.txt`,urlList:urls})});
console.log(`IndexNow response: ${response.status} ${response.statusText}`);if(!response.ok)process.exit(1);
