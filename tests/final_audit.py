from pathlib import Path
from urllib.parse import urlparse, unquote
from statistics import median
from bs4 import BeautifulSoup
import json, re, sys

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / '_site'
html_files = list(SITE.rglob('*.html'))
route_set = set()
for p in html_files:
    rel = p.relative_to(SITE).as_posix()
    if rel == 'index.html': route_set.add('/')
    elif rel.endswith('/index.html'): route_set.add('/' + rel[:-10])
    else: route_set.add('/' + rel)

broken=[]; pending_media=0; indexable=0; noindex_count=0; scores=[]; below90=[]
advanced_issues=[]; schema_errors=0; img_issues=0; html_sizes=[]
for p in html_files:
    raw=p.read_text('utf-8',errors='ignore'); html_sizes.append(p.stat().st_size/1024)
    s=BeautifulSoup(raw,'html.parser')
    for a in s.find_all('a',href=True):
        h=a['href'].strip()
        if not h.startswith('/') or h.startswith('//'): continue
        path=unquote(urlparse(h).path)
        if path.startswith(('/assets/','/api/','/.well-known/','/wp-content/uploads/')): continue
        if path not in route_set and not (SITE/path.lstrip('/')).exists(): broken.append((str(p.relative_to(SITE)),h))
    pending_media += raw.count('apricottours.pk/wp-content/uploads')
    robots=s.find('meta',attrs={'name':'robots'}); noindex=bool(robots and 'noindex' in robots.get('content','').lower())
    if noindex: noindex_count+=1; continue
    indexable+=1
    score=100; issues=[]
    title=s.find('title'); desc=s.find('meta',attrs={'name':'description'}); canon=s.find('link',rel='canonical')
    h1=s.find('h1'); og=s.find('meta',attrs={'property':'og:title'}); tw=s.find('meta',attrs={'name':'twitter:card'})
    for ok,msg,penalty in [
        (bool(title and title.get_text(strip=True)),'title',15),(bool(desc and desc.get('content')),'description',15),
        (bool(canon and canon.get('href')),'canonical',15),(bool(h1),'h1',10),(bool(og),'open graph',10),(bool(tw),'twitter card',5),
        (bool(s.html and s.html.get('lang')),'html lang',5),(bool(s.find('main',id='main-content')),'semantic main',5),
        (bool(s.find('a',href='#main-content')),'skip link',5)]:
        if not ok: score-=penalty; issues.append(msg)
    scripts=s.find_all('script',attrs={'type':'application/ld+json'})
    if not scripts: score-=10; issues.append('JSON-LD')
    for sc in scripts:
        try: json.loads(sc.get_text())
        except Exception as e: schema_errors+=1; advanced_issues.append((str(p.relative_to(SITE)),f'invalid JSON-LD: {e}'))
    for img in s.find_all('img'):
        if img.get('alt') is None or not img.get('width') or not img.get('height') or not img.get('decoding'):
            img_issues+=1; advanced_issues.append((str(p.relative_to(SITE)),'image lacks alt/width/height/decoding')); break
    scores.append(score)
    if score<90: below90.append((str(p.relative_to(SITE)),score,issues))

required=['robots.txt','sitemap.xml','llms.txt','llms-full.txt','feed.xml','manifest.webmanifest','.well-known/security.txt','humans.txt','sw.js']
missing=[x for x in required if not (SITE/x).exists()]
robots_text=(SITE/'robots.txt').read_text('utf-8',errors='ignore') if (SITE/'robots.txt').exists() else ''
policy={
 'oai_search_allowed':'User-agent: OAI-SearchBot' in robots_text and 'Allow: /' in robots_text,
 'gptbot_policy':'User-agent: GPTBot' in robots_text,
 'sitemap_declared':'Sitemap:' in robots_text,
 'content_api_bundled':(ROOT/'functions/api/content.js').exists(),
 'server_middleware':(ROOT/'functions/_middleware.js').exists(),
}
css_kb=sum(p.stat().st_size for p in (SITE/'assets').rglob('*.css'))/1024 if (SITE/'assets').exists() else 0
js_kb=sum(p.stat().st_size for p in (SITE/'assets').rglob('*.js'))/1024 if (SITE/'assets').exists() else 0
external_scripts=0
for p in html_files[:2500]:
    s=BeautifulSoup(p.read_text('utf-8',errors='ignore'),'html.parser')
    external_scripts += sum(1 for sc in s.find_all('script',src=True) if str(sc['src']).startswith(('http://','https://')))

build_report={'html_files':len(html_files),'broken_internal_page_links':len(broken),'pending_media_links_before_asset_import':pending_media,'broken_sample':broken[:20]}
seo_report={'indexable_html_pages':indexable,'redirect_or_protected_noindex_pages':noindex_count,'average_score':round(sum(scores)/len(scores),2) if scores else 0,'pages_below_90':len(below90),'issues_sample':below90[:20]}
advanced_report={'required_files_missing':missing,'indexable_pages_checked':indexable,'schema_errors':schema_errors,'policy_checks':policy,'issues_count':len(advanced_issues),'issues_sample':advanced_issues[:50]}
perf_report={'css_kb':round(css_kb,2),'javascript_kb':round(js_kb,2),'html_pages':len(html_files),'median_html_kb':round(median(html_sizes),2) if html_sizes else 0,'largest_html_kb':round(max(html_sizes),2) if html_sizes else 0,'pages_with_image_dimension_or_decoding_issue':img_issues,'external_script_tags':external_scripts,'budgets':{'css_kb_max':180,'javascript_kb_max':220,'largest_html_kb_max':2048},'critical':[]}
if css_kb>180: perf_report['critical'].append('CSS budget exceeded')
if js_kb>220: perf_report['critical'].append('JavaScript budget exceeded')
if html_sizes and max(html_sizes)>2048: perf_report['critical'].append('HTML page budget exceeded')
for name,data in [('BUILD_REPORT_FINAL.json',build_report),('SEO_AUDIT_REPORT.json',seo_report),('ADVANCED_DISCOVERY_AUDIT.json',advanced_report),('PERFORMANCE_BUDGET_REPORT.json',perf_report)]:
    (ROOT/name).write_text(json.dumps(data,indent=2),encoding='utf-8')
print(json.dumps({'build':build_report,'seo':seo_report,'advanced':advanced_report,'performance':perf_report},indent=2))
failed=bool(broken or missing or schema_errors or advanced_issues or below90 or perf_report['critical'] or not all(policy.values()))
if failed: sys.exit(1)
print('ALL_ADVANCED_TESTS_PASSED')
