import logging

from groq import Groq
from app.config import settings
from typing import Optional

logger = logging.getLogger(__name__)

client = Groq(api_key=settings.GROQ_API_KEY)

SYSTEM_PROMPT = """You are a helpful AI assistant for a Wedding Guest Management Portal. You help guests and wedding administrators with:

1. WEDDING-RELATED QUESTIONS:
   - RSVP process and how to respond
   - Travel arrangements and flight information
   - Hotel recommendations and booking help
   - Dress code guidance and color palette suggestions
   - Food preferences and dietary requirements
   - Wedding activities and event schedule
   - Uploading photos and videos

2. GENERAL ASSISTANCE:
   - Answer general knowledge questions
   - Provide helpful suggestions
   - Be warm, friendly, and celebratory (it's a wedding!)

GUIDELINES:
- Be concise but helpful
- Use a warm, celebratory tone appropriate for weddings
- If asked about specific guest data, remind them to check their personalized link
- For technical issues, suggest contacting the wedding organizers
- You can use emojis sparingly to add warmth

CONTEXT: This is for a destination wedding spanning 3 days with multiple events."""


async def get_chat_response(
    message: str,
    conversation_history: list = None,
    wedding_context: Optional[dict] = None,
) -> str:
    """Get AI response from Groq."""

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # Add wedding context if available
    if wedding_context:
        context_msg = (
            f"\nCurrent wedding details:\n"
            f"- Couple: {wedding_context.get('couple_names', 'Not specified')}\n"
            f"- Date: {wedding_context.get('wedding_date', 'Not specified')}\n"
            f"- Venue: {wedding_context.get('venue_name', 'Not specified')}\n"
        )
        messages.append({"role": "system", "content": context_msg})

    # Add conversation history (last 10 messages)
    if conversation_history:
        for msg in conversation_history[-10:]:
            messages.append({"role": msg["role"], "content": msg["content"]})

    # Add current message
    messages.append({"role": "user", "content": message})

    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
            top_p=0.9,
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Groq API error: {e}")
        return (
            "I apologize, but I'm having trouble connecting right now. "
            "Please try again in a moment, or contact the wedding organizers for assistance."
        )


async def get_streaming_response(
    message: str,
    conversation_history: list = None,
    wedding_context: Optional[dict] = None,
):
    """Get streaming AI response from Groq."""

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    if wedding_context:
        context_msg = (
            f"Wedding: {wedding_context.get('couple_names', '')} "
            f"on {wedding_context.get('wedding_date', '')}"
        )
        messages.append({"role": "system", "content": context_msg})

    if conversation_history:
        for msg in conversation_history[-10:]:
            messages.append({"role": msg["role"], "content": msg["content"]})

    messages.append({"role": "user", "content": message})

    try:
        stream = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
            stream=True,
        )
        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    except Exception as e:
        yield f"Error: {str(e)}"
