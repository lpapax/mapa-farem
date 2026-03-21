"""
Fix region (loc) assignment for farms using Nominatim reverse geocoding.
Only processes new farms (string OSM IDs). Skips originals (int IDs).
Rate limit: 1 req/sec as required by Nominatim ToS.
"""
import json, time, urllib.request, urllib.parse, sys
sys.stdout.reconfigure(encoding='utf-8')

NOMINATIM = "https://nominatim.openstreetmap.org/reverse"

# Map Nominatim state/county names → our kraj labels
KRAJ_MAP = {
    "Jihočeský kraj": "Jihočeský kraj",
    "Jihomoravský kraj": "Jihomoravský kraj",
    "Karlovarský kraj": "Karlovarský kraj",
    "Kraj Vysočina": "Vysočina",
    "Královéhradecký kraj": "Královéhradecký kraj",
    "Liberecký kraj": "Liberecký kraj",
    "Moravskoslezský kraj": "Moravskoslezský kraj",
    "Olomoucký kraj": "Olomoucký kraj",
    "Pardubický kraj": "Pardubický kraj",
    "Plzeňský kraj": "Plzeňský kraj",
    "Středočeský kraj": "Středočeský kraj",
    "Ústecký kraj": "Ústecký kraj",
    "Zlínský kraj": "Zlínský kraj",
    "Praha": "Praha / Středočeský kraj",
    "Hlavní město Praha": "Praha / Středočeský kraj",
}

def reverse_geocode(lat, lng):
    params = urllib.parse.urlencode({
        "lat": lat, "lon": lng,
        "format": "json", "zoom": 5,
        "accept-language": "cs",
    })
    req = urllib.request.Request(
        f"{NOMINATIM}?{params}",
        headers={"User-Agent": "MapaFarem/1.0 (mapafarem.cz)"}
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read())
            addr = data.get("address", {})
            # Try state first
            state = addr.get("state", "")
            # Fall back to county
            county = addr.get("county", "")
            kraj = KRAJ_MAP.get(state) or KRAJ_MAP.get(county)
            # Check if it's not Czech at all
            country_code = addr.get("country_code", "")
            if country_code != "cz":
                return None  # Not Czech, remove
            return kraj or state or "Česká republika"
    except Exception as e:
        return "Česká republika"

def main():
    with open("frontend/src/data/farms.json", encoding="utf-8") as f:
        farms = json.load(f)

    print(f"Total farms: {len(farms)}")

    # Only process new farms (string IDs)
    new_farms = [f for f in farms if isinstance(f['id'], str)]
    orig_farms = [f for f in farms if isinstance(f['id'], int)]
    print(f"Original farms (skip): {len(orig_farms)}")
    print(f"New farms to fix: {len(new_farms)}")

    fixed = 0
    removed = 0
    result_new = []

    for i, farm in enumerate(new_farms):
        if i % 50 == 0:
            print(f"Progress: {i}/{len(new_farms)} (fixed: {fixed}, removed: {removed})")

        kraj = reverse_geocode(farm['lat'], farm['lng'])
        time.sleep(1.1)  # Nominatim rate limit

        if kraj is None:
            removed += 1
            continue  # Not Czech, skip

        if kraj != farm['loc']:
            fixed += 1

        farm['loc'] = kraj
        result_new.append(farm)

    merged = orig_farms + result_new
    print(f"\nDone! Fixed: {fixed}, Removed non-CZ: {removed}")
    print(f"Final count: {len(merged)}")

    with open("frontend/src/data/farms.json", "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)

    # Summary
    from collections import Counter
    regions = Counter(f['loc'] for f in merged)
    print("\nTop regions:")
    for r, n in regions.most_common(15):
        print(f"  {r}: {n}")

if __name__ == "__main__":
    main()
