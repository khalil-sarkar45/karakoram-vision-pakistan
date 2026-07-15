import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');

const sitePath = path.join(root, 'src/_data/site.json');
const site = readJson(sitePath);
site.contact ||= {};
for (const key of ['whatsapp','telegram','messenger','signal','line','wechat_id','wechat_qr','viber','kakaotalk','zalo','imo','vk','max_russia','skype']) {
  if (!(key in site.contact)) site.contact[key] = '';
}
site.social ||= {};
for (const key of ['facebook','instagram','youtube','linkedin','tripadvisor','x','tiktok','pinterest','threads','google_business','bluesky']) {
  if (!(key in site.social)) site.social[key] = '';
}
site.ratings ||= {google_score:'',google_url:'',tripadvisor_score:'',tripadvisor_url:''};
site.home_faqs ||= [
  {question:'Can I request private dates?',answer:'Yes. Share your preferred dates, group size and route so the team can confirm feasibility and availability.'},
  {question:'Which contact app should I use?',answer:'Use any channel displayed in the international contact hub. Only apps configured in Pages CMS appear.'},
  {question:'Are all prices and departures guaranteed?',answer:'Prices, permits, transport and dates should be reconfirmed before payment because mountain logistics can change.'}
];
writeJson(sitePath, site);

const menuPath = path.join(root, 'src/_data/menu.json');
if (fs.existsSync(menuPath)) {
  const menu = readJson(menuPath);
  menu.items ||= [];
  const toursMenu = menu.items.find(item => item.label === 'Tours');
  if (toursMenu) {
    toursMenu.children ||= [];
    if (!toursMenu.children.some(item => item.label === 'Trip Calendar')) toursMenu.children.push({label:'Trip Calendar',url:'/trip-calendar/',icon:'◷'});
  }
  const aboutMenu = menu.items.find(item => item.label === 'About');
  if (aboutMenu) {
    aboutMenu.children ||= [];
    if (!aboutMenu.children.some(item => item.label === 'Travel Resources')) aboutMenu.children.push({label:'Travel Resources',url:'/travel-resources/',children:[
      {label:'Trip Preparedness',url:'/travel-resources/'},
      {label:'Gear & Packing',url:'/search/?type=blog&q=packing'},
      {label:'Travel Insurance',url:'/search/?type=blog&q=insurance'},
      {label:'Health & Altitude',url:'/search/?type=blog&q=altitude'},
      {label:'FAQs',url:'/faqs/'}
    ]});
  }
  writeJson(menuPath, menu);
}

const pagesPath = path.join(root, '.pages.yml');
if (fs.existsSync(pagesPath)) {
  let text = fs.readFileSync(pagesPath, 'utf8');
  const journeyFields = `  - name: group_size\n    label: Group size\n    type: string\n  - name: deposit\n    label: Deposit\n    type: string\n  - name: trip_status\n    label: Trip status\n    type: select\n    options:\n    - Available\n    - Limited places\n    - Sold out\n    - On request\n    - Coming soon\n  - name: tags\n    label: Trip tags\n    type: string\n    list: true\n  - name: highlights\n    label: Trip highlights\n    type: string\n    list: true\n  - name: included\n    label: Included\n    type: string\n    list: true\n  - name: excluded\n    label: Not included\n    type: string\n    list: true\n  - name: packing_list\n    label: Packing list\n    type: string\n    list: true\n  - name: route_map_url\n    label: Route map URL\n    type: string\n  - name: departure_details\n    label: Detailed departures and prices\n    type: object\n    list: true\n    fields:\n    - name: dates\n      label: Dates\n      type: string\n    - name: status\n      label: Availability status\n      type: string\n    - name: places\n      label: Places\n      type: string\n    - name: deposit\n      label: Deposit\n      type: string\n    - name: price\n      label: Full price\n      type: string\n    - name: note\n      label: Note\n      type: string\n  - name: trip_leader\n    label: Trip leader\n    type: object\n    fields:\n    - name: name\n      label: Name\n      type: string\n    - name: role\n      label: Role\n      type: string\n    - name: image\n      label: Photo\n      type: image\n    - name: bio\n      label: Biography\n      type: text\n  - name: reviews\n    label: Guest reviews\n    type: object\n    list: true\n    fields:\n    - name: quote\n      label: Review\n      type: text\n    - name: name\n      label: Guest name\n      type: string\n    - name: country\n      label: Country\n      type: string\n    - name: rating\n      label: Rating out of 5\n      type: number\n`;

  const topEntry = /^- name: ([^\n]+)$/gm;
  const entries = [...text.matchAll(topEntry)].map(match => ({name:match[1].trim(), start:match.index}));
  const targets = new Set(['tours','trekking','expeditions','jeep_safaris','hunting_services']);
  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i];
    if (!targets.has(entry.name)) continue;
    const end = i + 1 < entries.length ? entries[i + 1].start : text.length;
    const chunk = text.slice(entry.start, end);
    if (chunk.includes('  - name: group_size\n')) continue;
    const anchor = '  - name: answer_summary\n';
    const at = chunk.indexOf(anchor);
    if (at >= 0) text = text.slice(0, entry.start + at) + journeyFields + text.slice(entry.start + at);
  }

  const siteStart = text.indexOf('- name: site\n');
  if (siteStart >= 0) {
    let siteChunk = text.slice(siteStart);
    if (!siteChunk.includes('    - name: signal\n')) {
      const anchor = '    - name: max_russia\n      label: MAX Russia URL\n      type: string\n';
      const extra = `    - name: signal\n      label: Signal URL\n      type: string\n    - name: zalo\n      label: Zalo URL\n      type: string\n    - name: imo\n      label: imo URL\n      type: string\n    - name: skype\n      label: Skype URL\n      type: string\n`;
      text = text.replace(anchor, anchor + extra);
    }
    siteChunk = text.slice(siteStart);
    if (!siteChunk.includes('  - name: social\n')) {
      const socialBlock = `  - name: social\n    label: Social accounts\n    type: object\n    fields:\n    - name: facebook\n      label: Facebook URL\n      type: string\n    - name: instagram\n      label: Instagram URL\n      type: string\n    - name: youtube\n      label: YouTube URL\n      type: string\n    - name: linkedin\n      label: LinkedIn URL\n      type: string\n    - name: tripadvisor\n      label: Tripadvisor URL\n      type: string\n    - name: x\n      label: X / Twitter URL\n      type: string\n    - name: tiktok\n      label: TikTok URL\n      type: string\n    - name: pinterest\n      label: Pinterest URL\n      type: string\n    - name: threads\n      label: Threads URL\n      type: string\n    - name: google_business\n      label: Google Business URL\n      type: string\n    - name: bluesky\n      label: Bluesky URL\n      type: string\n  - name: ratings\n    label: Public review ratings\n    type: object\n    fields:\n    - name: google_score\n      label: Google score text\n      type: string\n    - name: google_url\n      label: Google reviews URL\n      type: string\n    - name: tripadvisor_score\n      label: Tripadvisor score text\n      type: string\n    - name: tripadvisor_url\n      label: Tripadvisor reviews URL\n      type: string\n  - name: home_faqs\n    label: Homepage FAQs\n    type: object\n    list: true\n    fields:\n    - name: question\n      label: Question\n      type: string\n    - name: answer\n      label: Answer\n      type: text\n`;
      text = text.replace('  - name: tawk\n', socialBlock + '  - name: tawk\n');
    }
  }
  fs.writeFileSync(pagesPath, text);
}

console.log('V10_SETTINGS_AND_CMS_FIELDS_UPDATED');
