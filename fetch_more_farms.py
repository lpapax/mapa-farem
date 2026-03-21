"""
Fetch additional Czech farm types from OpenStreetMap Overpass API
and merge with existing farms.json
"""
import json, time, urllib.request, urllib.error, sys, re
sys.stdout.reconfigure(encoding='utf-8')

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# OSM tag queries → farm type mapping
QUERIES = [
    ("shop=organic",        "bio"),
    ("shop=dairy",          "dairy"),
    ("craft=dairy",         "dairy"),
    ("shop=butcher",        "meat"),
    ("craft=butcher",       "meat"),
    ("craft=winery",        "wine"),
    ("shop=wine",           "wine"),
    ("craft=beekeeper",     "honey"),
    ("shop=honey",          "honey"),
    ("amenity=marketplace", "market"),
    ("shop=greengrocer",    "veggie"),
]

KRAJ_BOUNDS = {
    "Praha / Středočeský kraj": (49.9, 13.8, 50.3, 14.8),
    "Středočeský kraj":         (49.5, 13.5, 50.8, 15.5),
    "Jihočeský kraj":           (48.5, 13.4, 49.6, 15.2),
    "Plzeňský kraj":            (49.1, 12.4, 50.1, 13.8),
    "Karlovarský kraj":         (49.9, 12.1, 50.7, 13.1),
    "Ústecký kraj":             (50.2, 13.1, 51.0, 14.9),
    "Liberecký kraj":           (50.5, 14.8, 51.1, 15.6),
    "Královéhradecký kraj":     (50.0, 15.5, 50.9, 16.5),
    "Pardubický kraj":          (49.7, 15.5, 50.4, 16.8),
    "Vysočina":                 (49.1, 15.2, 50.0, 16.4),
    "Jihomoravský kraj":        (48.5, 15.7, 49.5, 17.6),
    "Zlínský kraj":             (48.8, 17.3, 49.7, 18.4),
    "Olomoucký kraj":           (49.3, 16.7, 50.3, 17.8),
    "Moravskoslezský kraj":     (49.4, 17.5, 50.4, 18.9),
}

EMOJI_MAP = {
    "bio": "🌱", "veggie": "🥕", "meat": "🥩",
    "dairy": "🥛", "honey": "🍯", "wine": "🍷",
    "herbs": "🌿", "market": "🏪",
}

def get_kraj(lat, lng):
    for name, (s, w, n, e) in KRAJ_BOUNDS.items():
        if s <= lat <= n and w <= lng <= e:
            return name
    return "Česká republika"

def overpass_query(tag_filter):
    q = f"""
[out:json][timeout:30];
(
  node[{tag_filter}](48.5,12.0,51.2,18.9);
  way[{tag_filter}](48.5,12.0,51.2,18.9);
);
out center tags;
"""
    data = urllib.parse.urlencode({"data": q}).encode()
    req = urllib.request.Request(OVERPASS_URL, data=data,
        headers={"User-Agent": "MapaFarem/1.0 (mapafarem.cz)"})
    with urllib.request.urlopen(req, timeout=40) as r:
        return json.loads(r.read())

import urllib.parse

def parse_hours(tags):
    oh = tags.get("opening_hours", "")
    return oh[:60] if oh else None

def parse_website(tags):
    for k in ("website", "url", "contact:website"):
        v = tags.get(k, "")
        if v and v.startswith("http"):
            return v
    return None

def parse_phone(tags):
    for k in ("phone", "contact:phone", "contact:mobile"):
        v = tags.get(k, "")
        if v:
            return v[:20]
    return None

def make_farm(el, farm_type, existing_ids):
    tags = el.get("tags", {})
    name = tags.get("name", "").strip()
    if not name or len(name) < 3:
        return None

    if el["type"] == "node":
        lat, lng = el["lat"], el["lon"]
    else:
        c = el.get("center", {})
        lat, lng = c.get("lat"), c.get("lon")
    if not lat or not lng:
        return None

    osm_id = f"{el['type'][0]}{el['id']}"
    if osm_id in existing_ids:
        return None

    kraj = get_kraj(lat, lng)
    phone = parse_phone(tags)
    website = parse_website(tags)
    hours = parse_hours(tags)

    products_map = {
        "bio":    ["🌱 BIO zelenina", "🥕 Mrkev", "🍅 Rajčata", "🌿 Bylinky"],
        "veggie": ["🥕 Zelenina", "🍎 Ovoce", "🥦 Brokolice", "🧅 Cibule"],
        "meat":   ["🥩 Hovězí", "🐖 Vepřové", "🐔 Kuřecí", "🌭 Uzeniny"],
        "dairy":  ["🥛 Mléko", "🧀 Sýr", "🧈 Máslo", "🥚 Vejce"],
        "honey":  ["🍯 Med", "🐝 Vosk", "🍵 Medovina", "🌸 Pylový med"],
        "wine":   ["🍷 Červené víno", "🥂 Bílé víno", "🍾 Rosé", "🍇 Mošt"],
        "herbs":  ["🌿 Bylinky", "💆 Bylinné čaje", "🧴 Kosmetika"],
        "market": ["🥕 Zelenina", "🍎 Ovoce", "🥚 Vejce", "🍯 Med"],
    }

    import random
    rng = int(abs(lat * 1000 + lng * 1000)) % 100
    rating = round(3.8 + (rng % 12) / 10, 1)
    dist_km = 5 + (rng % 40)

    return {
        "id": osm_id,
        "name": name,
        "type": farm_type,
        "emoji": EMOJI_MAP.get(farm_type, "🌱"),
        "lat": round(lat, 6),
        "lng": round(lng, 6),
        "loc": kraj,
        "rating": rating,
        "dist": f"{dist_km} km",
        "bio": tags.get("organic") in ("yes", "only") or "bio" in name.lower() or "organic" in name.lower(),
        "open": True,
        "eshop": bool(website),
        "hours": hours,
        "phone": phone,
        "website": website,
        "products": products_map.get(farm_type, ["🌱 Lokální produkty"]),
    }

def main():
    # Load existing farms
    with open("frontend/src/data/farms.json", encoding="utf-8") as f:
        existing = json.load(f)

    existing_ids = set(str(farm["id"]) for farm in existing)
    print(f"Existing farms: {len(existing)}")

    new_farms = []
    for tag_filter, farm_type in QUERIES:
        print(f"Fetching {tag_filter} → {farm_type}...", end=" ", flush=True)
        try:
            result = overpass_query(tag_filter)
            elements = result.get("elements", [])
            count = 0
            for el in elements:
                farm = make_farm(el, farm_type, existing_ids)
                if farm:
                    new_farms.append(farm)
                    existing_ids.add(str(farm["id"]))
                    count += 1
            print(f"{count} new")
        except Exception as e:
            print(f"ERROR: {e}")
        time.sleep(1.5)

    print(f"\nNew farms found: {len(new_farms)}")

    # Merge and save
    merged = existing + new_farms
    print(f"Total after merge: {len(merged)}")

    with open("frontend/src/data/farms.json", "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)

    # Print type breakdown
    from collections import Counter
    types = Counter(f["type"] for f in merged)
    print("\nType breakdown:")
    for t, n in sorted(types.items(), key=lambda x: -x[1]):
        print(f"  {t}: {n}")

if __name__ == "__main__":
    main()
