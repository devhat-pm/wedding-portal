"""add story fields and activity coordinates

Revision ID: a1b2c3d4e5f6
Revises: f5a6b7c8d9e0
Create Date: 2026-02-27 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'f5a6b7c8d9e0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('weddings', sa.Column('story_title', sa.String(300), nullable=True))
    op.add_column('weddings', sa.Column('story_content', sa.Text(), nullable=True))
    op.add_column('weddings', sa.Column('story_image_url', sa.String(), nullable=True))
    op.add_column('activities', sa.Column('latitude', sa.Float(), nullable=True))
    op.add_column('activities', sa.Column('longitude', sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column('activities', 'longitude')
    op.drop_column('activities', 'latitude')
    op.drop_column('weddings', 'story_image_url')
    op.drop_column('weddings', 'story_content')
    op.drop_column('weddings', 'story_title')
