"""
fetch_place_ids.py
------------------
Dohledá Google Place ID pro každou farmu v farms.json
pomocí Google Places "Find Place from Text" API.

Použití:
  1. Nastav API_KEY níže (nebo přes env: GOOGLE_API_KEY=... python fetch_place_ids.py)
  2. Spusť: python fetch_place_ids.py
  3. Výsledek se uloží do farms.json (přidá pole place_id, google_rating, google_reviews)

Cena: ~467 requestů × $0.017/1000 ≈ ~$0.008 (v rámci free $200/měsíc kreditu)
"""

import json
import time
import os
import requests

API_KEY = os.environ.get("GOOGLE_API_KEY", "VLOZ_SEM_SVUJ_API_KLIC")

FARMS_PATH = "frontend/src/data/farms.json"

def find_place(name, lat, lng, loc):
    """Najde Google Place ID pro farmu podle jména + souřadnic."""
    url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
    params = {
        "input": f"{name} {loc} Česká republika",
        "inputtype": "textquery",
        "fields": "place_id,name,rating,user_ratings_total,geometry",
        "key": API_KEY,
        # Zaměřit hledání na ČR (bounding box)
        "locationbias": f"circle:5000@{lat},{lng}" if lat and lng else "rectangle:48.5,12.0|51.1,18.9",
    }
    try:
        resp = requests.get(url, params=params, timeout=10)
        data = resp.json()
        if data.get("status") == "OK" and data.get("candidates"):
            c = data["candidates"][0]
            return {
                "place_id": c.get("place_id"),
                "google_rating": c.get("rating"),
                "google_reviews": c.get("user_ratings_total"),
            }
        elif data.get("status") == "REQUEST_DENIED":
            print(f"  ❌ API chyba: {data.get('error_message')}")
            return None
    except Exception as e:
        print(f"  ⚠️  Chyba requestu: {e}")
    return None


def main():
    if API_KEY == "VLOZ_SEM_SVUJ_API_KLIC":
        print("❌ Nastav API_KEY nebo spusť s: GOOGLE_API_KEY=... python fetch_place_ids.py")
        return

    with open(FARMS_PATH, "r", encoding="utf-8") as f:
        farms = json.load(f)

    total = len(farms)
    found = 0
    skipped = 0

    print(f"Zpracovávám {total} farem...\n")

    for i, farm in enumerate(farms):
        # Přeskočit pokud už má place_id
        if farm.get("place_id"):
            skipped += 1
            continue

        name = farm.get("name", "")
        lat = farm.get("lat")
        lng = farm.get("lng")
        loc = farm.get("loc", "")

        result = find_place(name, lat, lng, loc)

        if result and result.get("place_id"):
            farm["place_id"] = result["place_id"]
            if result.get("google_rating"):
                farm["google_rating"] = result["google_rating"]
            if result.get("google_reviews"):
                farm["google_reviews"] = result["google_reviews"]
            found += 1
            print(f"[{i+1}/{total}] ✅ {name[:40]:<40} → {result['place_id'][:20]}... "
                  f"({'⭐'+str(result.get('google_rating','?'))+' ('+str(result.get('google_reviews','?'))+' rec.)' if result.get('google_rating') else 'bez ratingu'})")
        else:
            print(f"[{i+1}/{total}] ❌ {name[:40]:<40} → nenalezeno")

        # Rate limiting: max 10 req/sec, buďme opatrní
        time.sleep(0.15)

        # Průběžně ukládat každých 50 farem
        if (i + 1) % 50 == 0:
            with open(FARMS_PATH, "w", encoding="utf-8") as f:
                json.dump(farms, f, ensure_ascii=False, indent=2)
            print(f"\n  💾 Průběžně uloženo ({found} nalezeno)\n")

    # Finální uložení
    with open(FARMS_PATH, "w", encoding="utf-8") as f:
        json.dump(farms, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Hotovo!")
    print(f"   Nalezeno: {found}/{total - skipped} farem")
    print(f"   Přeskočeno (již měly place_id): {skipped}")
    print(f"\nFarms.json aktualizován s place_id, google_rating, google_reviews.")


if __name__ == "__main__":
    main()
