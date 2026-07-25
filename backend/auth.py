from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
import models
import security

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    """Retrieve authenticated user from JWT token or return default demo user for open testing."""
    if not token:
        # Fallback to demo user if unauthenticated for testing endpoints
        user = db.query(models.User).filter(models.User.email == "demo@cropx.farm").first()
        if not user:
            user = models.User(
                full_name="Raj Aparnathi",
                email="farmer@cropx.farm",
                hashed_password=security.hash_password("CropX@2026"),
                state="Gujarat",
                district="Junagadh",
                primary_crop="Groundnut"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    payload = security.decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: str = payload["sub"]
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with token no longer exists",
        )
    return user
