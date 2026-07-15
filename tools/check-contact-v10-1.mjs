import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const site=JSON.parse(read('src/_data/site.json'));
const checks={
  whatsapp_configured:/^\d{8,16}$/.test(site.contact?.whatsapp||''),
  floating_component:read('src/_includes/components/floating-contact.njk').includes('bk-floating-whatsapp'),
  direct_contact_component:read('src/_includes/components/contact-channel-buttons.njk').includes('Choose other contact'),
  robust_runtime:read('src/assets/js/contact-runtime-v10-1.js').includes('KarakoramVisionContact'),
  base_runtime_loaded:read('src/_includes/layouts/base.njk').includes('contact-runtime-v10-1.js?v=10.1.0'),
  css_marker:read('src/assets/css/input.css').includes('Contact Actions V10.1'),
  built_home:exists('_site/index.html'),
  built_contact:exists('_site/contact-us/index.html'),
  built_plan:exists('_site/plan-a-trip/index.html')
};
if(checks.built_home){const h=read('_site/index.html');checks.built_floating_whatsapp=h.includes('bk-floating-whatsapp')&&h.includes('wa.me/');checks.built_lets_talk=h.includes("Let's Talk")&&h.includes('data-open-contact');}
const samples=[];
for(const service of ['tours','trekking','expeditions','jeep-safaris','hunting-services']){const dir=path.join(root,'_site',service);if(!fs.existsSync(dir))continue;for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name,'index.html');if(e.isDirectory()&&fs.existsSync(f)){samples.push(fs.readFileSync(f,'utf8'));if(samples.length>=6)break;}}if(samples.length>=6)break;}
checks.built_journey_channels=samples.some(h=>h.includes('bk-contact-channel-email')&&h.includes('bk-contact-channel-whatsapp')&&h.includes('Choose other contact'));
const issues=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
const report={version:'10.1.0',checks,issues_count:issues.length,issues};
fs.writeFileSync(path.join(root,'CONTACT_ACTIONS_V10_1_REPORT.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(issues.length)process.exit(1);
console.log('CONTACT_ACTIONS_V10_1_AUDIT_PASSED');
