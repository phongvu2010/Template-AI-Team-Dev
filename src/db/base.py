"""Database Base & Mixins for SQLAlchemy 2.0 (PostgreSQL / Async)."""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, MetaData, Uuid, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

POSTGRES_INDEXES_NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy 2.0 declarative models."""

    metadata = MetaData(naming_convention=POSTGRES_INDEXES_NAMING_CONVENTION)


class UUIDPrimaryKeyMixin:
    """UUID Primary Key generator using Python-level uuid.uuid4.

    Ensures 100% cross-DB compatibility between SQLite in-memory test suites
    and PostgreSQL runtime without relying on engine-specific SQL functions.
    """

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
    )


class TimestampMixin:
    """Standard created_at and updated_at timezone-aware timestamp columns."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
