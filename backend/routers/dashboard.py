from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(tags=["Dashboard"])

@router.get("/dashboard", response_model=schemas.DashboardStats)
@router.get("/api/v1/dashboard", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Calculate real-time dashboard statistics from SQLite for current user."""
    scans = db.query(models.Scan).filter(models.Scan.user_id == current_user.id).all()

    total_scans = len(scans)
    healthy_crops = len([s for s in scans if "Healthy" in s.disease or s.severity == "low"])
    diseased_crops = total_scans - healthy_crops
    avg_confidence = round(sum(s.confidence for s in scans) / total_scans, 1) if total_scans > 0 else 0.0

    # Calculate disease distribution
    disease_counts = {}
    for s in scans:
        disease_counts[s.disease] = disease_counts.get(s.disease, 0) + 1

    disease_distribution = [
        {"disease": disease, "count": count}
        for disease, count in disease_counts.items()
    ]

    recent_activity = [
        {
            "id": s.id,
            "crop": s.crop,
            "disease": s.disease,
            "severity": s.severity,
            "date": s.date.strftime("%d %b %Y"),
            "confidence": s.confidence
        }
        for s in scans[:5]
    ]

    return {
        "totalScans": total_scans,
        "healthyCrops": healthy_crops,
        "diseasedCrops": diseased_crops,
        "avgConfidence": avg_confidence,
        "diseaseDistribution": disease_distribution,
        "recentActivity": recent_activity
    }
