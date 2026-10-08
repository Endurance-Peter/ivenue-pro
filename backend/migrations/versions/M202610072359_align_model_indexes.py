"""Align venue and reservation indexes with SQLAlchemy models.

Revision ID: 0003_align_model_indexes
Revises: 0002_venue_images_and_status
"""

from collections.abc import Sequence

from alembic import op


revision: str = "0003_align_model_indexes"
down_revision: str | None = "0002_venue_images_and_status"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_index("ix_reservations_id", "reservations", ["id"], unique=False)
    op.drop_index("ix_venues_host_id", table_name="venues")
    op.create_index("ix_venues_id", "venues", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_venues_id", table_name="venues")
    op.create_index("ix_venues_host_id", "venues", ["host_id"], unique=False)
    op.drop_index("ix_reservations_id", table_name="reservations")
