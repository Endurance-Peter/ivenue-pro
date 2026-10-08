"""Add venue publication state and local image metadata.

Revision ID: 0002_venue_images_and_status
Revises: 0001_initial_auth_schema
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "0002_venue_images_and_status"
down_revision: str | None = "0001_initial_auth_schema"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("venues", sa.Column("status", sa.String(length=20), server_default="published", nullable=False))
    op.create_index("ix_venues_status", "venues", ["status"], unique=False)
    op.create_table(
        "venue_images",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("venue_id", sa.String(length=36), nullable=False),
        sa.Column("storage_key", sa.String(length=255), nullable=False),
        sa.Column("url", sa.String(length=500), nullable=False),
        sa.Column("is_cover", sa.Boolean(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["venue_id"], ["venues.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_venue_images_venue_id", "venue_images", ["venue_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_venue_images_venue_id", table_name="venue_images")
    op.drop_table("venue_images")
    op.drop_index("ix_venues_status", table_name="venues")
    op.drop_column("venues", "status")