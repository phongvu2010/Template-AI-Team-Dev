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

## 4. Cơ chế Auto-Discovery cho Models (`src/db/models/__init__.py`)
- Mọi model SQLAlchemy mới được tạo trong `src/db/models/<resource>.py`.
- File `src/db/models/__init__.py` sử dụng cơ chế tự động tìm nạp (`pkgutil.iter_modules`) toàn bộ các model module khi `import db.models` được gọi từ `env.py`.
- Nhờ cơ chế này, lệnh `alembic revision --autogenerate -m "..."` luôn phát hiện đầy đủ metadata của các bảng mới mà không bao giờ gặp lỗi thiếu model do quên export.

## 5. Quy tắc Tương thích Kiểu Dữ liệu (Cross-DB Compatibility cho SQLite Test)
Để bộ kiểm thử tự động với SQLite async in-memory (`conftest.py`) chạy hoàn hảo song song với PostgreSQL production:
- **UUID Khóa chính**:
  - Dùng `from sqlalchemy import Uuid` kết hợp sinh giá trị ở tầng Python: `default=uuid.uuid4` (hoặc kế thừa `UUIDPrimaryKeyMixin` từ `src/db/base.py`).
  - **Tuyệt đối không dùng** `server_default=text("gen_random_uuid()")` hoặc kiểu dialect `from sqlalchemy.dialects.postgresql import UUID` trần vì SQLite in-memory không có hàm native `gen_random_uuid()`, sẽ gây lỗi test crash.
- **Mảng danh sách (ARRAY vs JSON)**:
  - SQLite **không hỗ trợ** kiểu native `ARRAY`. Để lưu mảng (ví dụ `tags: list[str]`, `roles: list[str]`), ưu tiên dùng `JSON` chuẩn:
    ```python
    tags: Mapped[list[str]] = mapped_column(JSON, default=list)
    ```
  - Nếu bắt buộc dùng PostgreSQL native `ARRAY` trong production (để tận dụng GIN indexing), hãy dùng variant để SQLite test nạp dạng JSON an toàn:
    ```python
    from sqlalchemy import JSON
    from sqlalchemy.dialects.postgresql import ARRAY, String

    tags: Mapped[list[str]] = mapped_column(
        JSON().with_variant(ARRAY(String), "postgresql"),
        default=list,
    )
    ```
- **JSON / JSONB**: Sử dụng `from sqlalchemy import JSON` chuẩn hoặc variant:
  ```python
  from sqlalchemy import JSON
  from sqlalchemy.dialects.postgresql import JSONB

  # Hoạt động an toàn trên cả SQLite (test) và PostgreSQL (runtime)
  metadata_col: Mapped[dict] = mapped_column(JSON().with_variant(JSONB, "postgresql"), default=dict)
  ```
- **Boolean / Enums**: Dùng `Boolean` và `Enum(NativeEnum=False)` hoặc Python `StrEnum` để tương thích tự nhiên giữa cả hai engine.

## 6. Quy chuẩn Quản lý Migration: PostgreSQL Live vs SQLite Testing
- **SQLite In-Memory (`:memory:`)**: Dùng cho `qa-tester` kiểm thử cô lập tức thì. Schema được tự động sinh bằng `Base.metadata.create_all(conn)` trong `conftest.py`. Không áp dụng Alembic migration cho SQLite in-memory.
- **PostgreSQL Thật (Docker/Production)**: Schema được quản lý bằng Alembic (`src/db/migrations/versions/`).
- **Quy trình Migration của `db-dev`**:
  - *Nếu Docker PostgreSQL đang chạy*: Khởi chạy `docker compose up -d postgres`, thực thi `alembic revision --autogenerate -m "<slug>"`, kiểm tra file sinh ra và chạy `alembic upgrade head`.
  - *Nếu trong Sandbox cô lập không có PostgreSQL*: Tự viết file migration tại `src/db/migrations/versions/<timestamp>_<slug>.py` với đầy đủ `op.create_table(...)` cho hàm `upgrade()` và `op.drop_table(...)` cho hàm `downgrade()`. Tuyệt đối không gọi lệnh trần autogenerate tránh treo kết nối.
  - *Kiểm tra*: Luôn chạy `.venv/bin/ruff check src/db/` và `python3 -m py_compile src/db/migrations/versions/*.py`.

## 7. Kịch bản Seed Data cho Môi trường Phát triển Cục bộ (`src/db/seeds/`)
Khi xây dựng tính năng mới cần nạp dữ liệu mẫu ban đầu (admin user, categories mặc định, sample items):
1. **Tạo module seed**: Tạo file `src/db/seeds/<module>_seed.py` với hàm `async def seed(session: AsyncSession)` (hoặc dùng decorator `@register_seed`).
2. **Tính Idempotent (Bảo vệ dữ liệu trùng lặp)**: Luôn kiểm tra sự tồn tại của dữ liệu (bằng `select()`) trước khi `session.add()` để script có thể chạy nhiều lần mà không bị lỗi Unique Constraint.
3. **Thực thi Seeding**: Script `src/db/seeds/runner.py` tự động phát hiện mọi module `*_seed.py`. Người dùng hoặc dev chỉ cần chạy:
   ```bash
   PYTHONPATH=src .venv/bin/python src/db/seeds/runner.py
   ```



