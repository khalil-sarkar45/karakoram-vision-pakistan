import {readdirSync,readFileSync,writeFileSync,statSync} from 'node:fs';
import {join,relative} from 'node:path';
const root=process.cwd();
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(join(dir,entry.name)):[join(dir,entry.name)]);
const textFiles=walk(join(root,'src')).filter(file=>/\.(md|njk|html|json|js|css)$/i.test(file));
const visibleBrand=[]; const remoteMedia=[];
for(const file of textFiles){
  const text=readFileSync(file,'utf8');
  const rel=relative(root,file);
  const lines=text.split(/\r?\n/);
  lines.forEach((line,index)=>{
    if(/Apricot\s+Tours/i.test(line) && !/imported_from:|source:|canonical:|url:/i.test(line)) visibleBrand.push({file:rel,line:index+1,text:line.trim().slice(0,220)});
    if(/https?:\/\/(?:www\.)?apricottours\.pk\/wp-content\/uploads/i.test(line)) remoteMedia.push({file:rel,line:index+1});
  });
}
const uploadDir=join(root,'src','assets','uploads');
const suspiciousAssets=statSync(uploadDir,{throwIfNoEntry:false})?walk(uploadDir).filter(file=>/apricot|watermark|old[-_ ]?logo/i.test(file)).map(file=>relative(root,file)):[];
const report={generated_at:new Date().toISOString(),visible_old_brand_references:visibleBrand.length,remote_legacy_media_references:remoteMedia.length,suspicious_asset_filenames:suspiciousAssets.length,visible_brand_sample:visibleBrand.slice(0,30),remote_media_sample:remoteMedia.slice(0,30),suspicious_assets:suspiciousAssets.slice(0,100),note:'Template-level protection blocks legacy-domain images and visible old-brand text. A watermark baked into local image pixels needs the original clean image or a separately reviewed crop/edit.'};
writeFileSync(join(root,'BRAND_MEDIA_AUDIT.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
