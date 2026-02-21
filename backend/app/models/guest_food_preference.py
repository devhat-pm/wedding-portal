from sqlalchemy import String, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSON
import uuid
import enum

from app.models.base import Base


class MealSizePreference(str, enum.Enum):
    regular = "regular"
    small = "small"
    large = "large"


class GuestFoodPreference(Base):
    __tablename__ = "guest_food_preferences"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    guest_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("guests.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )
    dietary_restrictions: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    allergies: Mapped[str | None] = mapped_column(Text, nullable=True)
    cuisine_preferences: Mapped[str | None] = mapped_column(Text, nullable=True)
    special_requests: Mapped[str | None] = mapped_column(Text, nullable=True)
    meal_size_preference: Mapped[MealSizePreference | None] = mapped_column(
        SQLEnum(MealSizePreference),
        nullable=True
    )

    # Relationships
    guest: Mapped["Guest"] = relationship("Guest", back_populates="food_preference")


from app.models.guest import Guest
