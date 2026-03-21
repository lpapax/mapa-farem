import json, requests, time

API_KEY = "REDACTED_GOOGLE_API_KEY"
FARMS_FILE = "frontend/src/data/farms.json"

def find_place(name, lat, lng):
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {"query": name, "location": f"{lat},{lng}", "radius": 15000, "key": API_KEY, "language": "cs"}
    try:
        r = requests.get(url, params=params, timeout=8)
        results = r.json().get("results", [])
        if results:
            return results[0]
    except Exception as e:
        print(f"  Chyba: {e}")
    return None

def get_details(place_id):
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {"place_id": place_id, "fields": "name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,opening_hours", "key": API_KEY, "language": "cs"}
    try:
        r = requests.get(url, params=params, timeout=8)
        return r.json().get("result", {})
    except:
        return {}

with open(FARMS_FILE, encoding="utf-8") as f:
    farms = json.load(f)

print(f"Celkem farem: {len(farms)}")
enriched = not_found = skipped = 0

for i, farm in enumerate(farms):
    if farm.get("phone") or farm.get("website"):
        skipped += 1
        continue

    name = farm.get("name", "")
    lat, lng = farm.get("lat"), farm.get("lng")
    if not name or not lat or not lng:
        continue

    print(f"[{i+1}/{len(farms)}] {name}...", end=" ", flush=True)
    place = find_place(name, lat, lng)

    if not place:
        print("nenalezeno")
        farm["google_verified"] = False
        not_found += 1
    else:
        place_id = place.get("place_id")
        d = get_details(place_id) if place_id else {}
        if d.get("formatted_phone_number"): farm["phone"] = d["formatted_phone_number"]
        if d.get("website"): farm["website"] = d["website"]
        if d.get("rating"): farm["rating"] = d["rating"]
        if d.get("user_ratings_total"): farm["rating_count"] = d["user_ratings_total"]
        if d.get("formatted_address"): farm["address"] = d["formatted_address"]
        if d.get("opening_hours", {}).get("weekday_text"):
            farm["hours"] = " | ".join(d["opening_hours"]["weekday_text"][:2])
        farm["google_place_id"] = place_id
        farm["google_verified"] = True
        print(f"OK rating={farm.get('rating')} tel={farm.get('phone','—')}")
        enriched += 1

    if i % 50 == 0:
        with open(FARMS_FILE, "w", encoding="utf-8") as f:
            json.dump(farms, f, ensure_ascii=False, indent=2)
        print(f"-- Ulozeno ({i} zpracovano) --")

    time.sleep(0.1)

with open(FARMS_FILE, "w", encoding="utf-8") as f:
    json.dump(farms, f, ensure_ascii=False, indent=2)

print(f"\nHotovo! Obohaceno: {enriched} | Nenalezeno: {not_found} | Preskoceno: {skipped}")
