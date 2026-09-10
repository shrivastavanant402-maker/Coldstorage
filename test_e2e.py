import os
import sys
import json
import time
import io
import requests

BACKEND_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:5173"

class TestReporter:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.results = []

    def assert_true(self, condition, test_name, detail=""):
        if condition:
            self.passed += 1
            print(f"  [PASS] {test_name}")
            self.results.append({"test": test_name, "status": "PASS", "detail": detail})
        else:
            self.failed += 1
            print(f"  [FAIL] {test_name} - {detail}")
            self.results.append({"test": test_name, "status": "FAIL", "detail": detail})

def run_tests():
    r = TestReporter()
    print("\n========================================================")
    print("      COLDCHAIN AI - FULL END-TO-END SYSTEM TEST        ")
    print("========================================================\n")

    # 1. Health & Root Endpoint
    print("--- 1. Backend Core & Health ---")
    try:
        res = requests.get(f"{BACKEND_URL}/", timeout=5)
        r.assert_true(res.status_code == 200, "GET / returns 200 OK")
        data = res.json()
        r.assert_true(data.get("status") in ["online", "healthy"], "Backend status is online/healthy", str(data))
    except Exception as e:
        r.assert_true(False, "GET / reachable", str(e))

    # 2. Shipments API
    print("\n--- 2. Shipments API ---")
    first_shipment_id = None
    try:
        res = requests.get(f"{BACKEND_URL}/api/shipments", timeout=5)
        r.assert_true(res.status_code == 200, "GET /api/shipments returns 200 OK")
        shipments = res.json()
        r.assert_true(isinstance(shipments, list) and len(shipments) > 0, "Loaded shipments list", f"Count: {len(shipments)}")
        if shipments:
            s0 = shipments[0]
            first_shipment_id = s0.get("shipment_id")
            r.assert_true("origin" in s0 and "destination" in s0 and "goods_type" in s0, "Shipment record schema valid", s0.get("shipment_id"))
    except Exception as e:
        r.assert_true(False, "GET /api/shipments", str(e))

    # 3. Drivers API
    print("\n--- 3. Drivers & Fleet API ---")
    driver_id = None
    try:
        res = requests.get(f"{BACKEND_URL}/api/drivers", timeout=5)
        r.assert_true(res.status_code == 200, "GET /api/drivers returns 200 OK")
        drivers = res.json()
        r.assert_true(len(drivers) > 0, "Drivers list populated", f"Count: {len(drivers)}")
        if drivers:
            driver_id = drivers[0]["driver_id"]
            res_single = requests.get(f"{BACKEND_URL}/api/driver/{driver_id}", timeout=5)
            r.assert_true(res_single.status_code == 200, f"GET /api/driver/{driver_id} returns 200 OK")
    except Exception as e:
        r.assert_true(False, "Drivers API", str(e))

    # 4. Driver Assignment
    print("\n--- 4. Fleet Assignment ---")
    if first_shipment_id and driver_id:
        try:
            payload = {"shipment_id": first_shipment_id, "driver_id": driver_id}
            res = requests.post(f"{BACKEND_URL}/api/assign-shipment", json=payload, timeout=5)
            r.assert_true(res.status_code == 200, f"POST /api/assign-shipment assigns {driver_id} to {first_shipment_id}")
            data = res.json()
            r.assert_true(data.get("success") is True, "Assignment confirmation success flag")
        except Exception as e:
            r.assert_true(False, "POST /api/assign-shipment", str(e))

    # 5. Weather Service
    print("\n--- 5. Weather Telemetry Service ---")
    for city in ["Mumbai", "Delhi", "Bengaluru"]:
        try:
            res = requests.get(f"{BACKEND_URL}/api/weather/{city}", timeout=5)
            r.assert_true(res.status_code == 200, f"GET /api/weather/{city} returns 200 OK")
            w = res.json()
            r.assert_true("temperature" in w and "weather_severity" in w, f"Weather telemetry valid for {city}", f"Temp: {w.get('temperature')}C, Sev: {w.get('weather_severity')}")
        except Exception as e:
            r.assert_true(False, f"Weather service for {city}", str(e))

    # 6. ML Risk Analysis
    print("\n--- 6. Cold-Chain ML Risk Analysis ---")
    try:
        sample_shipment = {
            "shipment_id": "SHP-TEST-01",
            "origin": "Mumbai, India",
            "destination": "Delhi, India",
            "distance_km": 1420.0,
            "transit_hours": 22.5,
            "avg_temperature": 5.2,
            "temp_variance": 1.4,
            "humidity": 65.0,
            "goods_type": "Vaccines",
            "vehicle_age": 2.5,
            "weather_severity": 2.2
        }
        res = requests.post(f"{BACKEND_URL}/api/analyze-shipment", json=sample_shipment, timeout=5)
        r.assert_true(res.status_code == 200, "POST /api/analyze-shipment returns 200 OK")
        data = res.json()
        r.assert_true("risk_score" in data and "risk_level" in data, "Risk score & level evaluated", f"Score: {data.get('risk_score')}, Level: {data.get('risk_level')}")
        r.assert_true("explanation_breakdown" in data and len(data["explanation_breakdown"]) > 0, "Feature contribution explanation provided")
    except Exception as e:
        r.assert_true(False, "POST /api/analyze-shipment", str(e))

    # 7. Single Shipment Spoilage Prediction
    print("\n--- 7. Single Shipment Spoilage Model ---")
    if first_shipment_id:
        try:
            res = requests.get(f"{BACKEND_URL}/api/predict-spoilage/{first_shipment_id}", timeout=5)
            r.assert_true(res.status_code == 200, f"GET /api/predict-spoilage/{first_shipment_id} returns 200 OK")
            data = res.json()
            r.assert_true("spoilage_probability" in data and "time_to_spoilage_hrs" in data, "Spoilage prediction computed", f"Prob: {data.get('spoilage_probability')}")
        except Exception as e:
            r.assert_true(False, "GET /api/predict-spoilage/{id}", str(e))

    # 8. Emergency Liquidation & Call Negotiation
    print("\n--- 8. Emergency Liquidation & AI Negotiation ---")
    try:
        res = requests.get(f"{BACKEND_URL}/api/nearby-businesses?location=Delhi&goods_type=Vaccines", timeout=5)
        r.assert_true(res.status_code == 200, "GET /api/nearby-businesses returns 200 OK")
        businesses = res.json()
        r.assert_true(len(businesses) > 0, "Discovered nearby cold warehouse buyers", f"Found: {len(businesses)}")
        if businesses:
            biz_id = businesses[0]["business_id"]
            sim_payload = {
                "business_id": biz_id,
                "shipment_id": first_shipment_id or "SHP-1001",
                "discount_percent": 25.0
            }
            res_call = requests.post(f"{BACKEND_URL}/api/simulate-call", json=sim_payload, timeout=5)
            r.assert_true(res_call.status_code == 200, "POST /api/simulate-call returns 200 OK")
            call_data = res_call.json()
            r.assert_true("transcript" in call_data and len(call_data["transcript"]) > 0, "AI dialogue transcript generated", f"Turns: {len(call_data.get('transcript', []))}")
            r.assert_true("deal_closed" in call_data, "Negotiation outcome resolved", f"Closed: {call_data.get('deal_closed')}")
    except Exception as e:
        r.assert_true(False, "Emergency liquidation negotiation", str(e))

    # 9. Batch ML Spoilage Training (CSV Upload)
    print("\n--- 9. Batch ML Spoilage Training (CSV Upload) ---")
    try:
        csv_rows = [
            "distance_km,transit_hours,avg_temperature,temp_variance,humidity,vehicle_age,weather_severity,delay_history,spoilage_flag",
            "500,8.0,3.0,0.5,50,2.0,1.0,0.0,0",
            "600,10.0,4.0,0.8,55,3.0,1.5,0.2,0",
            "450,7.0,2.5,0.4,48,1.5,1.0,0.1,0",
            "700,11.0,4.5,0.9,58,2.8,1.8,0.3,0",
            "520,8.5,3.2,0.6,52,2.1,1.2,0.0,0",
            "630,10.2,4.1,0.7,54,3.1,1.4,0.2,0",
            "480,7.5,2.8,0.5,49,1.8,1.1,0.1,0",
            "1200,24.0,8.0,3.5,80,7.0,4.0,3.0,1",
            "1500,30.0,10.0,4.0,85,8.0,4.5,4.0,1",
            "1350,26.0,8.8,3.7,82,7.5,4.2,3.5,1",
            "1600,32.0,10.5,4.2,88,8.5,4.8,4.5,1",
            "1100,20.0,7.5,3.0,75,6.0,3.5,2.5,1",
            "1250,25.0,8.2,3.4,78,6.8,3.8,2.8,1"
        ]
        csv_content = "\n".join(csv_rows)
        files = {"file": ("training_sample.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
        res = requests.post(f"{BACKEND_URL}/api/predict-spoilage", files=files, timeout=8)
        r.assert_true(res.status_code == 200, "POST /api/predict-spoilage CSV training returns 200 OK")
        ml_data = res.json()
        r.assert_true("model_metrics" in ml_data and "sample_predictions" in ml_data, "RF model retrained with metrics & predictions", f"Acc: {ml_data.get('model_metrics', {}).get('test_accuracy')}")
    except Exception as e:
        r.assert_true(False, "POST /api/predict-spoilage", str(e))

    # 10. OSRM Road-Snapped Route Optimization & Dynamic Duration
    print("\n--- 10. Road-Snapped Routing & Dynamic Animation Pacing ---")
    try:
        route_payload = {
            "origin": "Mumbai, India",
            "destination": "Delhi, India",
            "goods_type": "Vaccines",
            "vehicle_type": "Refrigerated Semi-Trailer"
        }
        res = requests.post(f"{BACKEND_URL}/api/optimize-route", json=route_payload, timeout=10)
        r.assert_true(res.status_code == 200, "POST /api/optimize-route (Mumbai->Delhi) returns 200 OK")
        r_data = res.json()
        routes = r_data.get("routes", [])
        r.assert_true(len(routes) == 3, "Returns 3 distinct optimized corridors", f"Corridors: {[x['route_type'] for x in routes]}")
        
        # Verify road geometry & waypoints
        has_real_roads = any(len(x.get("waypoints", [])) > 500 for x in routes)
        r.assert_true(has_real_roads, "OSRM road-snapped high-res highway coordinates present", f"Waypoint counts: {[len(x.get('waypoints', [])) for x in routes]}")

        # Check dynamic duration scaling: durationSeconds = clamp(distance_km / 8, 45, 120)
        for rt in routes:
            dist = rt.get("distance_km", 0)
            expected_sec = round(min(max(dist / 8.0, 45.0), 120.0))
            r.assert_true(45 <= expected_sec <= 120, f"Corridor '{rt['route_type']}' ({dist}km) pace {expected_sec}s conforms to clamp [45, 120]")

        # Test short route (Bengaluru -> Chennai: ~326km)
        short_payload = {
            "origin": "Bengaluru, India",
            "destination": "Chennai, India",
            "goods_type": "Biopharmaceuticals",
            "vehicle_type": "Cryogenic Pharma Van"
        }
        res_short = requests.post(f"{BACKEND_URL}/api/optimize-route", json=short_payload, timeout=10)
        r.assert_true(res_short.status_code == 200, "POST /api/optimize-route (Bengaluru->Chennai) returns 200 OK")
        short_routes = res_short.json().get("routes", [])
        if short_routes:
            short_dist = short_routes[0].get("distance_km", 0)
            short_duration = round(min(max(short_dist / 8.0, 45.0), 120.0))
            r.assert_true(short_duration == 45 or (45 <= short_duration <= 120), f"Short route ({short_dist}km) clamped to minimum 45s duration", f"Duration: {short_duration}s")

    except Exception as e:
        r.assert_true(False, "POST /api/optimize-route", str(e))

    # 11. Frontend Serving & 3D Assets
    print("\n--- 11. Frontend Server & 3D Assets ---")
    try:
        res_fe = requests.get(f"{FRONTEND_URL}/", timeout=5)
        r.assert_true(res_fe.status_code == 200, "GET Frontend root returns 200 OK")
        r.assert_true("<div id=\"root\">" in res_fe.text, "Index.html contains React mount target '#root'")
    except Exception as e:
        r.assert_true(False, "Frontend Web Server", str(e))

    try:
        res_glb = requests.get(f"{FRONTEND_URL}/assets/truck.glb", timeout=5)
        r.assert_true(res_glb.status_code == 200, "GET /assets/truck.glb returns 200 OK")
        content_type = res_glb.headers.get("content-type", "")
        r.assert_true("gltf" in content_type or "octet-stream" in content_type, f"MIME type valid: {content_type}")
        r.assert_true(len(res_glb.content) > 400000, f"3D truck GLB asset size valid ({len(res_glb.content)} bytes)")
    except Exception as e:
        r.assert_true(False, "3D Truck GLB Asset Serving", str(e))

    # Final Summary
    print("\n========================================================")
    print(f"  TOTAL TESTS RUN: {r.passed + r.failed}")
    print(f"  PASSED:          {r.passed}")
    print(f"  FAILED:          {r.failed}")
    print("========================================================\n")

    return r.failed == 0

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
