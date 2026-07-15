import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const src=path.join(root,'src');
let files=0, replacements=0;
function walk(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,entry.name);
    if(entry.isDirectory()) walk(p);
    else if(entry.isFile() && /\.(njk|html|md)$/.test(entry.name)){
      let text=fs.readFileSync(p,'utf8');
      const before=text;
      text=text.replace(/href="\/plan-a-trip\/\?([^"#]*)"/g,(_m,q)=>`href="/plan-a-trip/?${q}#trip-request-form"`);
      text=text.replace(/href="\/plan-a-trip\/"/g,'href="/plan-a-trip/#trip-request-form"');
      if(text!==before){fs.writeFileSync(p,text,'utf8');files++;replacements+=(before.match(/href="\/plan-a-trip\//g)||[]).length;}
    }
  }
}
walk(src);
console.log(JSON.stringify({files_updated:files,plan_links_processed:replacements},null,2));
