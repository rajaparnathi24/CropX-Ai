import os
import uuid
import json
import datetime
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_optional_current_user
from services.model_service import model_service
from services.weather_service import get_indian_season
from preprocess import validate_image_file, MAX_FILE_SIZE
from config import settings
from typing import Optional

router = APIRouter(tags=["AI Prediction"])

@router.post("/predict", response_model=schemas.PredictResponse)
@router.post("/api/v1/predict", response_model=schemas.PredictResponse)
async def predict(
    image: UploadFile = File(...),
    crop: Optional[str] = Form(None),
    season: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    district: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_current_user)
):
    """
    Accept uploaded crop leaf image, run MobileNetV3 inference, auto-tag Indian season.
    If caller is authenticated, persist prediction record to SQLite scan history.
    If caller is anonymous, return diagnosis directly without saving to or exposing private user records.
    """
    file_bytes = await image.read()
    validate_image_file(file_bytes, image.filename)

    # Calculate Indian season if not provided
    now = datetime.datetime.now(datetime.timezone.utc)
    calculated_season = season or get_indian_season(now)

    # Predict disease
    prediction = model_service.predict(file_bytes, target_crop=crop)
    prediction["season"] = calculated_season

    # Save uploaded image file to server uploads directory
    ext = image.filename.split(".")[-1].lower() if "." in image.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(settings.UPLOADS_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(file_bytes)

    image_url = f"/uploads/{filename}"

    # Only persist to Scan history if user is authenticated
    if current_user is not None:
        scan_record = models.Scan(
            user_id=current_user.id,
            image_url=image_url,
            crop=prediction["crop"],
            disease=prediction["disease"],
            confidence=prediction["confidence"],
            severity=prediction["severity"],
            symptoms=json.dumps(prediction["symptoms"]),
            recommendations=json.dumps(prediction["recommendations"]),
            preventive_measures=json.dumps(prediction["preventiveMeasures"]),
            season=calculated_season,
            state=state or current_user.state or "Gujarat",
            district=district or current_user.district or "Junagadh",
            date=now
        )
        db.add(scan_record)
        db.commit()
        db.refresh(scan_record)

    return prediction
