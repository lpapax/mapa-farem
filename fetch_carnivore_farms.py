"""
fetch_carnivore_farms.py
------------------------
Hledá prodejce cílené na carnivore/high-quality animal products:
- přímý prodej hovězí, vepřové, jehněčí
- dry aged, orgánové maso
- syrové mléko, farmářské vajíčka
- specializované řeznictví

Použití:
  GOOGLE_API_KEY=AIzaSy... python fetch_carnivore_farms.py
"""

import json, time, os, requests, sys
sys.stdout.reconfigure(encoding='utf-8')

API_KEY = os.environ.get("GOOGLE_API_KEY", "VLOZ_SEM_SVUJ_API_KLIC")
FARMS_PATH = "frontend/src/data/farms.json"
OUTPUT_PATH = "carnivore_candidates.json"

QUERIES = [
    "přímý prodej hovězí maso farma",
    "přímý prodej vepřové maso farma",
    "farmářské maso přímý prodej Česká republika",
    "hovězí maso od farmáře přímý prodej",
    "dry aged beef Česká republika",
    "orgánové maso přímý prodej",
    "syrové mléko farma přímý prodej",
    "farmářská řeznictví Česká republika",
    "grass fed hovězí Česká republika",
    "přímý prodej jehněčí maso farma",
    "farmářská vajíčka přímý prodej",
    "farmářský salám uzeniny přímý prodej",
    "přímý prodej selata prasata farma",
    "bio maso přímý prodej farma",
    "farmářský skot přímý prodej",
]

REGIONS = [
    "Praha", "Středočeský kraj", "Jihočeský kraj", "Plzeňský kraj",
    "Karlovarský kraj", "Ústecký kraj", "Liberecký kraj", "Královéhradecký kraj",
    "Pardubický kraj", "Vysočina", "Jihomoravský kraj", "Olomoucký kraj",
    "Zlínský kraj", "Moravskoslezský kraj",
]

TYPE_MAP = {
    "hovězí": "meat", "vepřové": "meat", "jehněčí": "meat", "maso": "meat",
    "řeznictví": "meat", "uzeniny": "meat", "salám": "meat", "dry aged": "meat",
    "orgánové": "meat", "selata": "meat", "skot": "meat", "bio maso": "meat",
    "grass fed": "meat",
    "syrové mléko": "dairy", "mléko": "dairy",
    "vajíčka": "meat",
}


def guess_type(query):
    q = query.lower()
    for kw, t in TYPE_MAP.items():
        if kw in q:
            return t
    return "meat"


def text_search(query, page_token=None):
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {"query": query, "key": API_KEY, "language": "cs", "region": "cz"}
    if page_token:
        params = {"pagetoken": page_token, "key": API_KEY}
    try:
        r = requests.get(url, params=params, timeout=12)
        return r.json()
    except Exception as e:
        print(f"  Chyba: {e}")
        return {}


def get_place_details(place_id):
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "place_id": place_id,
        "fields": "website,formatted_phone_number,formatted_address,opening_hours,name,geometry,rating,user_ratings_total,types",
        "key": API_KEY, "language": "cs",
    }
    try:
        r = requests.get(url, params=params, timeout=12)
        d = r.json()
        if d.get("status") == "OK":
            return d.get("result", {})
    except Exception as e:
        print(f"  Detail chyba: {e}")
    return {}


def main():
    if API_KEY == "VLOZ_SEM_SVUJ_API_KLIC":
        print("Nastav GOOGLE_API_KEY")
        return

    with open(FARMS_PATH, encoding="utf-8") as f:
        existing = json.load(f)

    existing_place_ids = {f.get("place_id") for f in existing if f.get("place_id")}
    existing_names = {f["name"].lower().strip() for f in existing}

    candidates = []
    seen_place_ids = set(existing_place_ids)

    total_queries = len(QUERIES) * len(REGIONS)
    done = 0

    for query in QUERIES:
        for region in REGIONS:
            full_query = f"{query} {region}"
            done += 1
            print(f"[{done}/{total_queries}] {full_query[:70]}")

            data = text_search(full_query)
            results = data.get("results", [])

            page = 0
            while True:
                for place in results:
                    pid = place.get("place_id")
                    if not pid or pid in seen_place_ids:
                        continue
                    seen_place_ids.add(pid)

                    rating = place.get("rating", 0)
                    reviews = place.get("user_ratings_total", 0)

                    # Pouze kvalitní prodejci
                    if rating < 4.2 or reviews < 5:
                        continue

                    name = place.get("name", "")
                    if name.lower().strip() in existing_names:
                        continue

                    loc = place.get("geometry", {}).get("location", {})
                    lat, lng = loc.get("lat"), loc.get("lng")

                    # Musí být v ČR (hrubý bounding box)
                    if not (48.5 <= (lat or 0) <= 51.2 and 12.0 <= (lng or 0) <= 18.9):
                        continue

                    candidates.append({
                        "place_id": pid,
                        "name": name,
                        "google_rating": rating,
                        "google_reviews": reviews,
                        "lat": lat,
                        "lng": lng,
                        "type": guess_type(query),
                        "_query": query,
                    })

                token = data.get("next_page_token")
                if not token or page >= 2:
                    break
                page += 1
                time.sleep(2.2)
                data = text_search(full_query, token)
                results = data.get("results", [])

            time.sleep(0.15)

    print(f"\nNalezeno kandidátů: {len(candidates)}")

    # Seřadit podle ratingu
    candidates.sort(key=lambda x: -(x["google_rating"] * min(x["google_reviews"], 500)))

    # Stáhnout detaily pro top kandidáty
    print(f"\nStahuji detaily pro top {min(len(candidates), 300)} ...")
    enriched = []
    for i, c in enumerate(candidates[:300]):
        details = get_place_details(c["place_id"])
        if details:
            hours_raw = details.get("opening_hours", {}).get("weekday_text", [])
            addr = details.get("formatted_address", "")
            addr = addr.replace(", Česká republika", "").replace(", Czechia", "").strip()

            enriched.append({
                **c,
                "website": details.get("website"),
                "phone": details.get("formatted_phone_number"),
                "full_address": addr or None,
                "hours": "; ".join(hours_raw) if hours_raw else None,
                "google_types": details.get("types", []),
            })
            print(f"  [{i+1}] {c['google_rating']} ({c['google_reviews']}r) {c['name'][:50]}")
        time.sleep(0.15)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(enriched, f, ensure_ascii=False, indent=2)

    print(f"\nUlozeno {len(enriched)} kandidatu do {OUTPUT_PATH}")
    print("Zkontroluj soubor a spust merge_carnivore.py pro pridani do farms.json")


if __name__ == "__main__":
    main()
