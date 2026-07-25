import os
from pydantic_settings import BaseSettings

# Compute the backend directory once — all paths are relative to this
_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
_MODELS_DIR = os.path.join(_BACKEND_DIR, "models")

def _resolve_model_path(filename: str) -> str:
    """Resolve model path: check backend/models/ first, then project root."""
    path = os.path.join(_MODELS_DIR, filename)
    if os.path.exists(path):
        return path
    # Fallback: check project root (one level above backend/)
    root_path = os.path.join(os.path.dirname(_BACKEND_DIR), filename)
    if os.path.exists(root_path):
        return root_path
    # Return the expected path even if not found (error will be logged at load time)
    return path

class Settings(BaseSettings):
    PROJECT_NAME: str = "CropX AI Backend"
    SECRET_KEY: str = "cropx_secret_key_production_2026_super_secure_jwt_token_key_india"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    DATABASE_URL: str = "sqlite:///./cropx.db"
    UPLOADS_DIR: str = "uploads"
    OPENWEATHER_API_KEY: str = ""
    CORS_ORIGINS: list[str] = ["http://localhost:4028", "http://localhost:3000", "http://127.0.0.1:4028"]

    # Model paths — computed deterministically, NOT loaded from .env
    MODEL_PATH: str = _resolve_model_path("CropX_MobileNetV3_Final.keras")
    MODEL_PATH_2: str = _resolve_model_path("CropX_MobileNetV3_Final1.keras")

    model_config = {
        "env_file": ".env",
        "extra": "ignore",
    }

settings = Settings()

# Override MODEL_PATH fields after Settings init to ensure they are always computed
settings.MODEL_PATH = _resolve_model_path("CropX_MobileNetV3_Final.keras")
settings.MODEL_PATH_2 = _resolve_model_path("CropX_MobileNetV3_Final1.keras")

# Ensure uploads and models directories exist
os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
os.makedirs(_MODELS_DIR, exist_ok=True)
