from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID
import math

from app.database import get_db
from app.services.guest_service import GuestService
from app.schemas.guest import (
    GuestCreate,
    GuestUpdate,
    GuestResponse,
    GuestListResponse,
    GuestGroupCreate,
    GuestGroupUpdate,
    GuestGroupResponse,
    BulkRSVPUpdate
)
from app.schemas.common import PaginationParams, PaginatedResponse, MessageResponse
from app.utils.helpers import (
    export_guests_to_excel,
    import_guests_from_excel,
    generate_guest_template
)

router = APIRouter(prefix="/guests", tags=["Guests"])


# Guest Group Endpoints
@router.post("/groups", response_model=GuestGroupResponse, status_code=status.HTTP_201_CREATED)
async def create_group(
    data: GuestGroupCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new guest group."""
    service = GuestService(db)
    group = await service.create_group(data)
    return GuestGroupResponse(
        **group.__dict__,
        guest_count=len(group.guests) if group.guests else 0
    )


@router.get("/groups", response_model=list[GuestGroupResponse])
async def get_groups(db: AsyncSession = Depends(get_db)):
    """Get all guest groups."""
    service = GuestService(db)
    groups = await service.get_all_groups()
    return [
        GuestGroupResponse(
            **group.__dict__,
            guest_count=len(group.guests) if group.guests else 0
        )
        for group in groups
    ]


@router.get("/groups/{group_id}", response_model=GuestGroupResponse)
async def get_group(
    group_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get a guest group by ID."""
    service = GuestService(db)
    group = await service.get_group(group_id)
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    return GuestGroupResponse(
        **group.__dict__,
        guest_count=len(group.guests) if group.guests else 0
    )


@router.patch("/groups/{group_id}", response_model=GuestGroupResponse)
async def update_group(
    group_id: UUID,
    data: GuestGroupUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a guest group."""
    service = GuestService(db)
    group = await service.update_group(group_id, data)
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    return GuestGroupResponse(
        **group.__dict__,
        guest_count=len(group.guests) if group.guests else 0
    )


@router.delete("/groups/{group_id}", response_model=MessageResponse)
async def delete_group(
    group_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete a guest group."""
    service = GuestService(db)
    deleted = await service.delete_group(group_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    return MessageResponse(message="Group deleted successfully")


# Guest Endpoints
@router.post("", response_model=GuestResponse, status_code=status.HTTP_201_CREATED)
async def create_guest(
    data: GuestCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new guest."""
    service = GuestService(db)
    guest = await service.create_guest(data)
    return GuestResponse(
        **guest.__dict__,
        full_name=guest.full_name,
        full_name_arabic=guest.full_name_arabic,
        total_guests=guest.total_guests
    )


@router.get("", response_model=PaginatedResponse[GuestListResponse])
async def get_guests(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    sort_by: Optional[str] = Query(default="created_at"),
    sort_order: str = Query(default="desc", pattern="^(asc|desc)$"),
    search: Optional[str] = None,
    rsvp_status: Optional[str] = None,
    side: Optional[str] = None,
    relation: Optional[str] = None,
    is_vip: Optional[bool] = None,
    group_id: Optional[UUID] = None,
    has_plus_one: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get paginated list of guests with filters."""
    service = GuestService(db)
    pagination = PaginationParams(
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order
    )

    guests, total = await service.get_guests(
        pagination=pagination,
        search=search,
        rsvp_status=rsvp_status,
        side=side,
        relation=relation,
        is_vip=is_vip,
        group_id=group_id,
        has_plus_one=has_plus_one
    )

    total_pages = math.ceil(total / page_size)

    return PaginatedResponse(
        items=[
            GuestListResponse(
                **guest.__dict__,
                total_guests=guest.total_guests
            )
            for guest in guests
        ],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_previous=page > 1
    )


@router.get("/{guest_id}", response_model=GuestResponse)
async def get_guest(
    guest_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get a guest by ID."""
    service = GuestService(db)
    guest = await service.get_guest(guest_id)
    if not guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guest not found"
        )

    response_data = {
        **guest.__dict__,
        'full_name': guest.full_name,
        'full_name_arabic': guest.full_name_arabic,
        'total_guests': guest.total_guests
    }

    if guest.group:
        response_data['group'] = GuestGroupResponse(
            **guest.group.__dict__,
            guest_count=len(guest.group.guests) if guest.group.guests else 0
        )

    return GuestResponse(**response_data)


@router.patch("/{guest_id}", response_model=GuestResponse)
async def update_guest(
    guest_id: UUID,
    data: GuestUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a guest."""
    service = GuestService(db)
    guest = await service.update_guest(guest_id, data)
    if not guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guest not found"
        )

    response_data = {
        **guest.__dict__,
        'full_name': guest.full_name,
        'full_name_arabic': guest.full_name_arabic,
        'total_guests': guest.total_guests
    }

    if guest.group:
        response_data['group'] = GuestGroupResponse(
            **guest.group.__dict__,
            guest_count=len(guest.group.guests) if guest.group.guests else 0
        )

    return GuestResponse(**response_data)


@router.delete("/{guest_id}", response_model=MessageResponse)
async def delete_guest(
    guest_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete a guest."""
    service = GuestService(db)
    deleted = await service.delete_guest(guest_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guest not found"
        )
    return MessageResponse(message="Guest deleted successfully")


@router.post("/bulk-rsvp", response_model=MessageResponse)
async def bulk_update_rsvp(
    data: BulkRSVPUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Bulk update RSVP status for multiple guests."""
    service = GuestService(db)
    count = await service.bulk_update_rsvp(data)
    return MessageResponse(
        message=f"Updated RSVP status for {count} guests",
        data={"updated_count": count}
    )


@router.get("/export/excel")
async def export_guests(db: AsyncSession = Depends(get_db)):
    """Export all guests to Excel file."""
    service = GuestService(db)
    guests = await service.get_all_guests_for_export()

    guests_data = [
        {
            "first_name": g.first_name,
            "last_name": g.last_name,
            "first_name_arabic": g.first_name_arabic,
            "last_name_arabic": g.last_name_arabic,
            "email": g.email,
            "phone": g.phone,
            "side": g.side.value if g.side else "",
            "relation": g.relation.value if g.relation else "",
            "rsvp_status": g.rsvp_status.value if g.rsvp_status else "",
            "plus_one_allowed": g.plus_one_allowed,
            "plus_one_name": g.plus_one_name,
            "children_count": g.children_count,
            "table_number": g.table_number,
            "seat_number": g.seat_number,
            "is_vip": g.is_vip,
            "dietary_restrictions": g.dietary_restrictions,
            "special_requests": g.special_requests,
            "notes": g.notes
        }
        for g in guests
    ]

    excel_file = export_guests_to_excel(guests_data)

    return StreamingResponse(
        excel_file,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": "attachment; filename=wedding_guests.xlsx"
        }
    )


@router.get("/import/template")
async def get_import_template():
    """Get Excel template for importing guests."""
    template = generate_guest_template()

    return StreamingResponse(
        template,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": "attachment; filename=guest_import_template.xlsx"
        }
    )


@router.post("/import/excel", response_model=MessageResponse)
async def import_guests(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Import guests from Excel file."""
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an Excel file (.xlsx or .xls)"
        )

    try:
        guests_data = import_guests_from_excel(file.file)
        service = GuestService(db)
        guests = await service.bulk_create_guests(guests_data)

        return MessageResponse(
            message=f"Successfully imported {len(guests)} guests",
            data={"imported_count": len(guests)}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error importing guests: {str(e)}"
        )
