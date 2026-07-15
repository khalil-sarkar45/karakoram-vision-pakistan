from pathlib import Path
from bs4 import BeautifulSoup
import json,sys
root=Path(__file__).resolve().parents[1]/'_site'
files=list(root.rglob('index.html'))
issues=[];scores=[];skipped_redirects=0
for p in files:
 s=BeautifulSoup(p.read_text('utf-8',errors='ignore'),'html.parser')
 robots=s.find('meta',attrs={'name':'robots'})
 refresh=s.find('meta',attrs={'http-equiv':lambda v:v and v.lower()=='refresh'})
 if refresh or (robots and 'noindex' in robots.get('content','').lower()):
  skipped_redirects+=1;continue
 score=100
 title=s.title.get_text(strip=True) if s.title else ''
 desc=s.find('meta',attrs={'name':'description'});desc=desc.get('content','').strip() if desc else ''
 canon=s.find('link',rel='canonical');h1=s.find_all('h1')
 if not title: issues.append((str(p),'missing title'));score-=25
 if not desc: issues.append((str(p),'missing description'));score-=20
 if not canon or not canon.get('href'): issues.append((str(p),'missing canonical'));score-=20
 if len(h1)!=1: issues.append((str(p),f'h1 count {len(h1)}'));score-=15
 if not s.find('script',attrs={'type':'application/ld+json'}): issues.append((str(p),'missing schema'));score-=10
 for im in s.find_all('img'):
  if not im.get('alt'): score-=1;issues.append((str(p),'image missing alt'));break
 scores.append(max(score,0))
report={'indexable_html_pages':len(scores),'redirect_noindex_pages':skipped_redirects,'average_score':round(sum(scores)/len(scores),2) if scores else 0,'pages_below_90':sum(1 for x in scores if x<90),'issues_sample':issues[:100]}
(Path(__file__).resolve().parents[1]/'SEO_AUDIT_REPORT.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
if report['average_score']<90:sys.exit(1)
