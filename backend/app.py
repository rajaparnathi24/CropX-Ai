import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from config import settings
from services.model_service import model_service
from routers import auth, prediction, history, dashboard, profile, weather, community
from leaf_scanner_camera_weather import render_leaf_scanner_page
render_leaf_scanner_page()

# Configure Logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("CropXBackend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler: Create DB tables and load AI model once at startup."""
    logger.info("Initializing SQLite database tables...")
    Base.metadata.create_all(bind=engine)

    logger.info("Triggering AI Model warm-up...")
    _ = model_service
    logger.info("CropX AI Backend successfully initialized and ready!")
    yield
    logger.info("Shutting down CropX AI Backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="FastAPI Backend for CropX AI Crop Disease Diagnosis & Management in India",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static directory
app.mount("/uploads", StaticFiles(directory=settings.UPLOADS_DIR), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(prediction.router)
app.include_router(history.router)
app.include_router(dashboard.router)
app.include_router(profile.router)
app.include_router(weather.router)
app.include_router(community.router)


@app.get("/")
def root_status():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "docs": "/docs",
        "api_v1": "/api/v1"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception caught on {request.url}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"An unexpected server error occurred: {str(exc)}"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
