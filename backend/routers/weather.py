from fastapi import APIRouter, Query, Depends
import schemas
import models
from auth import get_current_user
from services.weather_service import weather_service

router = APIRouter(tags=["Weather Service"])

@router.get("/weather", response_model=schemas.WeatherResponse)
@router.get("/api/v1/weather", response_model=schemas.WeatherResponse)
def get_weather(
    district: str = Query(None),
    state: str = Query(None),
    current_user: models.User = Depends(get_current_user)
):
    """Retrieve weather data for specified district/state or current user location."""
    target_district = district or current_user.district or "Anand"
    target_state = state or current_user.state or "Gujarat"
    return weather_service.get_weather(target_district, target_state)
