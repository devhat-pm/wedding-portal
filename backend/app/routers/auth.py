from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, Field

from app.database import get_db
from app.models import Wedding
from app.schemas import (
    WeddingCreate,
    WeddingResponse,
    AdminLoginRequest,
    AdminLoginResponse,
    SuccessResponse
)
from app.utils.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_wedding
)

router = APIRouter(prefix="/api/admin/auth", tags=["Admin Auth"])


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


@router.post("/register", response_model=AdminLoginResponse, status_code=status.HTTP_201_CREATED)
async def register_wedding(
    data: WeddingCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create new wedding with admin account."""
    # Check if email already exists
    result = await db.execute(
        select(Wedding).where(Wedding.admin_email == data.admin_email)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create wedding
    wedding = Wedding(
        couple_names=data.couple_names,
        wedding_date=data.wedding_date,
        venue_name=data.venue_name,
        venue_address=data.venue_address,
        venue_city=data.venue_city,
        venue_country=data.venue_country,
        welcome_message=data.welcome_message,
        cover_image_url=data.cover_image_url,
        admin_email=data.admin_email,
        admin_password_hash=hash_password(data.admin_password),
        is_active=True
    )

    db.add(wedding)
    await db.flush()
    await db.refresh(wedding)

    # Generate token
    access_token = create_access_token(wedding.id)

    return AdminLoginResponse(
        access_token=access_token,
        token_type="bearer",
        wedding_id=wedding.id,
        admin_id=wedding.id
    )


@router.post("/login", response_model=AdminLoginResponse)
async def login(
    data: AdminLoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """Admin login."""
    result = await db.execute(
        select(Wedding).where(Wedding.admin_email == data.email)
    )
    wedding = result.scalar_one_or_none()

    if not wedding or not verify_password(data.password, wedding.admin_password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not wedding.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )

    access_token = create_access_token(wedding.id)

    return AdminLoginResponse(
        access_token=access_token,
        token_type="bearer",
        wedding_id=wedding.id,
        admin_id=wedding.id
    )


@router.get("/me", response_model=WeddingResponse)
async def get_current_admin(
    wedding: Wedding = Depends(get_current_wedding)
):
    """Get current admin info."""
    return WeddingResponse.model_validate(wedding)


@router.put("/change-password", response_model=SuccessResponse)
async def change_password(
    data: PasswordChangeRequest,
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db)
):
    """Update admin password."""
    if not verify_password(data.current_password, wedding.admin_password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    wedding.admin_password_hash = hash_password(data.new_password)
    await db.flush()

    return SuccessResponse(message="Password updated successfully")
