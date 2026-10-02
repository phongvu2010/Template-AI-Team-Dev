---
name: db-sqlalchemy-alembic
description: >-
  PostgreSQL, SQLAlchemy 2.0 (Async), and Alembic patterns and conventions for the Database Dev Team (db-dev). Activate when designing database models, writing async repositories, configuring indexes/constraints, or creating Alembic migrations in src/db/.
---

# Database Team Runbook: PostgreSQL + SQLAlchemy 2.0 + Alembic

Runbook này hướng dẫn `db-dev` xây dựng tầng dữ liệu hiệu năng cao, tuân thủ **Cross-Layer Data Contract Matrix**, rào chắn an toàn dòng lệnh (**CLI Guardrails**) và tham gia vòng lặp tự sửa lỗi (**Feedback Loop**).

---

## 1. Rào Chắn An Toàn Dòng Lệnh (CLI Guardrails)
- **Quyền sở hữu**: Chỉ tạo/sửa file trong `src/db/`.
- **Lệnh được phép**:
  - `.venv/bin/ruff check src/db/`
  - `python3 -m py_compile src/db/...`
  - `alembic ...` (khi PostgreSQL container hoạt động)
  - `PYTHONPATH=src .venv/bin/python src/db/seeds/runner.py`
- **Lệnh cấm**: Cấm `rm -rf`, `dropdb`; cấm chạy `pip install` trần trong sandbox; cấm sửa file ngoài `src/db/`.

---

## 2. Cấu Trúc Thư Mục Chuẩn (`src/db/`)

```text
src/db/
├── __init__.py
├── base.py                   # DeclarativeBase + Naming Convention + TimestampMixin + UUIDPrimaryKeyMixin
├── session.py                # AsyncEngine, async_sessionmaker, get_db_session
├── models/                   # SQLAlchemy 2.0 Declarative Models (Auto-discovery)
│   └── __init__.py
├── repositories/             # Các hàm truy vấn AsyncSession tái sử dụng
│   └── __init__.py
├── seeds/                    # Kịch bản nạp dữ liệu mẫu cho dev local
│   ├── runner.py
│   └── __init__.py
└── migrations/               # Alembic migrations (versions/)
```

---

## 3. Quy Chuẩn Đồng Bộ Hợp Đồng (Contract Synchronization)

1. **Thống nhất Casing `snake_case`**: Toàn bộ tên bảng và tên cột sử dụng chuẩn `snake_case` khớp 1:1 với `docs/specs/<feature-slug>/plan.md`.
2. **Kế thừa Base Mixins Chuẩn (`src/db/base.py`)**:
   - Sử dụng `UUIDPrimaryKeyMixin` (sinh UUID ở tầng Python với `default=uuid.uuid4`).
   - Kế thừa `TimestampMixin` (`created_at` và `updated_at` có timezone).
3. **Cross-DB Type Safety (Tương thích SQLite Test & Postgres Runtime)**:
   - **UUID**: Dùng `from sqlalchemy import Uuid` kèm `default=uuid.uuid4`. Tuyệt đối không dùng `server_default=text("gen_random_uuid()")` hoặc kiểu dialect `UUID` trần.
   - **Mảng dữ liệu**: Dùng `from sqlalchemy import JSON` với `default=list` (hoặc variant với `ARRAY(String)` cho PostgreSQL).
   - **JSON / JSONB**: Dùng `JSON` chuẩn hoặc variant với `JSONB`.

---

## 4. Chống Lỗi N+1 & Viết Repository Async
- Khi cần nạp quan hệ liên kết trong môi trường async, bắt buộc thêm `.options(selectinload(Model.relation_name))` vào câu lệnh `select()`.
- Repository tập trung trả về đối tượng Model hoặc danh sách cho tầng Backend Service, không thực hiện `commit()` trực tiếp trong repository (để service quản lý transaction).

---

## 5. Tham Gia Vòng Lặp Sửa Lỗi (Feedback Loop)
Khi nhận tin nhắn `[SELF-HEALING ACTION REQUIRED]` từ QA hoặc `[REVIEW-FIX ACTION REQUIRED]` từ Reviewer:
1. Xác định nguyên nhân lỗi (sai sót model, thiếu index, vi phạm N+1 query).
2. Sửa lỗi trong `src/db/`, chạy `.venv/bin/ruff check src/db/`.
3. Phản hồi cho Tech Lead bằng thông điệp `[FIX-COMPLETED]`.
