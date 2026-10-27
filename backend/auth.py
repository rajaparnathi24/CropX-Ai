import logging
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
import models
import security

logger = logging.getLogger("CropXAuth")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

def get_required_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    """
    Strict authentication for private endpoints (profile, scan history, dashboard).
    Raises HTTP 401 Unauthorized if the token is missing, invalid, or expired.
    Never falls back to a shared demo user account.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
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
            # Fallback by email if ID changed across DB resets
            user_email = payload.get("email")
            if user_email:
                user = db.query(models.User).filter(models.User.email == user_email).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account associated with token does not exist",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_optional_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[models.User]:
    """
    Optional authentication for public endpoints (AI disease prediction, weather).
    Returns the authenticated User if a valid token is provided; returns None if unauthenticated.
    Does NOT fall back to a shared demo user account or expose private data.
    """
    if not token:
        return None

    try:
        payload = security.decode_access_token(token)
        if payload and "sub" in payload:
            user = db.query(models.User).filter(models.User.id == payload["sub"]).first()
            if not user and payload.get("email"):
                user = db.query(models.User).filter(models.User.email == payload.get("email")).first()
            return user
    except Exception as e:
        logger.debug(f"Optional token resolution skipped: {str(e)}")

    return None

# Default get_current_user alias points to strict required authentication
get_current_user = get_required_current_user
