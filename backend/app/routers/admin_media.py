import os
import zipfile
import math
from io import BytesIO
from typing import Optional
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Wedding, MediaUpload, Guest, FileType
from app.schemas import (
    MediaUploadResponse,
    MediaListResponse,
    MediaApprovalUpdate,
    SuccessResponse
)
from app.utils.auth import get_current_wedding
from app.config import settings

router = APIRouter(prefix="/api/admin/media", tags=["Admin Media"])


@router.get("/", response_model=MediaListResponse)
async def list_media(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    is_approved: Optional[bool] = None,
    guest_id: Optional[UUID] = None,
    event_tag: Optional[str] = None,
    file_type: Optional[str] = None,
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db)
):
    """List all uploads with filters."""
    query = select(MediaUpload).where(MediaUpload.wedding_id == wedding.id)
    count_query = select(func.count(MediaUpload.id)).where(MediaUpload.wedding_id == wedding.id)

    # Apply filters
    if is_approved is not None:
        query = query.where(MediaUpload.is_approved == is_approved)
        count_query = count_query.where(MediaUpload.is_approved == is_approved)

    if guest_id:
        query = query.where(MediaUpload.guest_id == guest_id)
        count_query = count_query.where(MediaUpload.guest_id == guest_id)

    if event_tag:
        query = query.where(MediaUpload.event_tag == event_tag)
        count_query = count_query.where(MediaUpload.event_tag == event_tag)

    if file_type:
        query = query.where(MediaUpload.file_type == FileType(file_type))
        count_query = count_query.where(MediaUpload.file_type == FileType(file_type))

    # Get total count
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Apply pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size).order_by(MediaUpload.uploaded_at.desc())
    query = query.options(selectinload(MediaUpload.guest))

    result = await db.execute(query)
    media_items = result.scalars().all()

    total_pages = math.ceil(total / page_size)

    items = []
    for m in media_items:
        item = MediaUploadResponse.model_validate(m)
        item.guest_name = m.guest.full_name if m.guest else None
        items.append(item)

    return MediaListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_previous=page > 1
    )


@router.put("/{media_id}/approve", response_model=MediaUploadResponse)
async def approve_media(
    media_id: UUID,
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db)
):
    """Approve media."""
    result = await db.execute(
        select(MediaUpload).where(
            MediaUpload.id == media_id,
            MediaUpload.wedding_id == wedding.id
        )
    )
    media = result.scalar_one_or_none()

    if not media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found"
        )

    media.is_approved = True
    media.approved_at = datetime.utcnow()

    await db.flush()
    await db.refresh(media)

    return MediaUploadResponse.model_validate(media)


@router.put("/{media_id}/reject", response_model=SuccessResponse)
async def reject_media(
    media_id: UUID,
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db)
):
    """Reject/delete media."""
    result = await db.execute(
        select(MediaUpload).where(
            MediaUpload.id == media_id,
            MediaUpload.wedding_id == wedding.id
        )
    )
    media = result.scalar_one_or_none()

    if not media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found"
        )

    # Delete file from disk if exists
    if media.file_url:
        file_path = os.path.join(settings.UPLOAD_DIR, media.file_url.lstrip("/uploads/"))
        if os.path.exists(file_path):
            os.remove(file_path)

    if media.thumbnail_url:
        thumb_path = os.path.join(settings.UPLOAD_DIR, media.thumbnail_url.lstrip("/uploads/"))
        if os.path.exists(thumb_path):
            os.remove(thumb_path)

    await db.delete(media)
    await db.flush()

    return SuccessResponse(message="Media deleted successfully")


@router.get("/download-all")
async def download_all_media(
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db)
):
    """Download all media as zip."""
    result = await db.execute(
        select(MediaUpload)
        .options(selectinload(MediaUpload.guest))
        .where(MediaUpload.wedding_id == wedding.id)
        .order_by(MediaUpload.event_tag, MediaUpload.uploaded_at)
    )
    media_items = result.scalars().all()

    if not media_items:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No media found"
        )

    # Create zip file in memory
    zip_buffer = BytesIO()

    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for media in media_items:
            if not media.file_url:
                continue

            file_path = os.path.join(settings.UPLOAD_DIR, media.file_url.lstrip("/uploads/"))

            if os.path.exists(file_path):
                # Organize by event tag
                folder = media.event_tag or "general"
                guest_name = media.guest.full_name if media.guest else "unknown"
                # Clean filename
                clean_guest = "".join(c for c in guest_name if c.isalnum() or c in (' ', '-', '_')).rstrip()

                archive_name = f"{folder}/{clean_guest}_{media.file_name}"
                zip_file.write(file_path, archive_name)

    zip_buffer.seek(0)

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename=wedding_media_{wedding.id}.zip"
        }
    )
