from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# Auth Schemas
class UserSignup(BaseModel):
    fullName: str = Field(..., alias="fullName")
    email: EmailStr
    password: str
    state: str = "Gujarat"
    district: str = "Anand"
    primaryCrop: Optional[str] = "Rice"

    class Config:
        populate_by_name = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: str
    fullName: str
    email: str
    state: str
    district: str
    primaryCrop: Optional[str] = None
    createdAt: datetime

    class Config:
        from_attributes = True

# Predict Schemas
class PredictResponse(BaseModel):
    crop: str
    disease: str
    confidence: float
    severity: str
    symptoms: List[str]
    recommendations: List[str]
    preventiveMeasures: List[str]
    season: str

# Scan Schemas
class ScanResponse(BaseModel):
    id: str
    userId: str
    imageUrl: str
    crop: str
    disease: str
    confidence: float
    severity: str
    symptoms: List[str]
    recommendations: List[str]
    preventiveMeasures: List[str]
    date: datetime
    season: str
    state: str
    district: str

    class Config:
        from_attributes = True

# Dashboard Schemas
class DashboardStats(BaseModel):
    totalScans: int
    healthyCrops: int
    diseasedCrops: int
    avgConfidence: float
    diseaseDistribution: List[dict]
    recentActivity: List[dict]

# Weather Schemas
class WeatherForecastItem(BaseModel):
    day: str
    tempHigh: int
    tempLow: int
    condition: str

class WeatherResponse(BaseModel):
    temperature: int
    humidity: int
    condition: str
    icon: str = "partly-cloudy"
    rainfall: int
    windSpeed: int
    district: str
    state: str
    updatedAt: str
    forecast: List[WeatherForecastItem]


# Community Schemas
class CommentCreate(BaseModel):
    authorName: str
    authorLocation: str
    content: str

class CommentResponse(BaseModel):
    id: str
    postId: str
    authorName: str
    authorLocation: str
    content: str
    createdAt: datetime

    class Config:
        from_attributes = True

class PostCreate(BaseModel):
    authorName: str
    authorLocation: str
    cropCategory: str
    title: str
    content: str
    imageUrl: Optional[str] = None

class PostResponse(BaseModel):
    id: str
    authorName: str
    authorLocation: str
    cropCategory: str
    title: str
    content: str
    imageUrl: Optional[str] = None
    likes: int
    commentsCount: int
    comments: List[CommentResponse] = []
    createdAt: datetime

    class Config:
        from_attributes = True

