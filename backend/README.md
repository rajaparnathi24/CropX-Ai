# CropX FastAPI AI Backend (India Agriculture)

Production-ready FastAPI backend for CropX crop disease diagnosis, user management, SQLite persistence, and MobileNetV3 AI inference.

## Features
- **JWT Authentication**: User signup, login, and bearer token security.
- **SQLite Database**: SQLAlchemy ORM for `Users` and `Scans`.
- **AI Disease Model Engine**: Image preprocessing (MobileNetV3 224x224) and disease classification across 11 Indian crops.
- **Indian Seasons Calculator**: Automatic Kharif, Rabi, and Zaid season tagging.
- **District Weather Service**: OpenWeather integration service with forecast.
- **Dashboard Analytics**: Real-time stats calculated from SQLite database.

## Quick Start Commands
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
.\venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Run FastAPI server
uvicorn app:app --reload --port 8000
```
API Documentation will be available at `http://localhost:8000/docs`.
