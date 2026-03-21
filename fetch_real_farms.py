"""
Fetch real Czech farm shops from OpenStreetMap Overpass API,
then enrich with Google Places data (phone, website, hours, rating).
Outputs to frontend/src/data/farms.json
"""
import json, requests, time, sys, math

sys.stdout.reconfigure(encoding='utf-8')

GOOGLE_API_KEY = "REDACTED_GOOGLE_API_KEY"
OUT_FILE = "frontend/src/data/farms.json"

# ── 1. OVERPASS: fetch shop=farm nodes + ways in Czech Republic ─────────────
OVERPASS_URL = "https://overpass-api.de/api/interpreter"

QUERY = """
[out:json][timeout:60];
(
  node["shop"="farm"](48.5,12.1,51.1,18.9);
  way["shop"="farm"](48.5,12.1,51.1,18.9);
  node["shop"="greengrocer"](48.5,12.1,51.1,18.9);
  node["shop"="butcher"]["farm_produce"](48.5,12.1,51.1,18.9);
  node["farm_shop"](48.5,12.1,51.1,18.9);
  node["amenity"="farm"](48.5,12.1,51.1,18.9);
);
out center tags;
"""

print("Fetching farms from OpenStreetMap Overpass API...")
try:
    r = requests.post(OVERPASS_URL, data={"data": QUERY}, timeout=90)
    r.raise_for_status()
    elements = r.json().get("elements", [])
    print(f"Found {len(elements)} OSM elements")
except Exception as e:
    print(f"Overpass error: {e}")
    elements = []

# ── 2. Map type from OSM tags ───────────────────────────────────────────────
def guess_type(tags):
    name = (tags.get("name") or "").lower()
    produce = (tags.get("produce") or tags.get("farm_produce") or "").lower()
    combined = name + " " + produce
    if any(w in combined for w in ["bio", "eko", "organic", "biodynamic"]): return "bio"
    if any(w in combined for w in ["maso", "drůbež", "hovězí", "vepřový", "jehně", "butcher", "fleisch"]): return "meat"
    if any(w in combined for w in ["mléko", "sýr", "máslo", "dairy", "milch", "mlék"]): return "dairy"
    if any(w in combined for w in ["med", "honey", "včel"]): return "honey"
    if any(w in combined for w in ["víno", "wine", "vinař", "wein"]): return "wine"
    if any(w in combined for w in ["byliny", "herbs", "levandule", "tymián"]): return "herbs"
    if tags.get("shop") == "greengrocer": return "veggie"
    return "veggie"

TYPE_EMOJI = {
    "bio": "🌱", "veggie": "🥕", "meat": "🥩", "dairy": "🥛",
    "honey": "🍯", "wine": "🍷", "herbs": "🌿", "market": "🛒"
}

def guess_emoji(tags, farm_type):
    name = (tags.get("name") or "").lower()
    if "med" in name or "honey" in name or "včel" in name: return "🍯"
    if "víno" in name or "vinic" in name: return "🍷"
    if "ovce" in name or "sheep" in name: return "🐑"
    if "koza" in name or "kozy" in name: return "🐐"
    if "krávy" in name or "mlék" in name: return "🐄"
    if "vejce" in name or "eggs" in name: return "🥚"
    if "ovoce" in name or "sad" in name: return "🍎"
    if "byliny" in name or "herbs" in name: return "🌿"
    return TYPE_EMOJI.get(farm_type, "🌿")

def get_location_name(lat, lng):
    """Rough Czech region from coordinates."""
    if lat > 50.5: return "Liberecký kraj" if lng > 15 else "Ústecký kraj" if lng < 14 else "Středočeský kraj"
    if lat > 49.8:
        if lng < 13.5: return "Plzeňský kraj"
        if lng < 14.5: return "Středočeský kraj"
        if lng < 16: return "Praha / Středočeský kraj"
        if lng < 17: return "Pardubický kraj"
        return "Olomoucký kraj"
    if lat > 49.2:
        if lng < 14.5: return "Jihočeský kraj"
        if lng < 16: return "Vysočina"
        if lng < 17: return "Jihomoravský kraj"
        return "Zlínský kraj"
    if lng > 17.5: return "Moravskoslezský kraj"
    if lng > 16: return "Jihomoravský kraj"
    return "Jihočeský kraj"

# ── 3. Build farms list from OSM data ──────────────────────────────────────
farms = []
seen_names = set()
farm_id = 1

for el in elements:
    tags = el.get("tags", {})
    name = tags.get("name", "").strip()
    if not name or name.lower() in ("farm", "farma", "obchod", "shop"):
        continue
    if name in seen_names:
        continue
    seen_names.add(name)

    # Get coordinates
    if el["type"] == "node":
        lat, lng = el.get("lat"), el.get("lon")
    else:
        center = el.get("center", {})
        lat, lng = center.get("lat"), center.get("lon")

    if not lat or not lng:
        continue

    farm_type = guess_type(tags)
    emoji = guess_emoji(tags, farm_type)

    # Products from tags
    products = []
    for key in ["produce", "farm_produce", "shop:produce"]:
        val = tags.get(key, "")
        if val:
            products = [emoji + " " + p.strip().capitalize() for p in val.split(";") if p.strip()]
            break

    farm = {
        "id": farm_id,
        "name": name,
        "loc": get_location_name(lat, lng),
        "type": farm_type,
        "lat": round(lat, 6),
        "lng": round(lng, 6),
        "emoji": emoji,
        "rating": 4.0,
        "open": None,
        "bio": "bio" in name.lower() or "eko" in name.lower() or farm_type == "bio",
        "dist": "—",
        "hours": tags.get("opening_hours", None),
        "phone": tags.get("phone") or tags.get("contact:phone"),
        "website": tags.get("website") or tags.get("contact:website") or tags.get("url"),
        "email": tags.get("email") or tags.get("contact:email"),
        "products": products,
        "description": f"{name} — {get_location_name(lat, lng)}.",
        "delivery": tags.get("delivery") == "yes",
        "eshop": bool(tags.get("website") or tags.get("contact:website")),
        "verified": False,
        "source": "osm",
        "osm_id": el.get("id"),
        "google_verified": False,
    }
    farms.append(farm)
    farm_id += 1

print(f"Parsed {len(farms)} unique named Czech farm shops from OSM")

# ── 4. Google Places enrichment ─────────────────────────────────────────────
def find_place(name, lat, lng):
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {
        "query": name,
        "location": f"{lat},{lng}",
        "radius": 5000,
        "key": GOOGLE_API_KEY,
        "language": "cs",
    }
    try:
        r = requests.get(url, params=params, timeout=8)
        results = r.json().get("results", [])
        if results:
            return results[0]
    except Exception as e:
        print(f"  Error: {e}")
    return None

def get_details(place_id):
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "place_id": place_id,
        "fields": "name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,opening_hours",
        "key": GOOGLE_API_KEY,
        "language": "cs",
    }
    try:
        r = requests.get(url, params=params, timeout=8)
        return r.json().get("result", {})
    except:
        return {}

print(f"\nEnriching {len(farms)} farms with Google Places data...")
enriched = not_found = skipped = 0

for i, farm in enumerate(farms):
    if farm.get("phone") and farm.get("website"):
        skipped += 1
        continue

    name = farm["name"]
    lat, lng = farm["lat"], farm["lng"]

    print(f"[{i+1}/{len(farms)}] {name}...", end=" ", flush=True)
    place = find_place(name, lat, lng)

    if not place:
        print("not found")
        not_found += 1
    else:
        place_id = place.get("place_id")
        d = get_details(place_id) if place_id else {}
        if d.get("formatted_phone_number") and not farm.get("phone"):
            farm["phone"] = d["formatted_phone_number"]
        if d.get("website") and not farm.get("website"):
            farm["website"] = d["website"]
            farm["eshop"] = True
        if d.get("rating"):
            farm["rating"] = d["rating"]
        if d.get("user_ratings_total"):
            farm["rating_count"] = d["user_ratings_total"]
        if d.get("formatted_address"):
            farm["address"] = d["formatted_address"]
        if d.get("opening_hours", {}).get("weekday_text"):
            farm["hours"] = " | ".join(d["opening_hours"]["weekday_text"][:2])
        farm["google_place_id"] = place_id
        farm["google_verified"] = True
        print(f"OK | rating={farm.get('rating')} | phone={farm.get('phone','—')[:20] if farm.get('phone') else '—'}")
        enriched += 1

    if i % 20 == 0 and i > 0:
        with open(OUT_FILE, "w", encoding="utf-8") as f:
            json.dump(farms, f, ensure_ascii=False, indent=2)
        print(f"-- Saved checkpoint ({i} processed) --")

    time.sleep(0.15)

# ── 5. Save final result ─────────────────────────────────────────────────────
with open(OUT_FILE, "w", encoding="utf-8") as f:
    json.dump(farms, f, ensure_ascii=False, indent=2)

print(f"\nDone!")
print(f"Total farms: {len(farms)}")
print(f"Google enriched: {enriched} | Not found: {not_found} | Skipped (already had data): {skipped}")
has_phone = sum(1 for f in farms if f.get("phone"))
has_website = sum(1 for f in farms if f.get("website"))
print(f"Has phone: {has_phone} | Has website: {has_website}")
