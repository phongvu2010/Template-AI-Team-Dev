---
name: db-sqlalchemy-alembic
description: >-
  PostgreSQL, SQLAlchemy 2.0 (Async), and Alembic patterns and conventions for the Database Dev Team (db-dev). Activate when designing database models, writing async repositories, configuring indexes/constraints, or creating Alembic migrations in src/db/.
---

# Database Team Runbook: PostgreSQL + SQLAlchemy 2.0 + Alembic

## 1. Cấu trúc Thư mục Chuẩn (`src/db/`)

```text
src/db/
├── __init__.py
├── base.py                   # DeclarativeBase + Naming Convention + TimestampMixin
├── session.py                # AsyncEngine, async_sessionmaker, get_db_session
├── models/                   # SQLAlchemy 2.0 Declarative Models
│   └── __init__.py
├── repositories/             # Các hàm truy vấn AsyncSession tái sử dụng
│   └── __init__.py
└── migrations/               # Alembic migrations (versions/)
```

## 2. Mẫu `DeclarativeBase` với Naming Convention Chuẩn (`src/db/base.py`)

Luôn khai báo `MetaData(naming_convention=...)` để Alembic tự động đặt tên khoá ngoại, index và constraint nhất quán:

```python
from datetime import datetime
from sqlalchemy import DateTime, MetaData, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

POSTGRES_INDEXES_NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=POSTGRES_INDEXES_NAMING_CONVENTION)


class TimestampMixin:
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
```

## 3. Quy tắc Viết Truy vấn Async (`src/db/repositories/`)
- Sử dụng `from sqlalchemy import select, update, delete`.
- Khi cần tải bảng liên kết (`relationship`), bắt buộc dùng `select(Model).options(selectinload(Model.items))` để tránh lỗi `MissingGreenlet` và lỗi hiệu năng **N+1 Query**.
- Dùng `await session.flush()` và `await session.refresh(instance)` trong repository để lấy ID/default values trước khi tầng service `commit()`.
