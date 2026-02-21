"""add song_requests notes_to_couple and activity dress/food fields

Revision ID: c2d3e4f5a6b7
Revises: b1a2c3d4e5f6
Create Date: 2026-02-21 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'c2d3e4f5a6b7'
down_revision: Union[str, None] = 'b1a2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns to guests table
    op.add_column('guests', sa.Column('song_requests', sa.Text(), nullable=True))
    op.add_column('guests', sa.Column('notes_to_couple', sa.Text(), nullable=True))

    # Add new columns to activities table
    op.add_column('activities', sa.Column('dress_code_info', sa.Text(), nullable=True))
    op.add_column('activities', sa.Column('dress_colors', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column('activities', sa.Column('food_description', sa.Text(), nullable=True))
    op.add_column('activities', sa.Column('dietary_options', postgresql.JSON(astext_type=sa.Text()), nullable=True))


def downgrade() -> None:
    # Remove columns from activities table
    op.drop_column('activities', 'dietary_options')
    op.drop_column('activities', 'food_description')
    op.drop_column('activities', 'dress_colors')
    op.drop_column('activities', 'dress_code_info')

    # Remove columns from guests table
    op.drop_column('guests', 'notes_to_couple')
    op.drop_column('guests', 'song_requests')
