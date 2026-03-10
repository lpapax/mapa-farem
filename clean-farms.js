const fs = require('fs');

// Načti farmy
const farms = JSON.parse(fs.readFileSync('real-farms.json', 'utf8'));
console.log('Celkem před čištěním:', farms.length);

// Přísné hranice ČR (polygon aproximace)
function isStrictlyCzechia(lat, lng) {
  // Základní bbox
  if (lat < 48.55 || lat > 51.06) return false;
  if (lng < 12.09 || lng > 18.87) return false;
  
  // Odfiltruj Německo na západ-jihozápad
  if (lng < 13.2 && lat < 50.5) return false;
  if (lng < 12.8) return false;
  
  // Odfiltruj Rakousko na jihu
  if (lat < 48.68 && lng < 15.5) return false;
  if (lat < 48.58) return false;
  
  // Odfiltruj Polsko na severu (tam jsou jen piny poblíž hranic)
  if (lat > 50.9 && lng > 18.0) return false;
  
  return true;
}

// Filtruj německé/rakouské znaky v názvu
function hasGermanChars(name) {
  return /[ßÄÖÜäöü]/.test(name);
}

// Filtruj německé telefony
function hasGermanPhone(phone) {
  return phone && (phone.startsWith('+49') || phone.startsWith('0049'));
}

// Filtruj německé/rakouské adresy
function hasGermanAddress(loc) {
  const germanWords = ['straße', 'strasse', 'platz', 'berg', 'dorf', 'hausen', 'burg', 'bach', 'feld', 'tal', 'stein', 'bruck', 'gasse'];
  const l = (loc || '').toLowerCase();
  return germanWords.some(w => l.includes(w));
}

const cleaned = farms.filter(f => {
  if (!isStrictlyCzechia(f.lat, f.lng)) return false;
  if (hasGermanChars(f.name)) return false;
  if (hasGermanPhone(f.phone)) return false;
  if (hasGermanAddress(f.loc)) return false;
  return true;
});

// Přečísluj ID
cleaned.forEach((f, i) => { f.id = i + 1; });

fs.writeFileSync('real-farms-clean.json', JSON.stringify(cleaned, null, 2), 'utf8');
console.log('Po čištění:', cleaned.length);
console.log('Odstraněno:', farms.length - cleaned.length);
console.log('Ukázka:');
cleaned.slice(0,5).forEach(f => console.log(` - ${f.name} | ${f.loc} | ${f.lat}, ${f.lng}`));
