from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSON
import uuid

from app.models.base import Base


class FoodMenu(Base):
    __tablename__ = "food_menus"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    wedding_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("weddings.id"),
        nullable=False
    )
    event_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    menu_items: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    dietary_options_available: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    wedding: Mapped["Wedding"] = relationship("Wedding", back_populates="food_menus")


from app.models.wedding import Wedding
