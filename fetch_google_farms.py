"""
fetch_google_farms.py
---------------------
Hledá NOVÉ farmy přes Google Places Text Search API.
Prohledá celou ČR po krajích, vrátí farmy co ještě nemáme.

Použití:
  GOOGLE_API_KEY=AIzaSy... python fetch_google_farms.py

Výsledek:
  - Uloží nové farmy do: google_farms_new.json
  - Vypíše kolik nových farem našel
  - Duplicity s farms.json jsou automaticky odstraněny

Cena: ~80 requestů × $0.032/1000 = ~$0.003 (zdarma v rámci free kreditu)
"""

import json
import time
import os
import requests

API_KEY = os.environ.get("GOOGLE_API_KEY", "VLOZ_SEM_SVUJ_API_KLIC")

FARMS_PATH = "frontend/src/data/farms.json"
OUTPUT_PATH = "google_farms_new.json"

# Vyhledávací termíny v češtině
QUERIES = [
    "farma prodej",
    "biofarma",
    "farmářský obchod",
    "zelinářství přímý prodej",
    "ovocná farma",
    "mléčná farma",
    "včelařství med prodej",
    "vinařství",
    "řeznictví farma",
    "farmářský trh",
    "agroturistika farma",
    "bylinková farma",
]

# Souřadnice center krajů ČR + radius
REGIONS = [
    ("Praha",               50.0755,  14.4378),
    ("Středočeský kraj",    49.8694,  14.6508),
    ("Jihočeský kraj",      49.1651,  14.4822),
    ("Plzeňský kraj",       49.7384,  13.3736),
    ("Karlovarský kraj",    50.2315,  12.8717),
    ("Ústecký kraj",        50.5956,  13.9022),
    ("Liberecký kraj",      50.7663,  15.0543),
    ("Královéhradecký kraj",50.2093,  15.8328),
    ("Pardubický kraj",     49.9448,  15.7748),
    ("Vysočina",            49.3961,  15.5919),
    ("Jihomoravský kraj",   49.2002,  16.6078),
    ("Olomoucký kraj",      49.5938,  17.2509),
    ("Zlínský kraj",        49.2256,  17.6630),
    ("Moravskoslezský kraj",49.8209,  18.2625),
]

TYPE_MAP = {
    "biofarma": "bio",
    "bio": "bio",
    "organic": "bio",
    "vinařství": "wine",
    "vinar": "wine",
    "včelař": "honey",
    "med": "honey",
    "řeznictví": "meat",
    "maso": "meat",
    "mlékárna": "dairy",
    "mléčn": "dairy",
    "bylink": "herbs",
    "trh": "market",
    "marketplace": "market",
    "agroturistik": "agroturistika",
}

EMOJI_MAP = {
    "bio": "🌱",
    "veggie": "🥕",
    "meat": "🥩",
    "dairy": "🥛",
    "honey": "🍯",
    "wine": "🍷",
    "herbs": "🌿",
    "market": "🏪",
    "agroturistika": "🏡",
}


def guess_type(name, types):
    name_lower = name.lower()
    for key, farm_type in TYPE_MAP.items():
        if key in name_lower:
            return farm_type
    for t in (types or []):
        if "farm" in t:
            return "veggie"
        if "market" in t:
            return "market"
        if "wine" in t or "winery" in t:
            return "wine"
    return "veggie"


def search_places(query, lat, lng, radius=40000):
    """Google Places Text Search v zadané oblasti."""
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    results = []
    page_token = None

    for page in range(3):  # max 3 stránky = 60 výsledků
        params = {
            "query": query,
            "location": f"{lat},{lng}",
            "radius": radius,
            "region": "cz",
            "language": "cs",
            "key": API_KEY,
        }
        if page_token:
            params = {"pagetoken": page_token, "key": API_KEY}
            time.sleep(2)  # Google vyžaduje pauzu před next_page_token

        try:
            resp = requests.get(url, params=params, timeout=10)
            data = resp.json()

            if data.get("status") == "REQUEST_DENIED":
                print(f"  ❌ API chyba: {data.get('error_message')}")
                return results

            for place in data.get("results", []):
                results.append({
                    "place_id": place.get("place_id"),
                    "name": place.get("name"),
                    "address": place.get("formatted_address", ""),
                    "lat": place.get("geometry", {}).get("location", {}).get("lat"),
                    "lng": place.get("geometry", {}).get("location", {}).get("lng"),
                    "google_rating": place.get("rating"),
                    "google_reviews": place.get("user_ratings_total"),
                    "types": place.get("types", []),
                })

            page_token = data.get("next_page_token")
            if not page_token:
                break

        except Exception as e:
            print(f"  ⚠️  Chyba: {e}")
            break

    return results


def main():
    if API_KEY == "VLOZ_SEM_SVUJ_API_KLIC":
        print("❌ Nastav API_KEY nebo spusť s: GOOGLE_API_KEY=... python fetch_google_farms.py")
        return

    # Načti existující farmy (pro deduplikaci)
    with open(FARMS_PATH, "r", encoding="utf-8") as f:
        existing = json.load(f)

    existing_names = {f["name"].lower().strip() for f in existing}
    existing_place_ids = {f.get("place_id") for f in existing if f.get("place_id")}

    print(f"Existující farmy: {len(existing)}")
    print(f"Hledám nové farmy přes Google Places...\n")

    all_found = {}  # place_id → data (deduplikace přes place_id)
    total_requests = 0

    for region_name, lat, lng in REGIONS:
        print(f"📍 {region_name}...")
        for query in QUERIES:
            full_query = f"{query} {region_name} Česká republika"
            results = search_places(full_query, lat, lng)
            total_requests += 1

            for r in results:
                pid = r.get("place_id")
                if pid and pid not in all_found:
                    all_found[pid] = {**r, "region": region_name}

            time.sleep(0.1)

        print(f"   Celkem nalezeno (unique): {len(all_found)}")

    print(f"\nCelkem API requestů: {total_requests}")
    print(f"Celkem unique míst: {len(all_found)}")

    # Filtruj: odstraň existující farmy
    new_farms = []
    numeric_ids = [int(str(f["id"]).lstrip("nwr")) for f in existing if str(f["id"]).lstrip("nwr").isdigit()]
    max_id = (max(numeric_ids) if numeric_ids else 0) + 1

    for pid, place in all_found.items():
        name = place.get("name", "")
        # Přeskočit pokud už máme (podle place_id nebo názvu)
        if pid in existing_place_ids:
            continue
        if name.lower().strip() in existing_names:
            continue

        farm_type = guess_type(name, place.get("types", []))

        # Zpracuj adresu → lokaci
        address = place.get("address", "")
        # Odstraň "Česká republika" z konce
        loc = address.replace(", Česká republika", "").replace(", Czechia", "").strip()
        # Vezmi jen kraj z adresy (poslední část před ČR)
        parts = [p.strip() for p in loc.split(",")]
        loc_short = parts[-1] if parts else loc

        new_farms.append({
            "id": max_id,
            "name": name,
            "loc": loc_short,
            "full_address": loc,
            "type": farm_type,
            "lat": place.get("lat"),
            "lng": place.get("lng"),
            "emoji": EMOJI_MAP.get(farm_type, "🌾"),
            "rating": place.get("google_rating") or 4.0,
            "open": None,
            "bio": farm_type == "bio",
            "dist": "—",
            "hours": None,
            "phone": None,
            "website": None,
            "email": None,
            "products": [],
            "description": None,
            "delivery": False,
            "eshop": False,
            "verified": False,
            "source": "google",
            "place_id": pid,
            "google_rating": place.get("google_rating"),
            "google_reviews": place.get("google_reviews"),
        })
        max_id += 1

    print(f"\nNové farmy (bez duplikátů): {len(new_farms)}")

    # Uloži nové farmy pro review
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(new_farms, f, ensure_ascii=False, indent=2)

    print(f"✅ Uloženo do {OUTPUT_PATH}")
    print(f"\nTop 10 nalezených:")
    for farm in new_farms[:10]:
        rating = f"⭐{farm['google_rating']}" if farm.get('google_rating') else ""
        reviews = f"({farm['google_reviews']} rec.)" if farm.get('google_reviews') else ""
        print(f"  {farm['emoji']} {farm['name'][:40]:<40} {farm['loc'][:25]:<25} {rating} {reviews}")

    print(f"\n💡 Zkontroluj {OUTPUT_PATH} a pokud souhlasíš, spusť:")
    print(f"   python merge_google_farms.py")


if __name__ == "__main__":
    main()
