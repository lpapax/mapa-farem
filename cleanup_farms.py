"""
Post-process farms.json:
- Filter to Czech Republic only (by coordinates + language detection)
- Remove farms with no useful name
- Add better descriptions and auto-generate product lists
- Normalize fields
"""
import json, sys, re, math

sys.stdout.reconfigure(encoding='utf-8')

IN_FILE = "frontend/src/data/farms.json"
OUT_FILE = "frontend/src/data/farms.json"

with open(IN_FILE, encoding='utf-8') as f:
    farms = json.load(f)

print(f"Input: {len(farms)} farms")

# ── Czech Republic tighter bounding polygon (approximate) ────────────────────
# Using main CZ bounds, but excluding corners that overlap with DE/AT/PL/SK
def is_in_czech_republic(lat, lng):
    # Main CZ range
    if not (48.55 <= lat <= 51.06 and 12.09 <= lng <= 18.87):
        return False
    # Exclude Saxony/Bavaria triangle (NW corner of bbox — German territory)
    # DE/CZ border roughly: below lat=50.4 when lng<13.0 is Austria/Germany
    if lat < 50.3 and lng < 13.2:
        return False
    # Exclude Austrian Waldviertel/Weinviertel that creeps into bbox
    # Austria is south of ~48.75 in the western portion
    if lat < 48.75 and lng < 15.0:
        return False
    # Slovakia starts east of ~17.6E at southern latitudes
    if lat < 49.5 and lng > 17.8:
        return False
    # Poland is north of ~50.3 in eastern portion
    if lat > 50.3 and lng > 18.2:
        return False
    return True

# ── Language/name heuristics ─────────────────────────────────────────────────
GERMAN_PATTERNS = [
    r'\bhofladen\b', r'\bbiohof\b', r'\bbauernhof\b', r'\bbauernladen\b',
    r'\bgärtnerei\b', r'\bgartenbau\b', r'\bobst\b', r'\bgemüse\b',
    r'\bmilchvieh\b', r'\bagrar\b', r'\bgenossenschaft\b', r'\blandwirtschaft\b',
    r'\bhonorar\b', r'\bhonig\b.*\bde\b', r'\bfrühgemüse\b',
    r'\bschlachtvieh\b', r'\bweinviertel\b', r'\bwald.*hof\b',
    r'\bfleisch\b', r'\bwurst\b', r'\bmilch\b.*\bhof\b',
    r'GmbH', r' eG\b', r' AG\b', r' KG\b', r' GbR\b', r' e\.G\.',
]
POLISH_PATTERNS = [
    r'\bwarzywa\b', r'\bowoce\b', r'\brolnicza\b', r'\bsp[óo]dzielnia\b',
    r'\bsklep\b', r'\bgospodarstwo\b', r'\bowczarnia\b', r'\bferma\b.*\bpl\b',
    r'\bjarzynowo\b', r'\bwarzywniaczek\b', r'\bszparagi\b', r'\bzimniaki\b',
    r'\brolne\b', r'\bkombina[nt]\b',
]
SLOVAK_PATTERNS = [
    r'\bdruž?stvo\b', r'\bpôdnohospodárske\b', r'\bpredajňa\b',
    r'\bpd\b.*\bvlára\b', r'\brolnícke\b',
]
JUNK_NAMES = {
    '', 'farm', 'farma', 'obchod', 'shop', 'hofladen', 'hofladen',
    'ovoce zelenina', 'ovoce a zelenina', 'zelenina', 'potraviny',
    'warzywa owoce', 'obst gemüse', 'obst und gemüse', 'ovoce',
    'farmářské potraviny', 'zelenářství', 'dr\u016bbe\u017e\xe1rna',
}

def is_likely_czech(farm):
    name = farm.get('name', '').strip()
    name_lower = name.lower()
    lat, lng = farm.get('lat', 0), farm.get('lng', 0)

    # Must be in CZ
    if not is_in_czech_republic(lat, lng):
        return False

    # Skip junk names
    if name_lower in JUNK_NAMES or len(name) < 3:
        return False

    # Skip clearly German farms
    for pat in GERMAN_PATTERNS:
        if re.search(pat, name, re.IGNORECASE):
            return False

    # Skip Polish farms
    for pat in POLISH_PATTERNS:
        if re.search(pat, name, re.IGNORECASE):
            return False

    # Skip Slovak farms
    for pat in SLOVAK_PATTERNS:
        if re.search(pat, name, re.IGNORECASE):
            return False

    return True

# ── Czech region lookup ───────────────────────────────────────────────────────
def get_region(lat, lng):
    # Rough region map for Czech Republic
    if lat > 50.5:
        if lng < 13.5: return "Ústecký kraj"
        if lng < 14.5: return "Liberecký kraj"
        if lng < 16.0: return "Středočeský kraj"
        if lng < 17.5: return "Pardubický kraj"
        return "Olomoucký kraj"
    if lat > 49.8:
        if lng < 13.5: return "Plzeňský kraj"
        if lng < 14.8: return "Středočeský kraj"
        if lng < 15.8: return "Praha / Středočeský kraj"
        if lng < 17.0: return "Pardubický kraj"
        if lng < 18.0: return "Olomoucký kraj"
        return "Moravskoslezský kraj"
    if lat > 49.1:
        if lng < 14.0: return "Jihočeský kraj"
        if lng < 15.5: return "Jihočeský kraj"
        if lng < 16.0: return "Vysočina"
        if lng < 17.0: return "Jihomoravský kraj"
        if lng < 18.0: return "Zlínský kraj"
        return "Moravskoslezský kraj"
    if lng > 17.0: return "Jihomoravský kraj"
    return "Jihočeský kraj"

# ── Product generation ─────────────────────────────────────────────────────────
TYPE_PRODUCTS = {
    "bio": ["🌱 Biozelenina", "🥕 Kořenová zelenina", "🥬 Salát", "🍎 Bio ovoce", "🌿 Bylinky"],
    "veggie": ["🥕 Zelenina", "🍅 Rajčata", "🥬 Listová zelenina", "🌽 Kukuřice", "🧅 Cibule"],
    "meat": ["🥩 Hovězí maso", "🐷 Vepřové maso", "🍗 Drůbež", "🥚 Vejce", "🌭 Klobásy"],
    "dairy": ["🥛 Čerstvé mléko", "🧀 Sýr", "🧈 Máslo", "🍦 Tvaroh", "🥛 Kefír"],
    "honey": ["🍯 Přírodní med", "🕯️ Včelí vosk", "🍶 Propolis", "🌸 Pohankový med", "🌳 Lesní med"],
    "wine": ["🍷 Suché víno", "🍾 Polosuché víno", "🍇 Hroznový džus", "🍷 Rosé", "🫙 Marmeláda"],
    "herbs": ["🌿 Levandule", "🌱 Máta", "🌼 Heřmánek", "🫖 Čaje", "🧴 Bylinné produkty"],
    "market": ["🛒 Farmářské produkty", "🥕 Sezonní zelenina", "🍎 Ovoce", "🌿 Bylinky", "🥚 Vejce"],
}

def generate_products(farm):
    """Generate product list from OSM tags or fall back to type defaults."""
    tags_products = farm.get('products', [])
    if tags_products:
        return tags_products[:5]
    farm_type = farm.get('type', 'veggie')
    return TYPE_PRODUCTS.get(farm_type, TYPE_PRODUCTS['veggie'])

def make_description(farm):
    name = farm['name']
    region = farm['loc']
    farm_type = farm.get('type', 'veggie')
    type_desc = {
        'bio': 'Ekologická farma s certifikovanou bioprodukcí',
        'veggie': 'Farma zaměřená na prodej čerstvé zeleniny a ovoce',
        'meat': 'Farmářský chov hospodářských zvířat s přímým prodejem masa',
        'dairy': 'Mléčná farma s výrobou sýrů a mléčných produktů',
        'honey': 'Včelí farma s produkcí přírodního medu',
        'wine': 'Vinařství s přímým prodejem vín',
        'herbs': 'Farma zaměřená na pěstování bylinek a léčivých rostlin',
        'market': 'Farmářský obchod s místními produkty',
    }
    desc = type_desc.get(farm_type, 'Farma s přímým prodejem produktů')
    website = farm.get('website', '')
    if website:
        return f"{desc}. Navštivte {name} v regionu {region}."
    return f"{desc} v regionu {region}."

# ── Filter and clean ─────────────────────────────────────────────────────────
cleaned = []
removed_geo = removed_name = removed_lang = 0

for farm in farms:
    lat, lng = farm.get('lat', 0), farm.get('lng', 0)
    name = farm.get('name', '').strip()

    if not is_in_czech_republic(lat, lng):
        removed_geo += 1
        continue

    if name.lower() in JUNK_NAMES or len(name) < 3:
        removed_name += 1
        continue

    skip = False
    for pat in GERMAN_PATTERNS + POLISH_PATTERNS + SLOVAK_PATTERNS:
        if re.search(pat, name, re.IGNORECASE):
            skip = True
            break
    if skip:
        removed_lang += 1
        continue

    # Update region
    farm['loc'] = get_region(lat, lng)

    # Improve products
    farm['products'] = generate_products(farm)

    # Improve description
    if not farm.get('description') or 'Česká republika' in farm.get('description', ''):
        farm['description'] = make_description(farm)

    # Normalize eshop
    farm['eshop'] = bool(farm.get('website'))

    cleaned.append(farm)

# Re-number IDs
for i, farm in enumerate(cleaned, 1):
    farm['id'] = i

print(f"Removed: {removed_geo} outside CZ, {removed_name} junk names, {removed_lang} non-Czech language")
print(f"Remaining: {len(cleaned)} clean Czech farms")
has_phone = sum(1 for f in cleaned if f.get('phone'))
has_website = sum(1 for f in cleaned if f.get('website'))
has_hours = sum(1 for f in cleaned if f.get('hours'))
print(f"Has phone: {has_phone} | Has website: {has_website} | Has hours: {has_hours}")

with open(OUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(cleaned, f, ensure_ascii=False, indent=2)

print(f"Saved to {OUT_FILE}")

# Print sample
print("\nSample farms:")
sample = [f for f in cleaned if f.get('phone') or f.get('website')][:5]
for f in sample:
    print(f"  [{f['id']}] {f['name']} ({f['loc']}) | phone={f.get('phone','—')} | website={bool(f.get('website'))}")
