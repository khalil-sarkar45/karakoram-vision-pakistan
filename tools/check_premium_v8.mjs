import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const issues=[];
const checks={};
const requireCheck=(name,condition,detail='')=>{checks[name]=Boolean(condition);if(!condition)issues.push([name,detail]);};

const menu=JSON.parse(read('src/_data/menu.json'));
const languages=JSON.parse(read('src/_data/languages.json'));
const flatten=(items,level=1,out=[])=>{for(const item of items||[]){out.push({label:item.label,url:item.url,level,children:Boolean(item.children)});if(item.children)flatten(item.children,level+1,out);}return out;};
const flat=flatten(menu.items);
const labels=new Set(flat.map(x=>x.label));
requireCheck('menu_has_holiday_types',labels.has('Holiday Types'));
requireCheck('menu_has_international_travelers',labels.has('International Travelers'));
requireCheck('menu_has_trekking',labels.has('Trekking'));
requireCheck('menu_has_expeditions',labels.has('Expeditions'));
requireCheck('menu_has_special_interests',labels.has('Special Interests'));
requireCheck('menu_has_jeep_safaris',labels.has('Jeep Safaris'));
requireCheck('menu_has_hunting',labels.has('Hunting'));
requireCheck('menu_has_three_levels',Math.max(...flat.map(x=>x.level))>=3);
requireCheck('menu_has_starred_items',JSON.stringify(menu).includes('★'));
requireCheck('language_count_20_plus',languages.length>=20,`Found ${languages.length}`);

const sourceFiles={
 home:'src/index.njk',header:'src/_includes/components/header.njk',hero:'src/_includes/components/landing-hero.njk',finder:'src/_includes/components/trip-finder.njk',card:'src/_includes/components/journey-card.njk',css:'src/assets/css/input.css',js:'src/assets/js/site-core.js',api:'functions/api/catalog.js'
};
for(const [name,file] of Object.entries(sourceFiles))requireCheck(`source_${name}`,exists(file),file);
const home=read(sourceFiles.home),header=read(sourceFiles.header),hero=read(sourceFiles.hero),card=read(sourceFiles.card),css=read(sourceFiles.css),js=read(sourceFiles.js),api=read(sourceFiles.api);
requireCheck('home_3d_slider',home.includes('components/landing-hero.njk'));
requireCheck('home_trip_finder',home.includes('heroFinder = true'));
requireCheck('header_language_selector',header.includes('data-language-select'));
requireCheck('hero_autoplay',hero.includes('data-autoplay'));
requireCheck('hero_controls',hero.includes('data-hero-prev')&&hero.includes('data-hero-next'));
requireCheck('hero_3d_css',css.includes('perspective: 1800px')&&css.includes('rotateY'));
requireCheck('book_now_static_cards',card.toLowerCase().includes('book now'));
requireCheck('book_now_htmx_cards',api.toLowerCase().includes('book now'));
requireCheck('slider_javascript',js.includes('initHeroSliders'));
requireCheck('language_javascript',js.includes('initLanguageSelector'));
requireCheck('palette_not_old_green_or_orange',!/green-[0-9]|#(?:0?0?8|ff7|f60|ff6b00)/i.test(css),'Old green/orange token detected');
requireCheck('no_inline_style_in_new_templates',![home,header,hero,card].some(x=>/\sstyle\s*=/.test(x)));

const landingRoutes=['','tours','trekking','expeditions','jeep-safaris','hunting-services','holiday-types','international-travelers','special-interests','destinations','blog','news','vehicles','plan-a-trip','contact-us'];
if(exists('_site/index.html')){
  for(const route of landingRoutes){
    const file=route?`_site/${route}/index.html`:'_site/index.html';
    requireCheck(`built_route_${route||'home'}`,exists(file),file);
    if(exists(file)){
      const html=read(file);
      requireCheck(`built_hero_${route||'home'}`,html.includes('data-hero-slider'),file);
    }
  }
  const builtHome=read('_site/index.html');
  requireCheck('built_home_finder',builtHome.includes('bk-trip-finder'));
  requireCheck('built_home_language',builtHome.includes('data-language-select'));
  requireCheck('built_home_recursive_menu',(builtHome.match(/bk-submenu-level-/g)||[]).length>=3);
  requireCheck('built_home_book_now',builtHome.toLowerCase().includes('book now'));
  const htmlFiles=[];
  const walk=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else if(entry.name.endsWith('.html'))htmlFiles.push(full);}};
  walk(path.join(root,'_site'));
  let inlineStyles=0,inlineHandlers=0,apricotText=0;
  for(const file of htmlFiles){const html=fs.readFileSync(file,'utf8');inlineStyles+=(html.match(/\sstyle\s*=/gi)||[]).length;inlineHandlers+=(html.match(/\son(?:click|mouseover|mouseenter|load|error)\s*=/gi)||[]).length;apricotText+=(html.match(/Apricot\s+Tours/gi)||[]).length;}
  requireCheck('built_inline_styles_zero',inlineStyles===0,String(inlineStyles));
  requireCheck('built_inline_handlers_zero',inlineHandlers===0,String(inlineHandlers));
  requireCheck('built_visible_apricot_text_zero',apricotText===0,String(apricotText));
  checks.html_files_checked=htmlFiles.length;
}else{
  issues.push(['build_missing','Run npm.cmd run build before this audit.']);
}

const report={version:'8.0.0',checks,issues_count:issues.length,issues};
fs.writeFileSync(path.join(root,'PREMIUM_UI_V8_AUDIT.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(issues.length)process.exit(1);
console.log('PREMIUM_COMPLETE_UI_V8_AUDIT_PASSED');
