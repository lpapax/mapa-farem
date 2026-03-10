const https = require('https');

const query = '[out:json][timeout:25];node["shop"="farm"](49.0,12.0,51.2,18.9);out 5;';

const req = https.request('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
}, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    try {
      const j = JSON.parse(d);
      console.log('✅ Nalezeno:', j.elements.length, 'farem');
      j.elements.forEach(e => console.log(' -', e.tags?.name, '|', e.lat, e.lon));
    } catch(e) {
      console.log('❌ Chyba parsování:', d.slice(0, 200));
    }
  });
});

req.on('error', e => console.log('❌ Síťová chyba:', e.message));
req.write('data=' + encodeURIComponent(query));
req.end();
