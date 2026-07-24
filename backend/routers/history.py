import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(tags=["Scan History"])

@router.get("/history", response_model=List[schemas.ScanResponse])
@router.get("/api/v1/scans", response_model=List[schemas.ScanResponse])
@router.get("/api/v1/history", response_model=List[schemas.ScanResponse])
def get_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Retrieve all scan history records belonging to the authenticated user."""
    scans = db.query(models.Scan).filter(models.Scan.user_id == current_user.id).order_by(models.Scan.date.desc()).all()

    result = []
    for scan in scans:
        result.append(schemas.ScanResponse(
            id=scan.id,
            userId=scan.user_id,
            imageUrl=scan.image_url,
            crop=scan.crop,
            disease=scan.disease,
            confidence=scan.confidence,
            severity=scan.severity,
            symptoms=json.loads(scan.symptoms) if isinstance(scan.symptoms, str) else scan.symptoms,
            recommendations=json.loads(scan.recommendations) if isinstance(scan.recommendations, str) else scan.recommendations,
            preventiveMeasures=json.loads(scan.preventive_measures) if isinstance(scan.preventive_measures, str) else scan.preventive_measures,
            date=scan.date,
            season=scan.season,
            state=scan.state,
            district=scan.district
        ))
    return result

@router.delete("/history/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
@router.delete("/api/v1/scans/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
@router.delete("/api/v1/history/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_history_item(
    scan_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Delete a scan record belonging to the authenticated user."""
    scan = db.query(models.Scan).filter(models.Scan.id == scan_id, models.Scan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record not found or access denied"
        )
    db.delete(scan)
    db.commit()
    return None
