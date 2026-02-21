from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.database import get_db
from app.models import Guest, Wedding
from app.models.chatbot_settings import ChatbotSettings
from app.models.chatbot_log import ChatbotLog
from app.services import rada_service
from app.services.guest_service import get_guest_by_token
from app.utils.auth import get_current_wedding

router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])


# ── Request/Response Models ──────────────────────────────────────────

class ChatMessageItem(BaseModel):
    role: str
    content: str


class GuestChatRequest(BaseModel):
    message: str
    session_id: str
    language: str = "en"
    conversation_history: List[ChatMessageItem] = []


class GuestChatResponse(BaseModel):
    response: str
    topic: Optional[str] = None
    log_id: Optional[str] = None


class ChatbotSettingsResponse(BaseModel):
    chatbot_name: str = "Rada"
    greeting_message_en: Optional[str] = None
    greeting_message_ar: Optional[str] = None
    suggested_questions_en: Optional[list] = None
    suggested_questions_ar: Optional[list] = None


class ChatbotSettingsUpdate(BaseModel):
    chatbot_name: Optional[str] = None
    greeting_message_en: Optional[str] = None
    greeting_message_ar: Optional[str] = None
    suggested_questions_en: Optional[list] = None
    suggested_questions_ar: Optional[list] = None


class FeedbackRequest(BaseModel):
    log_id: str
    was_helpful: bool


# ── Guest-facing Endpoints ───────────────────────────────────────────

@router.post("/chat/{guest_token}", response_model=GuestChatResponse)
async def guest_chat(
    guest_token: str,
    request: GuestChatRequest,
    db: AsyncSession = Depends(get_db),
):
    """Process a chat message from a guest."""
    guest = await get_guest_by_token(guest_token, db, update_last_accessed=False)

    history = [{"role": m.role, "content": m.content} for m in request.conversation_history]

    result = await rada_service.chat(
        message=request.message,
        wedding_id=guest.wedding_id,
        guest_id=guest.id,
        session_id=request.session_id,
        conversation_history=history,
        language=request.language,
        db=db,
    )

    return GuestChatResponse(
        response=result["response"],
        topic=result.get("topic"),
        log_id=result.get("log_id"),
    )


@router.get("/settings/{guest_token}", response_model=ChatbotSettingsResponse)
async def get_guest_chatbot_settings(
    guest_token: str,
    db: AsyncSession = Depends(get_db),
):
    """Get chatbot settings for the guest's wedding (name, greeting, suggested questions)."""
    guest = await get_guest_by_token(guest_token, db, update_last_accessed=False)

    settings = await rada_service.get_chatbot_settings(guest.wedding_id, db)

    if settings:
        return ChatbotSettingsResponse(
            chatbot_name=settings.chatbot_name,
            greeting_message_en=settings.greeting_message_en,
            greeting_message_ar=settings.greeting_message_ar,
            suggested_questions_en=settings.suggested_questions_en,
            suggested_questions_ar=settings.suggested_questions_ar,
        )

    # Return defaults
    return ChatbotSettingsResponse()


@router.post("/feedback")
async def submit_feedback(
    request: FeedbackRequest,
    db: AsyncSession = Depends(get_db),
):
    """Submit feedback on a chatbot response."""
    try:
        log_id = UUID(request.log_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid log_id")

    result = await db.execute(
        select(ChatbotLog).where(ChatbotLog.id == log_id)
    )
    log = result.scalar_one_or_none()
    if not log:
        raise HTTPException(status_code=404, detail="Log entry not found")

    log.was_helpful = request.was_helpful
    await db.flush()

    return {"status": "ok"}


# ── Admin Endpoints ──────────────────────────────────────────────────

@router.get("/admin/settings", response_model=ChatbotSettingsResponse)
async def get_admin_chatbot_settings(
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db),
):
    """Get chatbot settings for admin."""
    settings = await rada_service.get_chatbot_settings(wedding.id, db)

    if settings:
        return ChatbotSettingsResponse(
            chatbot_name=settings.chatbot_name,
            greeting_message_en=settings.greeting_message_en,
            greeting_message_ar=settings.greeting_message_ar,
            suggested_questions_en=settings.suggested_questions_en,
            suggested_questions_ar=settings.suggested_questions_ar,
        )
    return ChatbotSettingsResponse()


@router.put("/admin/settings", response_model=ChatbotSettingsResponse)
async def update_admin_chatbot_settings(
    data: ChatbotSettingsUpdate,
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db),
):
    """Update chatbot settings for admin."""
    result = await db.execute(
        select(ChatbotSettings).where(ChatbotSettings.wedding_id == wedding.id)
    )
    settings = result.scalar_one_or_none()

    if not settings:
        # Create new settings
        settings = ChatbotSettings(wedding_id=wedding.id)
        db.add(settings)

    if data.chatbot_name is not None:
        settings.chatbot_name = data.chatbot_name
    if data.greeting_message_en is not None:
        settings.greeting_message_en = data.greeting_message_en
    if data.greeting_message_ar is not None:
        settings.greeting_message_ar = data.greeting_message_ar
    if data.suggested_questions_en is not None:
        settings.suggested_questions_en = data.suggested_questions_en
    if data.suggested_questions_ar is not None:
        settings.suggested_questions_ar = data.suggested_questions_ar

    await db.flush()

    return ChatbotSettingsResponse(
        chatbot_name=settings.chatbot_name,
        greeting_message_en=settings.greeting_message_en,
        greeting_message_ar=settings.greeting_message_ar,
        suggested_questions_en=settings.suggested_questions_en,
        suggested_questions_ar=settings.suggested_questions_ar,
    )


@router.get("/admin/stats")
async def get_admin_chatbot_stats(
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db),
):
    """Get chatbot analytics stats."""
    return await rada_service.get_chatbot_stats(wedding.id, db)


@router.get("/admin/logs")
async def get_admin_chatbot_logs(
    limit: int = 50,
    offset: int = 0,
    session_id: Optional[str] = None,
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db),
):
    """Get chatbot conversation logs."""
    return await rada_service.get_chat_logs(
        wedding.id, db,
        limit=limit,
        offset=offset,
        session_id=session_id,
    )
