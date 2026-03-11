"""convert_watched_to_status

Revision ID: c3p0e7f2a1d8
Revises: b2c9999537da
Create Date: 2026-02-18 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'c3p0e7f2a1d8'
down_revision: Union[str, Sequence[str], None] = 'b2c9999537da'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: Add status column alongside watched (safe migration)."""
    # Add new status column
    op.execute("""
        ALTER TABLE movies
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'upcoming'
    """)
    
    # Migrate existing data: Convert watched boolean to status string
    op.execute("""
        UPDATE movies
        SET status = CASE
            WHEN watched = TRUE THEN 'watched'
            WHEN watched = FALSE THEN 'upcoming'
            ELSE 'upcoming'
        END
        WHERE status = 'upcoming'
    """)
    
    # Add constraint to ensure valid status values
    op.execute("""
        ALTER TABLE movies
        ADD CONSTRAINT IF NOT EXISTS status_check CHECK (status IN ('watched', 'upcoming', 'streaming'))
    """)
    
    # Create new index on status column
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_movies_status ON movies(status)
    """)


def downgrade() -> None:
    """Downgrade schema: Remove status column."""
    op.execute("""
        DROP INDEX IF EXISTS idx_movies_status
    """)
    
    op.execute("""
        ALTER TABLE movies
        DROP CONSTRAINT IF EXISTS status_check
    """)
    
    op.execute("""
        ALTER TABLE movies
        DROP COLUMN IF EXISTS status
    """)

    
    # Drop status column
    op.execute("""
        ALTER TABLE movies
        DROP COLUMN status
    """)
    
    # Recreate old index
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_movies_watched ON movies(watched)
    """)
