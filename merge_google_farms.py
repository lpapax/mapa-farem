"""
merge_google_farms.py
---------------------
Přidá farmy z google_farms_new.json do farms.json.
Spusť až po kontrole google_farms_new.json!

Použití:
  python merge_google_farms.py
  python merge_google_farms.py --min-reviews 5    # jen farmy s 5+ recenzemi
  python merge_google_farms.py --min-rating 4.0   # jen farmy s ratingem 4.0+
"""

import json
import sys

FARMS_PATH = "frontend/src/data/farms.json"
NEW_PATH = "google_farms_new.json"

def main():
    min_reviews = 0
    min_rating = 0.0

    for i, arg in enumerate(sys.argv[1:]):
        if arg == "--min-reviews" and i + 1 < len(sys.argv) - 1:
            min_reviews = int(sys.argv[i + 2])
        if arg == "--min-rating" and i + 1 < len(sys.argv) - 1:
            min_rating = float(sys.argv[i + 2])

    with open(FARMS_PATH, "r", encoding="utf-8") as f:
        farms = json.load(f)

    with open(NEW_PATH, "r", encoding="utf-8") as f:
        new_farms = json.load(f)

    print(f"Existující farmy: {len(farms)}")
    print(f"Nové farmy k přidání: {len(new_farms)}")

    if min_reviews > 0:
        new_farms = [f for f in new_farms if (f.get("google_reviews") or 0) >= min_reviews]
        print(f"Po filtraci (min {min_reviews} recenzí): {len(new_farms)}")

    if min_rating > 0:
        new_farms = [f for f in new_farms if (f.get("google_rating") or 0) >= min_rating]
        print(f"Po filtraci (min rating {min_rating}): {len(new_farms)}")

    farms.extend(new_farms)

    with open(FARMS_PATH, "w", encoding="utf-8") as f:
        json.dump(farms, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Hotovo! Celkem farem: {len(farms)}")
    print(f"   Přidáno: {len(new_farms)} nových farem")


if __name__ == "__main__":
    main()
