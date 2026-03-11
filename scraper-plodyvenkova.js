// scraper-plodyvenkova.js v2 — lepší parsování
// node scraper-plodyvenkova.js
const https = require('https');
const fs = require('fs');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      res.setEncoding('utf8');
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function guessType(text) {
  const t = (text || '').toLowerCase();
  if (t.includes('bio') || t.includes('ekolog')) return 'bio';
  if (t.includes('vín') || t.includes('víno') || t.includes('vinar') || t.includes('vinař')) return 'wine';
  if (t.includes('med') || t.includes('včel') || t.includes('vcel')) return 'honey';
  if (t.includes('mlék') || t.includes('sýr') || t.includes('jogurt')) return 'dairy';
  if (t.includes('maso') || t.includes('hovězí') || t.includes('vepř') || t.includes('drůb') || t.includes('králík')) return 'meat';
  if (t.includes('bylinka') || t.includes('levandule')) return 'herbs';
  if (t.includes('agroturistik') || t.includes('penzion') || t.includes('ranč')) return 'agroturistika';
  return 'veggie';
}

function guessEmoji(type) {
  return { bio:'🌱', veggie:'🥕', meat:'🥩', dairy:'🥛', honey:'🍯',
    wine:'🍷', herbs:'🌿', market:'🏪', agroturistika:'🏡' }[type] || '🌾';
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

function parseKrajPage(html, krajName) {
  const farms = [];

  // Rozděl podle jednotlivých farm záznamů — každá farma má h2 nebo h3 s názvem
  // a pak adresu, telefon, email
  const farmBlocks = html.split(/(?=<h2\s|<h3\s)/i);

  farmBlocks.forEach(block => {
    // Název
    const nameMatch = block.match(/<h[23][^>]*>(?:<a[^>]*>)?([^<]{4,80})(?:<\/a>)?<\/h[23]>/i);
    if (!nameMatch) return;
    const name = nameMatch[1]
      .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
      .replace(/&#\d+;/g, '').replace(/\s+/g, ' ').trim();
    if (!name || name.length < 3 || /kategori|archiv|farmy v/i.test(name)) return;

    // Telefon — hledáme číslo za "Tel."
    const phoneMatches = [...block.matchAll(/Tel[^\d+]*([+\d][0-9\s,\/\-]{6,30})/gi)];
    const phone = phoneMatches.length > 0
      ? phoneMatches[0][1].trim().replace(/\s+/g, ' ').replace(/,.*$/, '').trim()
      : null;

    // Email
    const emailMatch = block.match(/([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/);
    const email = emailMatch ? emailMatch[1] : null;

    // Web — odkaz který není na plodyvenkova.cz
    const webMatches = [...block.matchAll(/href="(https?:\/\/(?!plodyvenkova)[^"]{5,80})"/gi)];
    const website = webMatches.length > 0 ? webMatches[0][1] : null;

    // Adresa — hledáme text před "Tel." nebo "E-mail"
    // Typicky je to "Název obce číslo popisné" nebo "Ulice číslo, Obec"
    const addrMatch = block.match(/(?:<\/h[23]>|<\/a>)\s*(?:<[^>]+>\s*)*([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ\d][^<\n]{8,80}?)\s*(?:Tel\.|E-mail|Mapa)/i);
    const addr = addrMatch
      ? addrMatch[1].replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
      : krajName;

    const type = guessType(name + ' ' + addr + ' ' + (website || ''));

    farms.push({
      source: 'plodyvenkova',
      name,
      loc: addr,
      kraj: krajName,
      type,
      lat: null, lng: null,
      emoji: guessEmoji(type),
      rating: 4.3,
      open: null,
      bio: type === 'bio' || /bio/i.test(name),
      dist: '—',
      hours: 'Ověřte telefonicky',
      phone,
      email,
      website,
      products: [],
      description: `Farma ${name} — ${krajName}.`,
      delivery: false,
      eshop: !!website,
      verified: false,
    });
  });

  return farms;
}

const KRAJE = [
  ['farmy-jihocesky-kraj', 'Jihočeský kraj'],
  ['farmy-jihomoravsky-kraj', 'Jihomoravský kraj'],
  ['farmy-karlovarsky-kraj', 'Karlovarský kraj'],
  ['farmy-kralovehradecky-kraj', 'Královéhradecký kraj'],
  ['farmy-liberecky-kraj', 'Liberecký kraj'],
  ['farmy-moravskoslezsky-kraj', 'Moravskoslezský kraj'],
  ['farmy-olomoucky-kraj', 'Olomoucký kraj'],
  ['farmy-pardubicky-kraj', 'Pardubický kraj'],
  ['farmy-plzensky-kraj', 'Plzeňský kraj'],
  ['farmy-praha', 'Praha'],
  ['farmy-stredocesky-kraj', 'Středočeský kraj'],
  ['farmy-ustecky-kraj', 'Ústecký kraj'],
  ['farmy-kraj-vysocina', 'Vysočina'],
  ['farmy-zlinsky-kraj', 'Zlínský kraj'],
];

async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  PlodyVenkova.cz scraper v2              ║');
  console.log('╚══════════════════════════════════════════╝\n');

  const allFarms = [];

  for (const [slug, krajName] of KRAJE) {
    try {
      process.stdout.write(`${krajName}... `);
      const html = await fetchUrl(`https://plodyvenkova.cz/farmy/${slug}/`);

      // Stránkování — zkusit /page/2/ atd.
      const farms = parseKrajPage(html, krajName);

      // Zkus page 2 pokud je odkaz na další stránku
      if (html.includes('page/2') || html.includes('Starší')) {
        try {
          const html2 = await fetchUrl(`https://plodyvenkova.cz/farmy/${slug}/page/2/`);
          const farms2 = parseKrajPage(html2, krajName);
          farms.push(...farms2);
          await sleep(800);
        } catch(e) {}
      }

      console.log(`${farms.length} farem`);
      allFarms.push(...farms);
      await sleep(1500);
    } catch (e) {
      console.log(`CHYBA: ${e.message}`);
    }
  }

  // Deduplikace
  const seen = new Set();
  const unique = allFarms.filter(f => {
    const key = f.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g,'').slice(0, 20);
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });

  console.log(`\nCelkem unikátních: ${unique.length}`);
  console.log(`S telefonem: ${unique.filter(f=>f.phone).length}`);
  console.log(`S emailem:   ${unique.filter(f=>f.email).length}`);
  console.log(`S webem:     ${unique.filter(f=>f.website).length}`);

  // Geocoding pouze pro ty s adresou (ne jen kraj)
  const needGeo = unique.filter(f => f.loc && f.loc !== f.kraj && f.loc.length > 5);
  console.log(`\nGeocoding ${needGeo.length} adres (~${Math.round(needGeo.length*1.1/60)} min)...`);

  let done = 0;
  for (const farm of needGeo) {
    const coords = await geocode(farm.loc);
    if (coords) { farm.lat = coords.lat; farm.lng = coords.lng; done++; }
    await sleep(1100);
    if (done % 10 === 0 && done > 0) process.stdout.write(`  ${done}/${needGeo.length}...\r`);
  }
  console.log(`\n✅ Geokódováno: ${done}`);

  const withGPS = unique.filter(f => f.lat && f.lng);
  withGPS.forEach((f, i) => { f.id = 2000 + i; });

  fs.writeFileSync('plodyvenkova-farms.json', JSON.stringify(withGPS, null, 2), 'utf8');
  console.log(`\n✅ Uloženo: plodyvenkova-farms.json (${withGPS.length} farem s GPS)`);
  console.log('\nDalší krok: node merge-farms.js');
}

main().catch(e => { console.error('Chyba:', e.message); process.exit(1); });
