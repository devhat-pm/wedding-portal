from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.stats_service import StatsService
from app.schemas.common import StatsResponse

router = APIRouter(prefix="/stats", tags=["Statistics"])


@router.get("", response_model=StatsResponse)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    """Get dashboard statistics."""
    service = StatsService(db)
    stats = await service.get_dashboard_stats()
    return stats


@router.get("/rsvp-breakdown")
async def get_rsvp_breakdown(db: AsyncSession = Depends(get_db)):
    """Get RSVP status breakdown."""
    service = StatsService(db)
    breakdown = await service.get_rsvp_breakdown()
    return breakdown


@router.get("/side-breakdown")
async def get_side_breakdown(db: AsyncSession = Depends(get_db)):
    """Get guest side breakdown."""
    service = StatsService(db)
    breakdown = await service.get_side_breakdown()
    return breakdown


@router.get("/relation-breakdown")
async def get_relation_breakdown(db: AsyncSession = Depends(get_db)):
    """Get guest relation breakdown."""
    service = StatsService(db)
    breakdown = await service.get_relation_breakdown()
    return breakdown
