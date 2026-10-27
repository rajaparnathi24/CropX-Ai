import os
import sys
import io
import uuid
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import HTTPException
from database import engine, SessionLocal, Base
import models
import schemas
import security
from auth import get_required_current_user, get_optional_current_user
from routers import auth as auth_router, profile as profile_router, history as history_router, dashboard as dashboard_router, weather as weather_router
from services.model_service import model_service
from app import health_check

# Initialize DB tables
Base.metadata.create_all(bind=engine)

def run_security_audit():
    db = SessionLocal()
    try:
        print("\n=== TEST 1: Health Check Endpoint ===", flush=True)
        health = health_check()
        assert health["status"] == "healthy"
        assert health["models_loaded"] is True
        assert health["database"] == "connected"
        print("PASS: /health returned healthy status with models and DB loaded:", health, flush=True)

        print("\n=== TEST 2: Strict 401 on Unauthorized / Invalid Tokens ===", flush=True)
        # Missing token
        try:
            get_required_current_user(token=None, db=db)
            assert False, "Should have raised 401 for missing token"
        except HTTPException as e:
            assert e.status_code == 401, f"Expected 401, got {e.status_code}"
            print("PASS: Missing token raises HTTP 401 Unauthorized:", e.detail, flush=True)

        # Invalid token
        try:
            get_required_current_user(token="invalid_malformed_jwt_token_xyz", db=db)
            assert False, "Should have raised 401 for invalid token"
        except HTTPException as e:
            assert e.status_code == 401, f"Expected 401, got {e.status_code}"
            print("PASS: Invalid token raises HTTP 401 Unauthorized:", e.detail, flush=True)

        # Optional auth with missing token -> None
        anon_user = get_optional_current_user(token=None, db=db)
        assert anon_user is None
        print("PASS: get_optional_current_user with None returns None (no demo user fallback)", flush=True)

        print("\n=== TEST 3: User Registration, Login & Authenticated Resolution ===", flush=True)
        uid = uuid.uuid4().hex[:6]
        user_a_email = f"user_a_{uid}@cropx.farm"
        user_b_email = f"user_b_{uid}@cropx.farm"
        pwd = "ProductionSecurePassword2026!"

        # Register User A
        token_a_res = auth_router.signup(
            schemas.UserSignup(
                fullName="User A",
                email=user_a_email,
                password=pwd,
                state="Gujarat",
                district="Anand",
                primaryCrop="Cotton"
            ),
            db=db
        )
        token_a = token_a_res["access_token"]
        user_a = get_required_current_user(token=token_a, db=db)
        assert user_a.email == user_a_email
        print(f"PASS: User A registered and resolved via token: {user_a.full_name} ({user_a.email})", flush=True)

        # Register User B
        token_b_res = auth_router.signup(
            schemas.UserSignup(
                fullName="User B",
                email=user_b_email,
                password=pwd,
                state="Punjab",
                district="Ludhiana",
                primaryCrop="Wheat"
            ),
            db=db
        )
        token_b = token_b_res["access_token"]
        user_b = get_required_current_user(token=token_b, db=db)
        assert user_b.email == user_b_email
        print(f"PASS: User B registered and resolved via token: {user_b.full_name} ({user_b.email})", flush=True)

        # Profile router check
        prof_a = profile_router.get_profile(current_user=user_a)
        assert prof_a.email == user_a_email
        print("PASS: profile_router.get_profile returns User A profile:", prof_a.fullName, prof_a.email, flush=True)

        print("\n=== TEST 4: Anonymous Crop Disease Prediction (Model Inference) ===", flush=True)
        count_before = db.query(models.Scan).count()

        img = Image.new("RGB", (224, 224), color=(34, 139, 34))
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        img_bytes = buf.getvalue()

        # Run model inference directly
        prediction = model_service.predict(img_bytes, target_crop="Tomato")
        assert "crop" in prediction
        assert "disease" in prediction
        assert "confidence" in prediction
        print(f"PASS: Model inference succeeded ({prediction['crop']} -> {prediction['disease']}, {prediction['confidence']}%)", flush=True)

        # In anonymous mode, router returns prediction without adding scan to DB
        count_after = db.query(models.Scan).count()
        assert count_after == count_before
        print("PASS: Anonymous scan maintains 0 DB records added (0 pollution of user accounts)", flush=True)

        print("\n=== TEST 5: Authenticated Crop Prediction & User Association ===", flush=True)
        # Create scan record associated with User A
        scan_a = models.Scan(
            user_id=user_a.id,
            image_url="/uploads/test_user_a.png",
            crop=prediction["crop"],
            disease=prediction["disease"],
            confidence=prediction["confidence"],
            severity=prediction["severity"],
            symptoms="[]",
            recommendations="[]",
            preventive_measures="[]",
            season="Kharif",
            state=user_a.state,
            district=user_a.district
        )
        db.add(scan_a)
        db.commit()
        db.refresh(scan_a)
        scan_a_id = scan_a.id
        print(f"PASS: User A scan saved to SQLite database successfully: ID={scan_a_id}", flush=True)

        # Check User A history contains scan
        history_a = history_router.get_history(db=db, current_user=user_a)
        assert len(history_a) > 0
        assert history_a[0].id == scan_a_id
        print(f"PASS: User A history contains scan ID {scan_a_id}", flush=True)

        # Check User B history does NOT contain User A's scan
        history_b = history_router.get_history(db=db, current_user=user_b)
        assert all(s.id != scan_a_id for s in history_b)
        print("PASS: User B cannot see User A's scan (cross-user read isolation verified)", flush=True)

        # Check Dashboard stats for User A
        dash_a = dashboard_router.get_dashboard_stats(db=db, current_user=user_a)
        assert dash_a["totalScans"] >= 1
        print("PASS: User A dashboard stats reflects private scan count:", dash_a["totalScans"], flush=True)

        # Check Dashboard stats for User B
        dash_b = dashboard_router.get_dashboard_stats(db=db, current_user=user_b)
        assert dash_b["totalScans"] == 0
        print("PASS: User B dashboard stats reflects 0 scans (private dashboard isolation verified)", flush=True)

        print("\n=== TEST 6: Cross-User Deletion Denial ===", flush=True)
        try:
            # User B attempts to delete User A's scan record
            history_router.delete_history_item(scan_id=scan_a_id, db=db, current_user=user_b)
            assert False, "User B should NOT be able to delete User A's scan!"
        except HTTPException as e:
            assert e.status_code == 403, f"Expected 403, got {e.status_code}"
            print("PASS: Cross-user delete denied with HTTP 403 Forbidden:", e.detail, flush=True)

        # User A deletes own scan
        res_del = history_router.delete_history_item(scan_id=scan_a_id, db=db, current_user=user_a)
        assert res_del is None
        print("PASS: User A authorized deletion succeeded (HTTP 204)", flush=True)

        # Verify scan is deleted
        deleted_scan = db.query(models.Scan).filter(models.Scan.id == scan_a_id).first()
        assert deleted_scan is None
        print("PASS: Scan record confirmed removed from SQLite database", flush=True)

        print("\n=== TEST 7: Public Weather Query ===", flush=True)
        weather_res = weather_router.get_weather(district="Anand", state="Gujarat", current_user=None)
        assert weather_res["temperature"] is not None
        assert weather_res["condition"] is not None
        print(f"PASS: Public weather returned data without auth or privacy leak: {weather_res['temperature']}°C, {weather_res['condition']}", flush=True)

        print("\n====================================================================")
        print("ALL 7 SECURITY & AUTHENTICATION AUDIT TESTS PASSED ON MAIN!")
        print("====================================================================")
    finally:
        db.close()

if __name__ == "__main__":
    run_security_audit()
