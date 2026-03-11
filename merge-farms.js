// merge-farms.js — sloučí real-farms.json + plodyvenkova-farms.json
// node merge-farms.js
const fs = require('fs');

const osm = JSON.parse(fs.readFileSync('real-farms.json', 'utf8'));
const pv = JSON.parse(fs.readFileSync('plodyvenkova-farms.json', 'utf8'));

console.log(`OSM farmy: ${osm.length}`);
console.log(`PlodyVenkova farmy: ${pv.length}`);

// Deduplikace podle názvu (normalizovaný)
function normalize(s) {
  return (s || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // odstranění diakritiky
    .replace(/[^a-z0-9]/g, '').slice(0, 20);
}

const seen = new Set(osm.map(f => normalize(f.name)));
const newFarms = pv.filter(f => !seen.has(normalize(f.name)));

console.log(`Nové farmy z PlodyVenkova (bez duplikátů): ${newFarms.length}`);

const merged = [...osm, ...newFarms];
merged.forEach((f, i) => { f.id = i + 1; });

fs.writeFileSync('frontend/src/data/farms.json', JSON.stringify(merged, null, 2), 'utf8');

console.log(`\n✅ Celkem sloučeno: ${merged.length} farem`);
console.log('Uloženo: frontend/src/data/farms.json');
