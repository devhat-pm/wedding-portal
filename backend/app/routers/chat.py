from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.ai_chat_service import get_chat_response, get_streaming_response
from app.database import get_db

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = []
    wedding_id: Optional[str] = None
    guest_token: Optional[str] = None


class ChatResponse(BaseModel):
    response: str


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    """Send message to AI chatbot."""

    wedding_context = None

    # Could fetch wedding details from DB if wedding_id provided
    if request.wedding_id:
        pass

    history = [{"role": m.role, "content": m.content} for m in (request.conversation_history or [])]

    response = await get_chat_response(
        message=request.message,
        conversation_history=history,
        wedding_context=wedding_context,
    )

    return ChatResponse(response=response)


@router.post("/stream")
async def chat_stream(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    """Stream AI chatbot response."""

    history = [{"role": m.role, "content": m.content} for m in (request.conversation_history or [])]

    async def generate():
        async for chunk in get_streaming_response(
            message=request.message,
            conversation_history=history,
        ):
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
