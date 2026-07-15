from pathlib import Path
from bs4 import BeautifulSoup
import json,sys,re
ROOT=Path(__file__).resolve().parents[1];SITE=ROOT/'_site'
required=['robots.txt','sitemap.xml','llms.txt','llms-full.txt','feed.xml','manifest.webmanifest','.well-known/security.txt','humans.txt','sw.js']
missing=[x for x in required if not (SITE/x).exists()]
issues=[];checked=0;schema_errors=0
for p in list(SITE.rglob('index.html'))[:2500]:
    s=BeautifulSoup(p.read_text('utf-8',errors='ignore'),'html.parser')
    robots=s.find('meta',attrs={'name':'robots'});noindex=robots and 'noindex' in robots.get('content','').lower()
    if noindex: continue
    checked+=1
    if not s.html or not s.html.get('lang'): issues.append((str(p.relative_to(SITE)),'missing html lang'))
    if not s.find('main',id='main-content'): issues.append((str(p.relative_to(SITE)),'missing semantic main'))
    if not s.find('a',href='#main-content'): issues.append((str(p.relative_to(SITE)),'missing skip link'))
    if not s.find('meta',attrs={'property':'og:title'}): issues.append((str(p.relative_to(SITE)),'missing Open Graph'))
    if not s.find('meta',attrs={'name':'twitter:card'}): issues.append((str(p.relative_to(SITE)),'missing Twitter card'))
    scripts=s.find_all('script',attrs={'type':'application/ld+json'})
    if not scripts: issues.append((str(p.relative_to(SITE)),'missing JSON-LD'))
    for sc in scripts:
        try: json.loads(sc.get_text())
        except Exception as e: schema_errors+=1;issues.append((str(p.relative_to(SITE)),f'invalid JSON-LD: {e}'))
    for img in s.find_all('img'):
        if not img.get('alt') or not img.get('width') or not img.get('height'):
            issues.append((str(p.relative_to(SITE)),'image lacks alt/width/height'));break
robots=(SITE/'robots.txt').read_text('utf-8',errors='ignore') if (SITE/'robots.txt').exists() else ''
checks={'oai_search_allowed':'User-agent: OAI-SearchBot' in robots and 'Allow: /' in robots,'gptbot_policy':'User-agent: GPTBot' in robots,'sitemap_declared':'Sitemap:' in robots,'content_api_bundled':(ROOT/'functions/api/content.js').exists(),'server_middleware':(ROOT/'functions/_middleware.js').exists()}
report={'required_files_missing':missing,'indexable_pages_checked':checked,'schema_errors':schema_errors,'policy_checks':checks,'issues_count':len(issues),'issues_sample':issues[:100]}
(ROOT/'ADVANCED_DISCOVERY_AUDIT.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report,indent=2))
if missing or schema_errors or not all(checks.values()) or len(issues)>max(10,checked//100): sys.exit(1)
