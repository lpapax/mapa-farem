// osm-farmy.js — farmy z OpenStreetMap, pouze ČR
// node osm-farmy.js
const https = require('https');
const fs = require('fs');

const query = `[out:json][timeout:60];
(
  node["shop"="farm"](48.55,12.09,51.06,18.87);
  way["shop"="farm"](48.55,12.09,51.06,18.87);
  node["tourism"="farm"](48.55,12.09,51.06,18.87);
  way["tourism"="farm"](48.55,12.09,51.06,18.87);
  node["landuse"="farmyard"]["name"](48.55,12.09,51.06,18.87);
  way["landuse"="farmyard"]["name"](48.55,12.09,51.06,18.87);
);
out center tags;`;

// Přibližné hranice ČR (bez Německa/Rakouska/Polska/Slovenska)
function isInCzechia(lat, lng) {
  if (lat < 48.55 || lat > 51.06) return false;
  if (lng < 12.09 || lng > 18.87) return false;
  // Odfiltruj západ Německa (Sasko/Bavorsko)
  if (lng < 13.0 && lat < 50.2) return false;
  if (lng < 12.5) return false;
  // Odfiltruj Rakousko na jihu
  if (lat < 48.7 && lng < 14.0) return false;
  // Odfiltruj německý telefon
  return true;
}

function isGermanPhone(phone) {
  return phone && (phone.startsWith('+49') || phone.startsWith('0049'));
}

function guessType(tags) {
  const t = (tags.name + ' ' + (tags.produce || '') + ' ' + (tags.description || '')).toLowerCase();
  if (t.includes('bio') || t.includes('ekolog') || tags.organic === 'yes') return 'bio';
  if (t.includes('vino') || t.includes('vinar') || t.includes('vinice')) return 'wine';
  if (t.includes('med') || t.includes('vcel')) return 'honey';
  if (t.includes('mlek') || t.includes('syr') || t.includes('jogurt')) return 'dairy';
  if (t.includes('maso') || t.includes('hovezi') || t.includes('vepr')) return 'meat';
  if (t.includes('bylinka') || t.includes('levandule')) return 'herbs';
  if (t.includes('statek') || t.includes('agroturistika')) return 'agroturistika';
  return 'veggie';
}

function guessEmoji(type) {
  return { bio:'🌱', veggie:'🥕', meat:'🥩', dairy:'🥛', honey:'🍯',
    wine:'🍷', herbs:'🌿', market:'🏪', agroturistika:'🏡' }[type] || '🌾';
}

console.log('Stahuji farmy z OpenStreetMap (pouze ČR)...');

const req = https.request('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'MapaFarem.cz' }
}, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    let data;
    try { data = JSON.parse(d); }
    catch(e) { console.log('Chyba parsování:', d.slice(0,200)); return; }

    const farms = [];
    let skipped = 0;

    (data.elements || []).forEach((el, i) => {
      const tags = el.tags || {};
      const lat = el.lat || (el.center && el.center.lat);
      const lng = el.lon || (el.center && el.center.lon);
      if (!lat || !lng || !tags.name) return;

      // Filtruj mimo ČR
      if (!isInCzechia(lat, lng)) { skipped++; return; }

      // Filtruj německé telefony
      const phone = tags['phone'] || tags['contact:phone'] || null;
      if (isGermanPhone(phone)) { skipped++; return; }

      // Filtruj německé/rakouské názvy (obsahují ß nebo ä/ö/ü bez české diakritiky)
      if (/[ßÄÖÜäöü]/.test(tags.name)) { skipped++; return; }

      const city = tags['addr:city'] || tags['addr:town'] || tags['addr:village'] || '';
      const street = tags['addr:street'] ? `${tags['addr:street']} ${tags['addr:housenumber']||''}`.trim() : '';
      const loc = [street, city].filter(Boolean).join(', ') || 'Česká republika';
      const type = guessType(tags);

      farms.push({
        id: 1000 + farms.length,
        name: tags.name,
        loc: loc.trim(),
        type,
        lat: parseFloat(parseFloat(lat).toFixed(6)),
        lng: parseFloat(parseFloat(lng).toFixed(6)),
        emoji: guessEmoji(type),
        rating: 4.0,
        open: null,
        bio: tags.organic === 'yes' || type === 'bio',
        dist: '—',
        hours: tags['opening_hours'] || 'Ověřte telefonicky',
        phone: phone,
        website: tags['website'] || tags['contact:website'] || null,
        email: tags['email'] || tags['contact:email'] || null,
        products: tags.produce ? tags.produce.split(';').map(p=>p.trim()).filter(Boolean) : [],
        description: tags.description || `Farma ${tags.name}.`,
        delivery: false,
        eshop: !!(tags.website || tags['contact:website']),
        verified: false,
        source: 'osm',
      });
    });

    fs.writeFileSync('real-farms.json', JSON.stringify(farms, null, 2), 'utf8');

    console.log('\n=== VÝSLEDKY ===');
    console.log('Celkem farem v ČR:', farms.length);
    console.log('Přeskočeno (mimo ČR):', skipped);
    console.log('S telefonem:', farms.filter(f=>f.phone).length);
    console.log('S webem:', farms.filter(f=>f.website).length);
    console.log('S emailem:', farms.filter(f=>f.email).length);
    console.log('\nUkázka:');
    farms.slice(0,3).forEach(f => console.log(` - ${f.name} | ${f.loc} | ${f.lat}, ${f.lng}`));
    console.log('\nUloženo: real-farms.json');
    console.log('\nDalší krok:');
    console.log('  copy real-farms.json frontend\\src\\data\\farms.json');
  });
});

req.on('error', e => console.log('Chyba:', e.message));
req.write('data=' + encodeURIComponent(query));
req.end();
