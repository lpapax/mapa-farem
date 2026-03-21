"""
merge_carnivore.py
------------------
Přidá carnivore kandidáty z carnivore_candidates.json do farms.json.
Filtruje: rating >= 4.3, reviews >= 10

Použití:
  python merge_carnivore.py
"""

import json, sys
sys.stdout.reconfigure(encoding='utf-8')

CANDIDATES_PATH = "carnivore_candidates.json"
FARMS_PATH = "frontend/src/data/farms.json"
MIN_RATING = 4.3
MIN_REVIEWS = 10

# Google Place types to exclude (restaurants, supermarkets, chains)
EXCLUDE_TYPES = {
    'restaurant', 'bar', 'cafe', 'meal_delivery', 'meal_takeaway',
    'lodging', 'bakery', 'night_club', 'supermarket', 'department_store',
}
# Name keywords that indicate chains/supermarkets
EXCLUDE_NAME_KEYWORDS = [
    'globus', 'makro', 'albert', 'billa', 'lidl', 'kaufland', 'tesco',
    'penny', 'coop', 'spar', 'aldi', 'interspar', 'hypermarket',
]

REGION_MAP = {
    "Praha": "Praha", "Středočeský": "Středočeský kraj", "Jihočeský": "Jihočeský kraj",
    "Plzeňský": "Plzeňský kraj", "Karlovarský": "Karlovarský kraj",
    "Ústecký": "Ústecký kraj", "Liberecký": "Liberecký kraj",
    "Královéhradecký": "Královéhradecký kraj", "Pardubický": "Pardubický kraj",
    "Vysočina": "Kraj Vysočina", "Jihomoravský": "Jihomoravský kraj",
    "Olomoucký": "Olomoucký kraj", "Zlínský": "Zlínský kraj",
    "Moravskoslezský": "Moravskoslezský kraj",
}

TYPE_EMOJI = {"meat": "🥩", "dairy": "🥛", "honey": "🍯"}

def guess_loc(full_address):
    if not full_address:
        return "Česká republika"
    for key, region in REGION_MAP.items():
        if key in full_address:
            return region
    return "Česká republika"

def main():
    with open(FARMS_PATH, encoding="utf-8") as f:
        farms = json.load(f)
    with open(CANDIDATES_PATH, encoding="utf-8") as f:
        candidates = json.load(f)

    existing_pids = {f.get("place_id") for f in farms if f.get("place_id")}
    existing_names = {f["name"].lower().strip() for f in farms}

    numeric_ids = [int(str(f["id"]).lstrip("nwr")) for f in farms if str(f["id"]).lstrip("nwr").isdigit()]
    next_id = max(numeric_ids) + 1 if numeric_ids else 10000

    added = 0
    skipped_dup = 0
    skipped_quality = 0

    for c in candidates:
        if c.get("place_id") in existing_pids:
            skipped_dup += 1
            continue
        if c["name"].lower().strip() in existing_names:
            skipped_dup += 1
            continue
        rating = c.get("google_rating", 0)
        reviews = c.get("google_reviews", 0)
        if rating < MIN_RATING or reviews < MIN_REVIEWS:
            skipped_quality += 1
            continue

        # Exclude restaurants, supermarkets, chains
        gtypes = c.get("google_types", [])
        if any(t in EXCLUDE_TYPES for t in gtypes):
            skipped_quality += 1
            continue
        name_lower = c["name"].lower()
        if any(kw in name_lower for kw in EXCLUDE_NAME_KEYWORDS):
            skipped_quality += 1
            continue

        loc = guess_loc(c.get("full_address"))
        farm_type = c.get("type", "meat")
        new_farm = {
            "id": next_id,
            "name": c["name"],
            "loc": loc,
            "full_address": c.get("full_address"),
            "type": farm_type,
            "lat": c.get("lat"),
            "lng": c.get("lng"),
            "emoji": TYPE_EMOJI.get(farm_type, "🥩"),
            "rating": round(rating, 1),
            "open": False,
            "bio": False,
            "dist": None,
            "hours": c.get("hours"),
            "phone": c.get("phone"),
            "website": c.get("website"),
            "email": None,
            "products": [],
            "description": None,
            "delivery": False,
            "eshop": bool(c.get("website")),
            "verified": False,
            "source": "google_carnivore",
            "place_id": c.get("place_id"),
            "google_rating": rating,
            "google_reviews": reviews,
        }
        farms.append(new_farm)
        existing_pids.add(c.get("place_id"))
        existing_names.add(c["name"].lower().strip())
        next_id += 1
        added += 1
        print(f"  + [{rating} / {reviews}r] {c['name'][:50]} ({loc})")

    with open(FARMS_PATH, "w", encoding="utf-8") as f:
        json.dump(farms, f, ensure_ascii=False, indent=2)

    print(f"\nPridano: {added}, duplicity: {skipped_dup}, nizka kvalita: {skipped_quality}")
    print(f"Celkem farem: {len(farms)}")

if __name__ == "__main__":
    main()
