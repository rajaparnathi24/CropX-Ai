import os
import sys
from fastapi.testclient import TestClient
from app import app
from database import engine, Base

print("Initializing test database tables...")
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def test_full_flow():
    print("\n--- 1. Testing Root Status ---")
    res = client.get("/")
    assert res.status_code == 200
    print("Root Status OK:", res.json())

    print("\n--- 2. Testing Signup ---")
    signup_data = {
        "fullName": "Aarav Patel",
        "email": "aarav.patel@cropx.farm",
        "password": "CropXSecretPassword2026",
        "state": "Gujarat",
        "district": "Anand",
        "primaryCrop": "Tomato"
    }
    res = client.post("/signup", json=signup_data)
    if res.status_code == 400:
        print("User already exists, logging in instead.")
    else:
        assert res.status_code == 201
        print("Signup OK. Token received:", res.json()["access_token"][:20] + "...")

    print("\n--- 3. Testing Login ---")
    login_data = {
        "email": "aarav.patel@cropx.farm",
        "password": "CropXSecretPassword2026"
    }
    res = client.post("/login", json=login_data)
    assert res.status_code == 200
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login OK. Token:", token[:25] + "...")

    print("\n--- 4. Testing Profile ---")
    res = client.get("/profile", headers=headers)
    assert res.status_code == 200
    profile = res.json()
    print("Profile OK:", profile["fullName"], profile["district"], profile["state"])

    print("\n--- 5. Testing Prediction (Multipart Image Upload) ---")
    from PIL import Image
    import io
    img = Image.new('RGB', (224, 224), color='green')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    leaf_bytes = img_byte_arr.getvalue()

    files = {"image": ("leaf_test.png", leaf_bytes, "image/png")}
    data = {
        "crop": "Tomato",
        "season": "Kharif",
        "state": "Gujarat",
        "district": "Anand"
    }
    res = client.post("/predict", headers=headers, files=files, data=data)
    assert res.status_code == 200
    prediction = res.json()
    print("Prediction OK:", prediction["crop"], "->", prediction["disease"], f"({prediction['confidence']}%)")

    print("\n--- 6. Testing Scan History ---")
    res = client.get("/history", headers=headers)
    assert res.status_code == 200
    history = res.json()
    assert len(history) > 0
    scan_id = history[0]["id"]
    print(f"Scan History OK: Found {len(history)} records. Latest ID: {scan_id}")

    print("\n--- 7. Testing Dashboard Stats ---")
    res = client.get("/dashboard", headers=headers)
    assert res.status_code == 200
    stats = res.json()
    print("Dashboard Stats OK:", stats)

    print("\n--- 8. Testing Weather Service ---")
    res = client.get("/weather?district=Anand&state=Gujarat", headers=headers)
    assert res.status_code == 200
    weather = res.json()
    print("Weather OK:", weather["temperature"], "°C", weather["condition"])

    print("\n--- 9. Testing Delete History ---")
    res = client.delete(f"/history/{scan_id}", headers=headers)
    assert res.status_code == 204
    print("Delete History OK.")

    print("\n==========================================")
    print("ALL 9 FASTAPI BACKEND ENDPOINTS TESTED & PASSED VERIFICATION!")
    print("==========================================")

if __name__ == "__main__":
    test_full_flow()
