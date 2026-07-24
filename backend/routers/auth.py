from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import security

router = APIRouter(tags=["Authentication"])

@router.post("/signup", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
@router.post("/api/v1/auth/signup", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
@router.post("/api/v1/auth/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def signup(user_data: schemas.UserSignup, db: Session = Depends(get_db)):
    """Register a new farmer account and issue JWT access token."""
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists"
        )

    hashed_pwd = security.hash_password(user_data.password)
    new_user = models.User(
        full_name=user_data.fullName,
        email=user_data.email,
        hashed_password=hashed_pwd,
        state=user_data.state,
        district=user_data.district,
        primary_crop=user_data.primaryCrop or "Rice"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = security.create_access_token({"sub": new_user.id, "email": new_user.email})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=schemas.Token)
@router.post("/api/v1/auth/login", response_model=schemas.Token)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    """Authenticate user credentials and issue JWT access token."""
    user = db.query(models.User).filter(models.User.email == login_data.email).first()
    if not user or not security.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = security.create_access_token({"sub": user.id, "email": user.email})
    return {"access_token": token, "token_type": "bearer"}
