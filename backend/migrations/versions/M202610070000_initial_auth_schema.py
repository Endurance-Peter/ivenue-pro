"""Create the initial authentication schema.

Revision ID: 0001_initial_auth_schema
Revises:
Create Date: 2026-10-07
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "0001_initial_auth_schema"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("phone", sa.String(length=20), nullable=False),
        sa.Column("full_name", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=20), server_default="customer", nullable=False),
        sa.Column("is_verified", sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_phone", "users", ["phone"], unique=True)
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_role", "users", ["role"], unique=False)

    op.create_table(
        "venues",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("host_id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("capacity_min", sa.Integer(), nullable=False),
        sa.Column("capacity_max", sa.Integer(), nullable=False),
        sa.Column("base_price_per_day", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("address", sa.String(length=255), nullable=False),
        sa.Column("city", sa.String(length=100), nullable=False),
        sa.Column("state", sa.String(length=100), nullable=False),
        sa.Column("geo_location", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["host_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_venues_host_id", "venues", ["host_id"], unique=False)
    op.create_index("ix_venues_city", "venues", ["city"], unique=False)
    op.create_index("ix_venues_state", "venues", ["state"], unique=False)

    op.create_table(
        "reservations",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("venue_id", sa.String(length=36), nullable=False),
        sa.Column("customer_id", sa.String(length=36), nullable=False),
        sa.Column("booking_date", sa.Date(), nullable=False),
        sa.Column("status", sa.String(length=50), server_default="Pending", nullable=False),
        sa.Column("total_price", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("escrow_status", sa.String(length=50), server_default="Held", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["venue_id"], ["venues.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["customer_id"], ["users.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("venue_id", "booking_date", name="unique_venue_date_booking"),
    )
    op.create_index("ix_reservations_venue_id", "reservations", ["venue_id"], unique=False)
    op.create_index("ix_reservations_customer_id", "reservations", ["customer_id"], unique=False)
    op.create_index("ix_reservations_booking_date", "reservations", ["booking_date"], unique=False)

    op.create_table(
        "verification_codes",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("destination", sa.String(length=255), nullable=False),
        sa.Column("purpose", sa.String(length=40), nullable=False),
        sa.Column("code_hash", sa.String(length=64), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("consumed", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_verification_codes_destination", "verification_codes", ["destination"], unique=False)
    op.create_index("ix_verification_codes_purpose", "verification_codes", ["purpose"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_reservations_booking_date", table_name="reservations")
    op.drop_index("ix_reservations_customer_id", table_name="reservations")
    op.drop_index("ix_reservations_venue_id", table_name="reservations")
    op.drop_table("reservations")
    op.drop_index("ix_venues_state", table_name="venues")
    op.drop_index("ix_venues_city", table_name="venues")
    op.drop_index("ix_venues_host_id", table_name="venues")
    op.drop_table("venues")
    op.drop_index("ix_verification_codes_purpose", table_name="verification_codes")
    op.drop_index("ix_verification_codes_destination", table_name="verification_codes")
    op.drop_table("verification_codes")
    op.drop_index("ix_users_role", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_index("ix_users_phone", table_name="users")
    op.drop_table("users")