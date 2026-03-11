// clean-farms.js — odstraní nereálné záznamy z farms.json
// node clean-farms.js
const fs = require('fs');

const farms = JSON.parse(fs.readFileSync('frontend/src/data/farms.json', 'utf8'));
console.log('Před čištěním:', farms.length);

const BAD_EXACT = ['pila','vepřín','veprin','jzd','zd','koně','kone','drubežárna','jatka','sklep','sklad','stodola','louka','pole'];
const BAD_CONTAINS = ['jzd ','nakielska','tarnowskie','görlitz','bautzen'];

function isBad(f) {
  const name = (f.name || '').toLowerCase().trim();
  const loc = (f.loc || '').toLowerCase();

  if (name.length < 4) return true;
  if (BAD_EXACT.includes(name)) return true;
  if (BAD_CONTAINS.some(b => name.includes(b) || loc.includes(b))) return true;
  if (/[ßÄÖÜäöü]/.test(f.name)) return true;
  if (f.phone && (f.phone.startsWith('+49') || f.phone.startsWith('0049'))) return true;

  if (f.lat && f.lng) {
    if (f.lat < 48.55 || f.lat > 51.06) return true;
    if (f.lng < 12.2 || f.lng > 18.87) return true;
    if (f.lng < 13.2 && f.lat < 50.5) return true;
    if (f.lat > 50.8 && f.lng > 18.3) return true;
    if (f.lat < 48.65 && f.lng < 15.0) return true;
  }

  return false;
}

const cleaned = farms.filter(f => !isBad(f));
const removed = farms.filter(f => isBad(f));

console.log('\nOdstraněno (' + removed.length + 'x):');
removed.forEach(f => console.log(` - "${f.name}" | ${f.loc}`));

cleaned.forEach((f, i) => { f.id = i + 1; });
fs.writeFileSync('frontend/src/data/farms.json', JSON.stringify(cleaned, null, 2), 'utf8');
console.log('\n✅ Po čištění:', cleaned.length, 'farem');
