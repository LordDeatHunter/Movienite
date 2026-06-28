"""add_tmdb_url_column

Revision ID: d31c2a27ee1d
Revises: b2c9999537da
Create Date: 2026-06-29 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'd31c2a27ee1d'
down_revision: Union[str, Sequence[str], None] = 'b2c9999537da'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("""
        ALTER TABLE movies
            ADD COLUMN IF NOT EXISTS tmdb_url TEXT
    """)


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("""
        ALTER TABLE movies
            DROP COLUMN IF EXISTS tmdb_url
    """)
