// scraper-combined.js — MapaFarem.cz v2.0
// node scraper-combined.js
const https = require('https');
const http = require('http');
const fs = require('fs');

function fetchUrl(url, postData = null) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const options = {
      method: postData ? 'POST' : 'GET',
      headers: {
        'User-Agent': 'MapaFarem.cz/1.0 research-bot',
        'Accept': 'application/json, text/html',
        ...(postData ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      },
    };
    const req = client.request(url, options, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location, postData).then(resolve).catch(reject);
      }
      res.setEncoding('utf8');
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
    if (postData) req.write(postData);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function guessType(text) {
  const t = (text || '').toLowerCase();
  if (t.includes('bio') || t.includes('ekolog') || t.includes('organic')) return 'bio';
  if (t.includes('vino') || t.includes('vinar') || t.includes('vinice') || t.includes('wine')) return 'wine';
  if (t.includes('med') || t.includes('vcel') || t.includes('honey')) return 'honey';
  if (t.includes('mlek') || t.includes('syr') || t.includes('dairy') || t.includes('jogurt')) return 'dairy';
  if (t.includes('maso') || t.includes('reznic') || t.includes('hovezi') || t.includes('vepr') || t.includes('meat')) return 'meat';
  if (t.includes('bylinka') || t.includes('herb') || t.includes('levandule')) return 'herbs';
  if (t.includes('agroturistika') || t.includes('ubytovani') || t.includes('statek')) return 'agroturistika';
  if (t.includes('trh') || t.includes('trziste') || t.includes('market')) return 'market';
  return 'veggie';
}

function guessEmoji(type) {
  return { bio:'🌱', veggie:'🥕', meat:'🥩', dairy:'🥛', honey:'🍯',
    wine:'🍷', herbs:'🌿', market:'🏪', agroturistika:'🏡',
    zerowaste:'♻️', bezobaly:'🫙' }[type] || '🌾';
}

async function scrapeOSM() {
  console.log('\n📍 [1/3] OpenStreetMap...');
  const query = `[out:json][timeout:60];
(
  node["shop"="farm"](48.55,12.09,51.06,18.87);
  way["shop"="farm"](48.55,12.09,51.06,18.87);
  node["tourism"="farm"](48.55,12.09,51.06,18.87);
  way["tourism"="farm"](48.55,12.09,51.06,18.87);
  node["landuse"="farmyard"]["name"](48.55,12.09,51.06,18.87);
  way["landuse"="farmyard"]["name"](48.55,12.09,51.06,18.87);
  node["amenity"="marketplace"](48.55,12.09,51.06,18.87);
);
out center tags;`;

  let raw;
  try {
    raw = await fetchUrl('https://overpass-api.de/api/interpreter', 'data=' + encodeURIComponent(query));
  } catch (e) { console.log('  OSM chyba:', e.message); return []; }

  let data;
  try { data = JSON.parse(raw); } catch (e) { console.log('  OSM parse chyba'); return []; }

  const farms = [];
  (data.elements || []).forEach(el => {
    const tags = el.tags || {};
    const lat = el.lat || (el.center && el.center.lat);
    const lng = el.lon || (el.center && el.center.lon);
    if (!lat || !lng || !tags.name) return;
    const city = tags['addr:city'] || tags['addr:town'] || tags['addr:village'] || '';
    const street = tags['addr:street'] ? `${tags['addr:street']} ${tags['addr:housenumber'] || ''}`.trim() : '';
    const loc = [street, city].filter(Boolean).join(', ') || 'Česká republika';
    const type = guessType(tags.name + ' ' + (tags.description || '') + ' ' + (tags.produce || ''));
    farms.push({
      source: 'osm', osm_id: el.id, name: tags.name, loc: loc.trim(), type,
      lat: parseFloat(parseFloat(lat).toFixed(6)), lng: parseFloat(parseFloat(lng).toFixed(6)),
      emoji: guessEmoji(type), rating: 4.0, open: null,
      bio: tags['organic'] === 'yes' || type === 'bio', dist: '—',
      hours: tags['opening_hours'] || 'Ověřte telefonicky',
      phone: tags['phone'] || tags['contact:phone'] || null,
      website: tags['website'] || tags['contact:website'] || null,
      email: tags['email'] || tags['contact:email'] || null,
      products: tags['produce'] ? tags['produce'].split(';').map(p => p.trim()).filter(Boolean) : [],
      description: tags['description'] || `Farma: ${tags.name}`,
      delivery: false, eshop: !!(tags['website'] || tags['contact:website']), verified: false,
    });
  });
  console.log(`  ✅ OSM: ${farms.length} farem`);
  return farms;
}

async function scrapeASZ() {
  console.log('\n🏡 [2/3] ASZ ČR...');
  const farms = [];
  try {
    const html = await fetchUrl('https://www.asz.cz/prodej-ze-dvora/');
    const names = [...html.matchAll(/<h[34][^>]*>\s*([^<]{5,80})\s*<\/h[34]>/gi)].map(m => m[1].trim());
    const addrs = [...html.matchAll(/Adresa:\s*([^\n<]{8,100})/g)].map(m => m[1].trim());
    const phones = [...html.matchAll(/Tel[^:]*:\s*([\+\d][\d\s\/\-]{7,20})/g)].map(m => m[1].trim());
    const emails = [...html.matchAll(/([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/g)].map(m => m[1]);
    console.log(`  Parsováno: ${addrs.length} adres, ${names.length} názvů`);
    addrs.forEach((addr, i) => {
      if (addr.length < 8) return;
      const parts = addr.split(',').map(s => s.trim());
      const city = parts.length > 1 ? parts[parts.length - 2] : parts[0];
      const name = names[i] || `Farma — ${city}`;
      const type = guessType(name + ' ' + addr);
      farms.push({
        source: 'asz', name: name.replace(/\s+/g, ' ').trim(), loc: addr, type,
        lat: null, lng: null, emoji: guessEmoji(type), rating: 4.2, open: null,
        bio: name.toLowerCase().includes('bio') || name.toLowerCase().includes('eko'),
        dist: '—', hours: 'Ověřte telefonicky',
        phone: phones[i] || null, email: emails[i] || null, website: null, products: [],
        description: `Člen ASZ ČR. ${addr}`, delivery: false, eshop: false, verified: false,
      });
    });
  } catch (e) { console.log('  ASZ chyba:', e.message); }
  console.log(`  ✅ ASZ: ${farms.length} farem`);
  return farms;
}

async function scrapeNajdiZemedelce() {
  console.log('\n🌾 [3/3] najdizemedelce.cz...');
  const kraje = [
    ['jihocesky-kraj','Jihočeský kraj'],['jihomoravsky-kraj','Jihomoravský kraj'],
    ['karlovarsky-kraj','Karlovarský kraj'],['kralovehradecky-kraj','Královéhradecký kraj'],
    ['liberecky-kraj','Liberecký kraj'],['moravskoslezsky-kraj','Moravskoslezský kraj'],
    ['olomoucky-kraj','Olomoucký kraj'],['pardubicky-kraj','Pardubický kraj'],
    ['plzensky-kraj','Plzeňský kraj'],['praha','Praha'],
    ['stredocesky-kraj','Středočeský kraj'],['ustecky-kraj','Ústecký kraj'],
    ['vysocina','Vysočina'],['zlinsky-kraj','Zlínský kraj'],
  ];
  const farms = [];
  for (const [slug, krajName] of kraje) {
    try {
      const html = await fetchUrl(`https://www.najdizemedelce.cz/kraje/${slug}/`);
      const entries = [...html.matchAll(/<h2[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi)];
      entries.forEach(m => {
        const name = m[2].trim();
        if (!name || name.length < 3) return;
        const type = guessType(name);
        farms.push({
          source: 'najdizemedelce', name, loc: krajName, type,
          lat: null, lng: null, emoji: guessEmoji(type), rating: 4.0, open: null,
          bio: name.toLowerCase().includes('bio'), dist: '—',
          hours: 'Ověřte telefonicky', phone: null, email: null,
          website: m[1].startsWith('http') ? m[1] : `https://www.najdizemedelce.cz${m[1]}`,
          products: [], description: `Farmář z kraje ${krajName}.`,
          delivery: false, eshop: false, verified: false,
        });
      });
      console.log(`  ✓ ${krajName}: ${entries.length}`);
      await sleep(800);
    } catch (e) { console.log(`  ✗ ${krajName}:`, e.message); }
  }
  console.log(`  ✅ najdizemedelce.cz: ${farms.length} farem`);
  return farms;
}

async function geocode(address) {
  try {
    const q = encodeURIComponent(address + ', Česká republika');
    const raw = await fetchUrl(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=cz`);
    const results = JSON.parse(raw);
    if (results.length > 0) return {
      lat: parseFloat(parseFloat(results[0].lat).toFixed(6)),
      lng: parseFloat(parseFloat(results[0].lon).toFixed(6)),
    };
  } catch (e) {}
  return null;
}

function deduplicate(farms) {
  const seen = new Set();
  return farms.filter(f => {
    const key = f.name.toLowerCase().trim().slice(0, 30) + '|' + f.loc.toLowerCase().trim().slice(0, 20);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  MapaFarem.cz — Kombinovaný scraper v2  ║');
  console.log('╚══════════════════════════════════════════╝');

  const osmFarms = await scrapeOSM();
  await sleep(2000);
  const aszFarms = await scrapeASZ();
  await sleep(1000);
  const nzFarms = await scrapeNajdiZemedelce();

  let all = [...osmFarms, ...aszFarms, ...nzFarms];
  console.log(`\n📊 Před deduplikací: ${all.length}`);
  all = deduplicate(all);
  console.log(`📊 Po deduplikaci: ${all.length}`);

  const needGeo = all.filter(f => !f.lat && f.loc && f.loc !== 'Česká republika');
  if (needGeo.length > 0) {
    console.log(`\n🗺️  Geocoding ${needGeo.length} adres...`);
    let done = 0;
    for (const farm of needGeo) {
      const coords = await geocode(farm.loc);
      if (coords) { farm.lat = coords.lat; farm.lng = coords.lng; done++; }
      await sleep(1100);
      if (done % 20 === 0 && done > 0) console.log(`  ${done}/${needGeo.length}...`);
    }
    console.log(`  ✅ Geokódováno: ${done}`);
  }

  const withGPS = all.filter(f => f.lat && f.lng);
  const withoutGPS = all.filter(f => !f.lat || !f.lng);
  withGPS.forEach((f, i) => { f.id = 1000 + i; });

  fs.writeFileSync('real-farms.json', JSON.stringify(withGPS, null, 2), 'utf8');
  if (withoutGPS.length > 0) fs.writeFileSync('farms-no-gps.json', JSON.stringify(withoutGPS, null, 2), 'utf8');

  console.log('\n╔══════════════════════════════╗');
  console.log('║         VÝSLEDKY             ║');
  console.log('╠══════════════════════════════╣');
  console.log(`║  OSM:            ${String(osmFarms.length).padStart(4)} farem  ║`);
  console.log(`║  ASZ ČR:         ${String(aszFarms.length).padStart(4)} farem  ║`);
  console.log(`║  najdizemedelce: ${String(nzFarms.length).padStart(4)} farem  ║`);
  console.log('╠══════════════════════════════╣');
  console.log(`║  S GPS:          ${String(withGPS.length).padStart(4)} farem  ║`);
  console.log(`║  S telefonem:    ${String(withGPS.filter(f=>f.phone).length).padStart(4)}         ║`);
  console.log(`║  S webem:        ${String(withGPS.filter(f=>f.website).length).padStart(4)}         ║`);
  console.log('╚══════════════════════════════╝');
  console.log('\n✅ Uloženo: real-farms.json');
  console.log('Další: copy real-farms.json frontend\\src\\data\\farms.json\n');
}

main().catch(e => { console.error('Chyba:', e.message); process.exit(1); });
