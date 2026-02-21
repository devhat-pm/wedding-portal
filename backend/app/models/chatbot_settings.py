from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSON
from datetime import datetime
import uuid

from app.models.base import Base, TimestampMixin


class ChatbotSettings(Base, TimestampMixin):
    __tablename__ = "chatbot_settings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    wedding_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("weddings.id"),
        unique=True,
        nullable=False
    )
    chatbot_name: Mapped[str] = mapped_column(
        String(100),
        default="Rada"
    )
    greeting_message_en: Mapped[str | None] = mapped_column(
        Text,
        default="Hello! I'm Rada, your wedding assistant. How can I help you today?"
    )
    greeting_message_ar: Mapped[str | None] = mapped_column(
        Text,
        default="\u0645\u0631\u062d\u0628\u0627\u064b! \u0623\u0646\u0627 \u0631\u0627\u062f\u0627\u060c \u0645\u0633\u0627\u0639\u062f\u0629 \u0627\u0644\u0632\u0641\u0627\u0641 \u0627\u0644\u062e\u0627\u0635\u0629 \u0628\u0643. \u0643\u064a\u0641 \u064a\u0645\u0643\u0646\u0646\u064a \u0645\u0633\u0627\u0639\u062f\u062a\u0643 \u0627\u0644\u064a\u0648\u0645\u061f"
    )
    suggested_questions_en: Mapped[list | None] = mapped_column(
        JSON,
        default=lambda: [
            "What's the schedule?",
            "Where is the venue?",
            "How do I RSVP?",
            "Hotel recommendations?",
        ]
    )
    suggested_questions_ar: Mapped[list | None] = mapped_column(
        JSON,
        default=lambda: [
            "\u0645\u0627 \u0647\u0648 \u0627\u0644\u062c\u062f\u0648\u0644 \u0627\u0644\u0632\u0645\u0646\u064a\u061f",
            "\u0623\u064a\u0646 \u0645\u0643\u0627\u0646 \u0627\u0644\u062d\u0641\u0644\u061f",
            "\u0643\u064a\u0641 \u0623\u0624\u0643\u062f \u062d\u0636\u0648\u0631\u064a\u061f",
            "\u062a\u0648\u0635\u064a\u0627\u062a \u0627\u0644\u0641\u0646\u0627\u062f\u0642\u061f",
        ]
    )

    # Relationships
    wedding: Mapped["Wedding"] = relationship("Wedding")


from app.models.wedding import Wedding
