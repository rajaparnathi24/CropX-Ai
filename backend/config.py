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

def _resolve_database_url() -> str:
    env_db = os.environ.get("DATABASE_URL")
    if env_db:
        return env_db
    root_db = os.path.join(os.path.dirname(_BACKEND_DIR), "cropx.db")
    if os.path.exists(root_db):
        return f"sqlite:///{root_db.replace('\\', '/')}"
    backend_db = os.path.join(_BACKEND_DIR, "cropx.db")
    return f"sqlite:///{backend_db.replace('\\', '/')}"

def _resolve_uploads_dir() -> str:
    env_uploads = os.environ.get("UPLOADS_DIR")
    if env_uploads:
        return env_uploads
    root_uploads = os.path.join(os.path.dirname(_BACKEND_DIR), "uploads")
    if os.path.exists(root_uploads):
        return root_uploads
    backend_uploads = os.path.join(_BACKEND_DIR, "uploads")
    return backend_uploads

DEFAULT_DEV_SECRET = "cropx_local_development_jwt_secret_key_2026_dev_only"

def _resolve_secret_key() -> str:
    env_secret = os.environ.get("SECRET_KEY")
    is_prod = (
        os.environ.get("RENDER") is not None
        or os.environ.get("ENVIRONMENT", "").strip().lower() == "production"
    )
    if is_prod:
        if (
            not env_secret
            or env_secret.strip() == ""
            or env_secret == DEFAULT_DEV_SECRET
            or "cropx_secret_key_production_2026" in env_secret
        ):
            raise ValueError(
                "CRITICAL SECURITY CONFIGURATION ERROR: A secure, unique SECRET_KEY environment variable "
                "must be configured in production (e.g. on Render). Default or placeholder keys are rejected."
            )
        return env_secret.strip()
    return env_secret.strip() if env_secret else DEFAULT_DEV_SECRET

class Settings(BaseSettings):
    PROJECT_NAME: str = "CropX AI Backend"
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = _resolve_secret_key()
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    DATABASE_URL: str = _resolve_database_url()
    UPLOADS_DIR: str = _resolve_uploads_dir()
    OPENWEATHER_API_KEY: str = ""
    CORS_ORIGINS: list[str] = [
        "http://localhost:4028",
        "http://localhost:3000",
        "http://127.0.0.1:4028",
        "https://crop-x-ai.vercel.app",
        "https://*.vercel.app",
    ]

    # Model paths — computed deterministically, NOT loaded from .env
    MODEL_PATH: str = _resolve_model_path("CropX_MobileNetV3_Final.keras")
    MODEL_PATH_2: str = _resolve_model_path("CropX_MobileNetV3_Final1.keras")

    model_config = {
        "env_file": ".env",
        "extra": "ignore",
    }

settings = Settings()

# Override fields after Settings init to ensure they are always computed
settings.MODEL_PATH = _resolve_model_path("CropX_MobileNetV3_Final.keras")
settings.MODEL_PATH_2 = _resolve_model_path("CropX_MobileNetV3_Final1.keras")
settings.DATABASE_URL = _resolve_database_url()
settings.SECRET_KEY = _resolve_secret_key()
settings.UPLOADS_DIR = _resolve_uploads_dir()

# Ensure uploads and models directories exist
os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
os.makedirs(_MODELS_DIR, exist_ok=True)
