from sqlalchemy import String, Text, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.models.base import Base


class GuestDressPreference(Base):
    __tablename__ = "guest_dress_preferences"
    __table_args__ = (
        UniqueConstraint('guest_id', 'dress_code_id', name='uq_guest_dress_code'),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    guest_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("guests.id", ondelete="CASCADE"),
        nullable=False
    )
    dress_code_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("dress_codes.id"),
        nullable=False
    )
    planned_outfit_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    color_choice: Mapped[str | None] = mapped_column(String(50), nullable=True)
    needs_shopping_assistance: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    guest: Mapped["Guest"] = relationship("Guest", back_populates="dress_preferences")
    dress_code: Mapped["DressCode"] = relationship("DressCode", back_populates="guest_preferences")


from app.models.guest import Guest
from app.models.dress_code import DressCode
