import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const sitePath = path.join(root, 'src/_data/site.json');
const site = JSON.parse(fs.readFileSync(sitePath, 'utf8'));
site.contact ||= {};
const supplied = process.argv[2] || site.contact.whatsapp || '';
const digits = String(supplied).replace(/\D/g, '');
if (digits.length < 8 || digits.length > 16) {
  console.error('A valid WhatsApp number in international format is required, for example 923001234567.');
  process.exit(2);
}
site.contact.whatsapp = digits;
fs.writeFileSync(sitePath, JSON.stringify(site, null, 2) + '\n');
console.log(`WHATSAPP_CONFIGURED:${digits}`);
