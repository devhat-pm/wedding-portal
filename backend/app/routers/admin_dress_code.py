import os
import uuid as uuid_lib
import aiofiles
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import Wedding, DressCode
from app.schemas import (
    DressCodeCreate,
    DressCodeUpdate,
    DressCodeResponse,
    SuccessResponse
)
from app.utils.auth import get_current_wedding
from app.config import settings

router = APIRouter(prefix="/api/admin/dress-codes", tags=["Admin Dress Codes"])


@router.post("/", response_model=DressCodeResponse, status_code=status.HTTP_201_CREATED)
async def create_dress_code(
    data: DressCodeCreate,
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db)
):
    """Create dress code for event."""
    dress_code = DressCode(
        wedding_id=wedding.id,
        event_name=data.event_name,
        event_date=data.event_date,
        description=data.description,
        theme=data.theme,
        color_palette=[c.model_dump() for c in data.color_palette] if data.color_palette else None,
        dress_suggestions_men=data.dress_suggestions_men,
        dress_suggestions_women=data.dress_suggestions_women,
        image_urls=data.image_urls,
        notes=data.notes,
        display_order=data.display_order
    )

    db.add(dress_code)
    await db.flush()
    await db.refresh(dress_code)

    return DressCodeResponse.model_validate(dress_code)


@router.get("/", response_model=List[DressCodeResponse])
async def list_dress_codes(
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db)
):
    """List all dress codes."""
    result = await db.execute(
        select(DressCode)
        .where(DressCode.wedding_id == wedding.id)
        .order_by(DressCode.display_order, DressCode.event_date)
    )
    dress_codes = result.scalars().all()

    return [DressCodeResponse.model_validate(dc) for dc in dress_codes]


@router.put("/{dress_code_id}", response_model=DressCodeResponse)
async def update_dress_code(
    dress_code_id: UUID,
    data: DressCodeUpdate,
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db)
):
    """Update dress code."""
    result = await db.execute(
        select(DressCode).where(
            DressCode.id == dress_code_id,
            DressCode.wedding_id == wedding.id
        )
    )
    dress_code = result.scalar_one_or_none()

    if not dress_code:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dress code not found"
        )

    update_data = data.model_dump(exclude_unset=True)

    if 'color_palette' in update_data and update_data['color_palette']:
        update_data['color_palette'] = [c.model_dump() if hasattr(c, 'model_dump') else c for c in update_data['color_palette']]

    for field, value in update_data.items():
        setattr(dress_code, field, value)

    await db.flush()
    await db.refresh(dress_code)

    return DressCodeResponse.model_validate(dress_code)


@router.delete("/{dress_code_id}", response_model=SuccessResponse)
async def delete_dress_code(
    dress_code_id: UUID,
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db)
):
    """Remove dress code."""
    result = await db.execute(
        select(DressCode).where(
            DressCode.id == dress_code_id,
            DressCode.wedding_id == wedding.id
        )
    )
    dress_code = result.scalar_one_or_none()

    if not dress_code:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dress code not found"
        )

    await db.delete(dress_code)
    await db.flush()

    return SuccessResponse(message="Dress code deleted successfully")


@router.post("/{dress_code_id}/images", response_model=DressCodeResponse)
async def upload_dress_code_images(
    dress_code_id: UUID,
    files: List[UploadFile] = File(...),
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db)
):
    """Upload dress code images."""
    result = await db.execute(
        select(DressCode).where(
            DressCode.id == dress_code_id,
            DressCode.wedding_id == wedding.id
        )
    )
    dress_code = result.scalar_one_or_none()

    if not dress_code:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dress code not found"
        )

    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    upload_dir = os.path.join(settings.UPLOAD_DIR, "dress-codes", str(dress_code_id))
    os.makedirs(upload_dir, exist_ok=True)

    image_urls = dress_code.image_urls or []

    for file in files:
        if file.content_type not in allowed_types:
            continue

        file_ext = file.filename.split(".")[-1] if file.filename else "jpg"
        filename = f"{uuid_lib.uuid4()}.{file_ext}"
        file_path = os.path.join(upload_dir, filename)

        async with aiofiles.open(file_path, "wb") as f:
            content = await file.read()
            await f.write(content)

        image_urls.append(f"/uploads/dress-codes/{dress_code_id}/{filename}")

    dress_code.image_urls = image_urls
    await db.flush()
    await db.refresh(dress_code)

    return DressCodeResponse.model_validate(dress_code)
