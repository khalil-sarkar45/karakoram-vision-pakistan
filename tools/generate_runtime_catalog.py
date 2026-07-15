from pathlib import Path
import re,yaml,json,html
ROOT=Path(__file__).resolve().parents[1]
FOLDERS=['tours','trekking','expeditions','jeep-safaris','hunting-services','blog','vehicles','pages']
items=[];knowledge=[]

def clean_text(value,limit=500):
    s=str(value or '')
    s=re.sub(r'<[^>]+>',' ',s)
    s=re.sub(r'[#*_`>\[\]()]',' ',s)
    s=html.unescape(re.sub(r'\s+',' ',s)).strip()
    return s[:limit]

for folder in FOLDERS:
  for p in (ROOT/'src/content'/folder).glob('*.md'):
    s=p.read_text('utf-8',errors='ignore');m=re.match(r'^---\n(.*?)\n---\n?(.*)$',s,re.S)
    if not m: continue
    d=yaml.safe_load(m.group(1)) or {};body=m.group(2)
    if d.get('published') is False: continue
    robots=str((d.get('seo') or {}).get('robots','')).lower()
    if 'noindex' in robots: continue
    url=d.get('permalink','')
    item={'title':d.get('title',''),'url':url,'type':folder,'summary':d.get('summary',''),'image':d.get('cover_image') or d.get('cover_source') or '/assets/uploads/placeholder.svg','duration':d.get('duration',''),'price':d.get('price_from',''),'destination':d.get('destination','')}
    items.append(item)
    knowledge.append({**item,'answer_summary':d.get('answer_summary') or d.get('summary',''),'key_facts':d.get('key_facts') or [],'faqs':d.get('faqs') or [],'author':d.get('author',''),'reviewed_by':d.get('reviewed_by',''),'last_verified':str(d.get('last_verified') or ''),'excerpt':clean_text(body)})
items.sort(key=lambda x:x['title'].lower());knowledge.sort(key=lambda x:x['title'].lower())
out=ROOT/'functions/_data';out.mkdir(parents=True,exist_ok=True)
(out/'catalog.js').write_text('export const catalog='+json.dumps(items,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
(out/'knowledge.js').write_text('export const knowledge='+json.dumps(knowledge,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
(ROOT/'src/_data/search-index.json').write_text(json.dumps(items,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
report={'items':len(items),'knowledge_items':len(knowledge),'by_type':{t:sum(1 for x in items if x['type']==t) for t in FOLDERS}}
(ROOT/'RUNTIME_CATALOG_REPORT.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(f'Generated {len(items)} runtime catalog items')
