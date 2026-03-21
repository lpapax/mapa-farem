"""
fetch_place_details.py
----------------------
Doplní chybějící data pro farmy s place_id:
  - telefon, web (všechny farmy kde chybí)
  - full_address (OSM farmy co mají jen kraj)
  - hours (všechny farmy kde chybí)

Použití:
  GOOGLE_API_KEY=AIzaSy... python fetch_place_details.py
"""

import json
import time
import os
import requests

API_KEY = os.environ.get("GOOGLE_API_KEY", "VLOZ_SEM_SVUJ_API_KLIC")
FARMS_PATH = "frontend/src/data/farms.json"


def get_place_details(place_id):
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "place_id": place_id,
        "fields": "website,formatted_phone_number,formatted_address,opening_hours",
        "key": API_KEY,
        "language": "cs",
    }
    try:
        resp = requests.get(url, params=params, timeout=10)
        data = resp.json()
        if data.get("status") == "OK":
            result = data.get("result", {})
            hours_text = None
            oh = result.get("opening_hours", {})
            if oh.get("weekday_text"):
                hours_text = "; ".join(oh["weekday_text"])
            return {
                "website": result.get("website"),
                "phone": result.get("formatted_phone_number"),
                "formatted_address": result.get("formatted_address"),
                "hours": hours_text,
            }
        elif data.get("status") == "REQUEST_DENIED":
            print(f"  ❌ API chyba: {data.get('error_message')}")
            return None
    except Exception as e:
        print(f"  ⚠️  Chyba: {e}")
    return None


def needs_fetch(farm):
    missing_contact = not farm.get("phone") or not farm.get("website")
    missing_address = not farm.get("full_address")
    missing_hours = not farm.get("hours")
    return farm.get("place_id") and (missing_contact or missing_address or missing_hours)


def main():
    if API_KEY == "VLOZ_SEM_SVUJ_API_KLIC":
        print("❌ Nastav GOOGLE_API_KEY")
        return

    with open(FARMS_PATH, "r", encoding="utf-8") as f:
        farms = json.load(f)

    to_fetch = [f for f in farms if needs_fetch(f)]

    print(f"Celkem farem: {len(farms)}")
    print(f"K doplnění: {len(to_fetch)}\n")

    updated = 0
    for i, farm in enumerate(to_fetch):
        details = get_place_details(farm["place_id"])

        if details:
            changed = False
            if details.get("website") and not farm.get("website"):
                farm["website"] = details["website"]
                changed = True
            if details.get("phone") and not farm.get("phone"):
                farm["phone"] = details["phone"]
                changed = True
            if details.get("formatted_address") and not farm.get("full_address"):
                addr = details["formatted_address"]
                addr = addr.replace(", Česká republika", "").replace(", Czechia", "").strip()
                farm["full_address"] = addr
                changed = True
            if details.get("hours") and not farm.get("hours"):
                farm["hours"] = details["hours"]
                changed = True

            if changed:
                updated += 1
                print(f"[{i+1}/{len(to_fetch)}] ✅ {farm['name'][:40]:<40} {(farm.get('phone') or ''):<18} {(farm.get('full_address') or farm.get('loc',''))[:35]}")
            else:
                print(f"[{i+1}/{len(to_fetch)}] — {farm['name'][:40]:<40} (nic nového)")
        else:
            print(f"[{i+1}/{len(to_fetch)}] ❌ {farm['name'][:40]}")

        time.sleep(0.12)

        if (i + 1) % 100 == 0:
            with open(FARMS_PATH, "w", encoding="utf-8") as f:
                json.dump(farms, f, ensure_ascii=False, indent=2)
            print(f"\n  💾 Průběžně uloženo ({updated} doplněno)\n")

    with open(FARMS_PATH, "w", encoding="utf-8") as f:
        json.dump(farms, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Hotovo! Doplněno: {updated}/{len(to_fetch)} farem")


if __name__ == "__main__":
    main()
