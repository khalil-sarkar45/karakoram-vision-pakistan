from pathlib import Path
from bs4 import BeautifulSoup
import json,statistics,sys
ROOT=Path(__file__).resolve().parents[1];SITE=ROOT/'_site'
css=list((SITE/'assets/css').glob('*.css'));js=list((SITE/'assets').rglob('*.js'));html=list(SITE.rglob('*.html'))
css_bytes=sum(p.stat().st_size for p in css);js_bytes=sum(p.stat().st_size for p in js);sizes=[p.stat().st_size for p in html]
image_issues=0;external_script=0
for p in html[:2500]:
 s=BeautifulSoup(p.read_text('utf-8',errors='ignore'),'html.parser')
 for im in s.find_all('img'):
  if not im.get('width') or not im.get('height') or not im.get('decoding'): image_issues+=1;break
 for sc in s.find_all('script',src=True):
  if sc['src'].startswith('http'):external_script+=1
report={'css_kb':round(css_bytes/1024,2),'javascript_kb':round(js_bytes/1024,2),'html_pages':len(html),'median_html_kb':round(statistics.median(sizes)/1024,2) if sizes else 0,'largest_html_kb':round(max(sizes)/1024,2) if sizes else 0,'pages_with_image_dimension_or_decoding_issue':image_issues,'external_script_tags':external_script,'budgets':{'css_kb_max':180,'javascript_kb_max':220,'largest_html_kb_max':2048}}
critical=[]
if report['css_kb']>180:critical.append('CSS budget exceeded')
if report['javascript_kb']>220:critical.append('JavaScript budget exceeded')
if report['largest_html_kb']>2048:critical.append('HTML page exceeds 2 MB')
if external_script:critical.append('External script tag found')
report['critical']=critical
(ROOT/'PERFORMANCE_BUDGET_REPORT.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report,indent=2))
if critical:sys.exit(1)
