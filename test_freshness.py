import requests
import io
import sys

BACKEND_URL = "http://localhost:8000"

def test_freshness_endpoints():
    print("\n--- Testing AI Freshness Check Endpoints ---")
    
    # 1. Fetch shipments to find a shipment ID
    res = requests.get(f"{BACKEND_URL}/api/shipments?limit=10")
    assert res.status_code == 200, "GET /api/shipments failed"
    shipments = res.json()
    assert len(shipments) > 0, "No shipments returned"
    
    target_shp = shipments[0]["shipment_id"]
    print(f"Target shipment for freshness check: {target_shp}")

    # 2. Create sample test image bytes (a small valid 1x1 JPEG)
    # Minimal valid 1x1 white JPEG
    sample_jpeg = (
        b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06'
        b'\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a'
        b'\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01'
        b'\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00'
        b'\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x08\x01\x01\x00\x00'
        b'?\x00\xbf\x00\xff\xd9'
    )
    
    # 3. Post to /api/shipments/{id}/freshness-check
    files = {"file": ("produce_test.jpg", io.BytesIO(sample_jpeg), "image/jpeg")}
    res_fc = requests.post(f"{BACKEND_URL}/api/shipments/{target_shp}/freshness-check", files=files, timeout=15)
    assert res_fc.status_code == 200, f"POST freshness check returned {res_fc.status_code}: {res_fc.text}"
    data = res_fc.json()
    print("Freshness Check Response:", data)
    assert "freshness_status" in data, "Missing freshness_status"
    assert "freshness_summary" in data, "Missing freshness_summary"
    assert "freshness_image_url" in data, "Missing freshness_image_url"
    assert data["freshness_image_url"].startswith("data:image/jpeg;base64,"), "Invalid image data URI"

    # 4. Verify shipment record updated
    res_list = requests.get(f"{BACKEND_URL}/api/shipments?limit=10")
    updated_shp = next((s for s in res_list.json() if s["shipment_id"] == target_shp), None)
    assert updated_shp is not None, "Shipment not found in list"
    assert updated_shp.get("freshness_status") == data["freshness_status"], "Shipment record freshness_status not updated"
    assert updated_shp.get("freshness_summary") == data["freshness_summary"], "Shipment record freshness_summary not updated"
    print(f"  [PASS] Shipment {target_shp} successfully updated with freshness check results.")

    # 5. Direct ad-hoc analysis
    files_direct = {"file": ("produce_adhoc.jpg", io.BytesIO(sample_jpeg), "image/jpeg")}
    res_adhoc = requests.post(f"{BACKEND_URL}/api/analyze-freshness", files=files_direct, timeout=15)
    assert res_adhoc.status_code == 200, f"POST /api/analyze-freshness returned {res_adhoc.status_code}"
    print("  [PASS] Direct ad-hoc analysis endpoint functioning.")

    print("\n[SUCCESS] AI Freshness Inspection Backend Integration Verified!")

if __name__ == "__main__":
    try:
        test_freshness_endpoints()
    except Exception as e:
        print(f"[FAIL] {e}")
        sys.exit(1)
