from pathlib import Path
import re,json,sys
root=Path(__file__).resolve().parents[1]/'_site'
html=list(root.rglob('*.html'));broken=[];pending_media=[]
media_ext=re.compile(r'\.(?:jpe?g|jpe|png|gif|webp|svg|avif|pdf|docx?|xlsx?|zip)(?:$|\?)',re.I)
for p in html:
 s=p.read_text('utf-8',errors='ignore')
 for href in re.findall(r'href=["\']([^"\']+)',s):
  if not href.startswith('/') or href.startswith('//') or href.startswith('/api/'): continue
  clean=href.split('#')[0].split('?')[0]
  if not clean: continue
  if clean.startswith('/wp-content/uploads/') or media_ext.search(clean):
   pending_media.append({'page':str(p.relative_to(root)),'href':href});continue
  target=root/clean.lstrip('/')
  ok=target.exists() or (target/'index.html').exists() or (root/(clean.lstrip('/')+'.html')).exists()
  if not ok: broken.append({'page':str(p.relative_to(root)),'href':href})
report={'html_files':len(html),'broken_internal_page_links':len(broken),'pending_media_links_before_asset_import':len(pending_media),'broken_sample':broken[:100]}
(Path(__file__).resolve().parents[1]/'BUILD_REPORT_FINAL.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
if broken: sys.exit(1)
