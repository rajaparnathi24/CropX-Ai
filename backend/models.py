import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    state = Column(String, nullable=False, default="Gujarat")
    district = Column(String, nullable=False, default="Anand")
    primary_crop = Column(String, nullable=True, default="Rice")
    created_at = Column(DateTime, default=datetime.utcnow)

    scans = relationship("Scan", back_populates="owner", cascade="all, delete-orphan")


class Scan(Base):
    __tablename__ = "scans"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    image_url = Column(String, nullable=False)
    crop = Column(String, nullable=False, index=True)
    disease = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    severity = Column(String, nullable=False, default="medium")
    symptoms = Column(Text, nullable=False) # Stored as JSON string
    recommendations = Column(Text, nullable=False) # Stored as JSON string
    preventive_measures = Column(Text, nullable=False) # Stored as JSON string
    season = Column(String, nullable=False) # Kharif, Rabi, Zaid
    state = Column(String, nullable=False)
    district = Column(String, nullable=False)
    date = Column(DateTime, default=datetime.utcnow, index=True)

    owner = relationship("User", back_populates="scans")
