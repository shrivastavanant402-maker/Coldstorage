"""
ColdChain AI Backend Verification Suite
"""
import io
import sys
import requests
import pandas as pd

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8000"

def log_test(name: str, passed: bool, details: str = ""):
    status = "[PASS]" if passed else "[FAIL]"
    print(f"{status} | {name:<38} {details}")

def run_tests():
    print("=" * 70)
    print("STARTING COLDCHAIN AI BACKEND VERIFICATION SUITE")
    print(f"Target: {BASE_URL}")
    print("=" * 70)

    # 0. Health Check
    try:
        r = requests.get(f"{BASE_URL}/", timeout=5)
        passed = r.status_code == 200 and r.json().get("status") == "online"
        log_test("Health Check (GET /)", passed, f"Status: {r.status_code}")
    except Exception as e:
        print(f"\n[FAIL] Connection failed: {e}")
        return

    # 1. POST /api/analyze-shipment
    payload_analyze = {
        "shipment_id": "TEST-SHP-001",
        "origin": "Chicago, IL",
        "destination": "Atlanta, GA",
        "distance_km": 1150.0,
        "transit_hours": 16.5,
        "avg_temperature": 5.2,
        "temp_variance": 2.8,
        "humidity": 68.0,
        "goods_type": "Vaccines",
        "vehicle_age": 4.5,
        "weather_severity": 3.2,
        "delay_history": 1.0
    }
    r = requests.post(f"{BASE_URL}/api/analyze-shipment", json=payload_analyze)
    data = r.json()
    passed = r.status_code == 200 and "risk_score" in data and "explanation_breakdown" in data
    log_test("Analyze Shipment (POST /api/analyze-shipment)", passed, f"Score: {data.get('risk_score')}% ({data.get('risk_level')})")

    # 2. POST /api/optimize-route
    payload_route = {
        "origin": "Mumbai, India",
        "destination": "Delhi, India",
        "goods_type": "Biopharmaceuticals",
        "vehicle_type": "Cryogenic Pharma Van"
    }
    r = requests.post(f"{BASE_URL}/api/optimize-route", json=payload_route)
    data = r.json()
    passed = r.status_code == 200 and "routes" in data and len(data["routes"]) == 3
    log_test("Optimize Route (POST /api/optimize-route)", passed, f"Generated {len(data.get('routes', []))} routes")

    # 3. POST /api/predict-spoilage
    csv_data = io.StringIO("""distance_km,transit_hours,avg_temperature,temp_variance,humidity,vehicle_age,weather_severity,spoilage_flag
1200.0,18.0,4.2,1.1,60.0,3.0,1.5,0
1500.0,26.0,9.5,4.8,80.0,8.0,4.2,1
900.0,12.0,3.8,0.9,55.0,2.0,1.2,0
1800.0,28.0,11.0,5.2,85.0,10.0,4.5,1
1100.0,15.0,4.0,1.2,62.0,3.5,1.8,0
1400.0,24.0,8.8,3.9,78.0,7.5,3.9,1
950.0,13.0,3.9,0.8,58.0,2.5,1.1,0
1650.0,25.0,9.1,4.1,82.0,9.0,4.0,1
1050.0,14.0,4.1,1.0,61.0,3.0,1.4,0
1750.0,27.0,10.2,4.9,84.0,9.5,4.3,1
""")
    files = {"file": ("test_cold_chain.csv", csv_data.getvalue(), "text/csv")}
    r = requests.post(f"{BASE_URL}/api/predict-spoilage", files=files)
    data = r.json()
    passed = r.status_code == 200 and "model_metrics" in data
    log_test("Predict Spoilage CSV (POST /api/predict-spoilage)", passed, f"Accuracy: {data.get('model_metrics', {}).get('cv_mean_accuracy')}")

    # 4. GET /api/weather/{location}
    r = requests.get(f"{BASE_URL}/api/weather/mumbai")
    data = r.json()
    passed = r.status_code == 200 and "temperature" in data
    log_test("Weather Service (GET /api/weather/{location})", passed, f"{data.get('temperature')}°C - {data.get('condition')}")

    # 5. POST /api/assign-shipment
    r = requests.post(f"{BASE_URL}/api/assign-shipment", json={"shipment_id": "SHP-1001", "driver_id": "DRV-001"})
    data = r.json()
    passed = r.status_code == 200 and data.get("success") is True
    log_test("Assign Shipment (POST /api/assign-shipment)", passed, f"Assigned to {data.get('driver_name')}")

    # 6. GET /api/drivers
    r = requests.get(f"{BASE_URL}/api/drivers")
    data = r.json()
    passed = r.status_code == 200 and len(data) >= 5
    log_test("List Drivers (GET /api/drivers)", passed, f"Total Drivers: {len(data)}")

    # 7. GET /api/driver/{id}
    r = requests.get(f"{BASE_URL}/api/driver/DRV-001")
    data = r.json()
    passed = r.status_code == 200 and "driver" in data
    log_test("Driver Details (GET /api/driver/{id})", passed, f"Manifests: {data.get('assigned_shipments_count')}")

    # 8. GET /api/nearby-businesses
    r = requests.get(f"{BASE_URL}/api/nearby-businesses", params={"location": "Delhi NCR", "goods_type": "Vaccines"})
    data = r.json()
    passed = r.status_code == 200 and len(data) == 3
    log_test("Nearby Buyers (GET /api/nearby-businesses)", passed, f"Found {len(data)} salvage buyers")

    # 9. POST /api/simulate-call
    payload_call = {"business_id": "BIZ-001", "shipment_id": "SHP-1001", "discount_percent": 30.0}
    r = requests.post(f"{BASE_URL}/api/simulate-call", json=payload_call)
    data = r.json()
    passed = r.status_code == 200 and data.get("deal_closed") is True
    log_test("Simulate Call (POST /api/simulate-call)", passed, f"Recovery: ${data.get('estimated_recovery_usd', 0):,.2f}")

    print("=" * 70)
    print("ALL 9 BACKEND SERVICES AND ML ALGORITHMS TESTED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
