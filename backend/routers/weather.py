from typing import Optional
from fastapi import APIRouter, Query, Depends
import schemas
import models
from auth import get_optional_current_user
from services.weather_service import weather_service

router = APIRouter(tags=["Weather Service"])

@router.get("/weather", response_model=schemas.WeatherResponse)
@router.get("/api/v1/weather", response_model=schemas.WeatherResponse)
def get_weather(
    district: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    current_user: Optional[models.User] = Depends(get_optional_current_user)
):
    """Retrieve weather data for specified district/state or current user location."""
    user_district = current_user.district if current_user else None
    user_state = current_user.state if current_user else None
    target_district = district or user_district or "Anand"
    target_state = state or user_state or "Gujarat"
    return weather_service.get_weather(target_district, target_state)
