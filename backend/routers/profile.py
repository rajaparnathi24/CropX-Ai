from fastapi import APIRouter, Depends
import schemas
import models
from auth import get_required_current_user

router = APIRouter(tags=["User Profile"])

@router.get("/profile", response_model=schemas.UserResponse)
@router.get("/api/v1/profile", response_model=schemas.UserResponse)
@router.get("/api/v1/auth/me", response_model=schemas.UserResponse)
def get_profile(current_user: models.User = Depends(get_required_current_user)):
    """Return logged-in user profile."""
    return schemas.UserResponse(
        id=current_user.id,
        fullName=current_user.full_name,
        email=current_user.email,
        state=current_user.state,
        district=current_user.district,
        primaryCrop=current_user.primary_crop,
        createdAt=current_user.created_at
    )
