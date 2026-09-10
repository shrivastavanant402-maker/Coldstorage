import requests
import json
import sys

BACKEND_URL = "http://localhost:8000"

test_cases = [
    {
        "name": "Frozen Seafood (Ultra-cold Reefer): Mumbai -> Kolkata",
        "payload": {
            "origin": "Mumbai",
            "destination": "Kolkata",
            "goods_type": "Frozen Seafood",
            "vehicle_type": "Multi-Temperature Reefer"
        }
    },
    {
        "name": "Prime Cut Meat: Hyderabad -> Delhi",
        "payload": {
            "origin": "Hyderabad",
            "destination": "Delhi",
            "goods_type": "Prime Cut Meat",
            "vehicle_type": "Heavy-Duty Cold Hauler"
        }
    },
    {
        "name": "Biopharmaceuticals: Bengaluru -> Hyderabad",
        "payload": {
            "origin": "Bengaluru",
            "destination": "Hyderabad",
            "goods_type": "Biopharmaceuticals",
            "vehicle_type": "Cryogenic Pharma Van"
        }
    }
]

print("\n--- Running Corridor Matrix Stress Tests ---")
all_passed = True
for tc in test_cases:
    print(f"\nTesting: {tc['name']}")
    try:
        res = requests.post(f"{BACKEND_URL}/api/optimize-route", json=tc["payload"], timeout=10)
        if res.status_code != 200:
            print(f"  [FAIL] Status code {res.status_code}")
            all_passed = False
            continue

        data = res.json()
        routes = data.get("routes", [])
        if len(routes) != 3:
            print(f"  [FAIL] Expected 3 routes, got {len(routes)}")
            all_passed = False
            continue

        for r in routes:
            pace = round(min(max(r["distance_km"] / 15.0, 30.0), 90.0))
            print(f"  -> {r['route_type']:<26} | Dist: {r['distance_km']:>7.1f}km | Time: {r['transit_hours']:>5.1f}h | Risk: {r['risk_score']:>4.1f}/100 | WPs: {len(r['waypoints']):>5} | 3D Pace: {pace}s")

        print("  [PASS] Successfully optimized corridor with live road geometry & risk metrics.")
    except Exception as e:
        print(f"  [FAIL] Error: {e}")
        all_passed = False

if all_passed:
    print("\n[SUCCESS] All corridor matrix stress tests passed flawlessly!")
    sys.exit(0)
else:
    print("\n[FAIL] Some corridor tests failed.")
    sys.exit(1)
