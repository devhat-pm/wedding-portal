import logging
import uuid
import re
from typing import Optional
from datetime import datetime

from groq import Groq
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.config import settings
from app.models import (
    Guest, Wedding, TravelInfo, HotelInfo, SuggestedHotel,
    Activity, GuestActivity
)
from app.models.chatbot_settings import ChatbotSettings
from app.models.chatbot_log import ChatbotLog

logger = logging.getLogger(__name__)

client = None
if settings.GROQ_API_KEY:
    client = Groq(api_key=settings.GROQ_API_KEY)
else:
    logger.warning("GROQ_API_KEY is not set. Rada chatbot will not work.")


# Topic keywords for detection
TOPIC_KEYWORDS = {
    "rsvp": ["rsvp", "confirm", "attend", "coming", "decline", "response", "حضور", "تأكيد"],
    "schedule": ["schedule", "time", "when", "agenda", "program", "event", "جدول", "موعد", "متى"],
    "venue": ["venue", "location", "where", "address", "map", "direction", "مكان", "عنوان", "أين"],
    "hotel": ["hotel", "stay", "accommodation", "room", "book", "فندق", "إقامة", "حجز"],
    "travel": ["travel", "flight", "airport", "pickup", "transport", "سفر", "طيران", "مطار"],
    "dress_code": ["dress", "wear", "outfit", "attire", "color", "ملابس", "لبس"],
    "food": ["food", "menu", "eat", "diet", "vegetarian", "halal", "طعام", "أكل", "قائمة"],
    "activities": ["activity", "activities", "event", "party", "henna", "أنشطة", "فعالية", "حفلة"],
    "gift": ["gift", "present", "registry", "هدية", "هدايا"],
    "general": ["help", "hello", "hi", "thanks", "مساعدة", "مرحبا", "شكرا"],
}


def detect_topic(message: str) -> Optional[str]:
    """Detect the topic of a user message."""
    msg_lower = message.lower()
    scores = {}
    for topic, keywords in TOPIC_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in msg_lower)
        if score > 0:
            scores[topic] = score
    if scores:
        return max(scores, key=scores.get)
    return None


def detect_language(message: str) -> str:
    """Detect if message is Arabic or English."""
    arabic_pattern = re.compile(r'[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+')
    arabic_chars = len(arabic_pattern.findall(message))
    if arabic_chars > 0:
        return "ar"
    return "en"


async def get_chatbot_settings(wedding_id, db: AsyncSession) -> Optional[ChatbotSettings]:
    """Get chatbot settings for a wedding."""
    result = await db.execute(
        select(ChatbotSettings).where(ChatbotSettings.wedding_id == wedding_id)
    )
    return result.scalar_one_or_none()


async def build_wedding_context(wedding: Wedding, db: AsyncSession) -> str:
    """Build wedding context string for the system prompt."""
    lines = [
        f"Wedding: {wedding.couple_names}",
        f"Date: {wedding.wedding_date.strftime('%B %d, %Y') if wedding.wedding_date else 'TBD'}",
        f"Venue: {wedding.venue_name or 'TBD'}",
    ]
    if wedding.venue_address:
        lines.append(f"Address: {wedding.venue_address}")
    if wedding.venue_city:
        lines.append(f"City: {wedding.venue_city}, {wedding.venue_country or ''}")

    # Get activities/schedule
    activities_result = await db.execute(
        select(Activity)
        .where(Activity.wedding_id == wedding.id)
        .order_by(Activity.date_time)
    )
    activities = activities_result.scalars().all()
    if activities:
        lines.append("\nWedding Schedule:")
        for a in activities:
            time_str = a.date_time.strftime('%B %d at %I:%M %p') if a.date_time else "TBD"
            line = f"  - {a.activity_name}: {time_str}"
            if a.location:
                line += f" at {a.location}"
            lines.append(line)
            if a.dress_code_info:
                lines.append(f"    Dress code: {a.dress_code_info}")
            if a.food_description:
                lines.append(f"    Food: {a.food_description}")

    # Get suggested hotels
    hotels_result = await db.execute(
        select(SuggestedHotel)
        .where(SuggestedHotel.wedding_id == wedding.id, SuggestedHotel.is_active == True)
        .order_by(SuggestedHotel.display_order)
    )
    hotels = hotels_result.scalars().all()
    if hotels:
        lines.append("\nRecommended Hotels:")
        for h in hotels:
            line = f"  - {h.hotel_name}"
            if h.star_rating:
                line += f" ({h.star_rating} stars)"
            if h.price_range:
                line += f" - {h.price_range}"
            if h.distance_from_venue:
                line += f", {h.distance_from_venue} from venue"
            lines.append(line)

    return "\n".join(lines)


async def build_guest_context(guest: Guest, db: AsyncSession) -> str:
    """Build personalized guest context string."""
    lines = [
        f"Guest Name: {guest.full_name}",
        f"RSVP Status: {guest.rsvp_status.value if guest.rsvp_status else 'pending'}",
    ]

    if guest.number_of_attendees:
        lines.append(f"Number of attendees: {guest.number_of_attendees}")

    # Travel info
    travel_result = await db.execute(
        select(TravelInfo).where(TravelInfo.guest_id == guest.id)
    )
    travel = travel_result.scalar_one_or_none()
    if travel:
        lines.append("Travel Info: Submitted")
        if travel.arrival_date:
            lines.append(f"  Arriving: {travel.arrival_date.strftime('%B %d')}")
        if travel.departure_date:
            lines.append(f"  Departing: {travel.departure_date.strftime('%B %d')}")
        if travel.needs_pickup:
            lines.append("  Needs airport pickup: Yes")
    else:
        lines.append("Travel Info: Not submitted yet")

    # Hotel info
    hotel_result = await db.execute(
        select(HotelInfo).where(HotelInfo.guest_id == guest.id)
    )
    hotel = hotel_result.scalar_one_or_none()
    if hotel:
        lines.append("Hotel: Preference submitted")
        if hotel.custom_hotel_name:
            lines.append(f"  Hotel: {hotel.custom_hotel_name}")
    else:
        lines.append("Hotel: Not chosen yet")

    # Activity registrations
    reg_result = await db.execute(
        select(GuestActivity, Activity)
        .join(Activity, GuestActivity.activity_id == Activity.id)
        .where(GuestActivity.guest_id == guest.id)
    )
    registrations = reg_result.all()
    if registrations:
        lines.append("Registered Activities:")
        for ga, act in registrations:
            lines.append(f"  - {act.activity_name}")
    else:
        lines.append("Activities: No registrations yet")

    return "\n".join(lines)


def build_system_prompt(
    chatbot_name: str,
    wedding_context: str,
    guest_context: Optional[str],
    language: str,
) -> str:
    """Build the full system prompt for Rada."""

    if language == "ar":
        lang_instruction = (
            "IMPORTANT: Respond ONLY in Arabic (العربية). Use natural, warm Arabic. "
            "Keep responses concise and helpful."
        )
    else:
        lang_instruction = (
            "Respond in English. Keep responses concise, warm, and helpful."
        )

    prompt = f"""You are {chatbot_name}, a friendly AI wedding assistant. You help wedding guests with questions about the wedding.

PERSONALITY:
- Warm, friendly, and celebratory tone
- Concise answers (2-4 sentences typically)
- Use occasional emojis sparingly for warmth
- Be helpful but never pushy

{lang_instruction}

CRITICAL RULES:
- You are READ-ONLY. NEVER claim to make changes, bookings, or updates on behalf of the guest.
- If asked to change RSVP, book hotels, or modify anything, politely explain they need to use the portal sections directly.
- Only answer based on the wedding information provided below. If you don't know something, say so honestly.
- Do not make up information about the wedding.
- If asked about things unrelated to this wedding, politely redirect to wedding topics.

WEDDING INFORMATION:
{wedding_context}
"""

    if guest_context:
        prompt += f"""
CURRENT GUEST INFORMATION (personalized context):
{guest_context}

Use this guest information to personalize your responses. For example, if they ask about their RSVP status, you can tell them directly.
"""

    return prompt


async def chat(
    message: str,
    wedding_id,
    guest_id: Optional[uuid.UUID],
    session_id: str,
    conversation_history: list,
    language: str,
    db: AsyncSession,
) -> dict:
    """Process a chat message and return the response."""

    if not client:
        fallback = (
            "I'm sorry, but the AI assistant is not configured yet. "
            "Please contact the wedding organizers for help."
        )
        if language == "ar":
            fallback = (
                "عذراً، المساعد الذكي غير متاح حالياً. "
                "يرجى التواصل مع منظمي الحفل للمساعدة."
            )
        return {"response": fallback, "topic": None}

    # Get chatbot settings
    cb_settings = await get_chatbot_settings(wedding_id, db)
    chatbot_name = cb_settings.chatbot_name if cb_settings else "Rada"

    # Get wedding
    wedding_result = await db.execute(
        select(Wedding).where(Wedding.id == wedding_id)
    )
    wedding = wedding_result.scalar_one_or_none()
    if not wedding:
        return {"response": "Wedding not found.", "topic": None}

    # Build contexts
    wedding_context = await build_wedding_context(wedding, db)

    guest_context = None
    if guest_id:
        guest_result = await db.execute(
            select(Guest).where(Guest.id == guest_id)
        )
        guest = guest_result.scalar_one_or_none()
        if guest:
            guest_context = await build_guest_context(guest, db)

    # Build system prompt
    system_prompt = build_system_prompt(chatbot_name, wedding_context, guest_context, language)

    # Build messages
    messages = [{"role": "system", "content": system_prompt}]

    # Add conversation history (last 10 exchanges)
    for msg in conversation_history[-20:]:
        messages.append({"role": msg["role"], "content": msg["content"]})

    messages.append({"role": "user", "content": message})

    # Detect topic
    topic = detect_topic(message)

    # Call Groq
    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
            top_p=0.9,
        )
        bot_response = response.choices[0].message.content
    except Exception as e:
        logger.error(f"Groq API error: {e}")
        bot_response = (
            "I'm having trouble right now. Please try again in a moment."
            if language == "en" else
            "أواجه مشكلة حالياً. يرجى المحاولة مرة أخرى بعد قليل."
        )
        topic = None

    # Determine if the bot couldn't answer
    could_not_answer = any(
        phrase in bot_response.lower()
        for phrase in ["i don't know", "i'm not sure", "don't have information", "لا أعرف", "لست متأكد"]
    )

    # Log the conversation
    log_entry = ChatbotLog(
        wedding_id=wedding_id,
        guest_id=guest_id,
        session_id=session_id,
        user_message=message,
        bot_response=bot_response,
        language=language,
        message_type="question",
        topic_detected=topic,
        could_not_answer=could_not_answer,
    )
    db.add(log_entry)
    await db.flush()

    return {
        "response": bot_response,
        "topic": topic,
        "log_id": str(log_entry.id),
    }


async def get_chatbot_stats(wedding_id, db: AsyncSession) -> dict:
    """Get chatbot analytics/stats for admin dashboard."""
    # Total conversations
    total_result = await db.execute(
        select(func.count(ChatbotLog.id))
        .where(ChatbotLog.wedding_id == wedding_id)
    )
    total_messages = total_result.scalar() or 0

    # Unique sessions
    sessions_result = await db.execute(
        select(func.count(func.distinct(ChatbotLog.session_id)))
        .where(ChatbotLog.wedding_id == wedding_id)
    )
    unique_sessions = sessions_result.scalar() or 0

    # Could not answer count
    unanswered_result = await db.execute(
        select(func.count(ChatbotLog.id))
        .where(ChatbotLog.wedding_id == wedding_id, ChatbotLog.could_not_answer == True)
    )
    unanswered = unanswered_result.scalar() or 0

    # Topic breakdown
    topic_result = await db.execute(
        select(ChatbotLog.topic_detected, func.count(ChatbotLog.id))
        .where(ChatbotLog.wedding_id == wedding_id, ChatbotLog.topic_detected.isnot(None))
        .group_by(ChatbotLog.topic_detected)
    )
    topics = {row[0]: row[1] for row in topic_result.all()}

    # Language breakdown
    lang_result = await db.execute(
        select(ChatbotLog.language, func.count(ChatbotLog.id))
        .where(ChatbotLog.wedding_id == wedding_id)
        .group_by(ChatbotLog.language)
    )
    languages = {row[0]: row[1] for row in lang_result.all()}

    # Helpful rate
    helpful_result = await db.execute(
        select(func.count(ChatbotLog.id))
        .where(ChatbotLog.wedding_id == wedding_id, ChatbotLog.was_helpful == True)
    )
    helpful_count = helpful_result.scalar() or 0

    rated_result = await db.execute(
        select(func.count(ChatbotLog.id))
        .where(ChatbotLog.wedding_id == wedding_id, ChatbotLog.was_helpful.isnot(None))
    )
    rated_count = rated_result.scalar() or 0

    return {
        "total_messages": total_messages,
        "unique_sessions": unique_sessions,
        "unanswered_count": unanswered,
        "topics": topics,
        "languages": languages,
        "helpful_count": helpful_count,
        "rated_count": rated_count,
        "helpful_rate": round(helpful_count / rated_count * 100, 1) if rated_count > 0 else 0,
    }


async def get_chat_logs(
    wedding_id,
    db: AsyncSession,
    limit: int = 50,
    offset: int = 0,
    session_id: Optional[str] = None,
) -> dict:
    """Get chat logs for admin view."""
    query = (
        select(ChatbotLog)
        .where(ChatbotLog.wedding_id == wedding_id)
        .order_by(ChatbotLog.created_at.desc())
    )
    if session_id:
        query = query.where(ChatbotLog.session_id == session_id)

    # Count total
    count_query = (
        select(func.count(ChatbotLog.id))
        .where(ChatbotLog.wedding_id == wedding_id)
    )
    if session_id:
        count_query = count_query.where(ChatbotLog.session_id == session_id)
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Get page
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    logs = result.scalars().all()

    return {
        "total": total,
        "logs": [
            {
                "id": str(log.id),
                "guest_id": str(log.guest_id) if log.guest_id else None,
                "session_id": log.session_id,
                "user_message": log.user_message,
                "bot_response": log.bot_response,
                "language": log.language,
                "topic_detected": log.topic_detected,
                "was_helpful": log.was_helpful,
                "could_not_answer": log.could_not_answer,
                "created_at": log.created_at.isoformat() if log.created_at else None,
            }
            for log in logs
        ],
    }
