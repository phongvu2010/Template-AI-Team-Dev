# Database Layer Rules (`src/db/AGENTS.md`)

Quy tắc bắt buộc khi bất kỳ Agent nào (`db-dev`, `qa-tester`, `code-reviewer`) thao tác trong thư mục `src/db/`:

---

## 1. Rào Chắn An Toàn Dòng Lệnh & Phân Quyền (CLI Guardrails)
- **Quyền sở hữu File**: Tác tử `db-dev` chỉ được tạo và chỉnh sửa file trong `src/db/`. Tuyệt đối không can thiệp vào `src/backend/` hay `src/frontend/`.
- **Lệnh được phép**:
  - `.venv/bin/ruff check src/db/`
  - `python3 -m py_compile src/db/...`
  - `alembic revision --autogenerate -m "<slug>"` & `alembic upgrade head` (khi PostgreSQL container hoạt động)
  - `PYTHONPATH=src .venv/bin/python src/db/seeds/runner.py`
- **Lệnh cấm tuyệt đối**:
  - Cấm `rm -rf`, `dropdb`, `git reset`, `git checkout`.
  - Cấm chạy `pip install` trần trong sandbox. Khi cần thêm thư viện mới, cập nhật `pyproject.toml` và cắm cờ `[DEPENDENCY REQUIRED]`.
  - Cấm gọi lệnh `pytest`, `ruff`, `python` trần không rõ virtualenv.

---

## 2. Tuân Thủ Hợp Đồng Dữ Liệu Xuyên Tầng (Contract Alignment)
- Tên bảng, tên cột và kiểu dữ liệu phải khớp 100% với mục **Cross-Layer Data Contract Matrix** trong `docs/specs/<feature-slug>/plan.md`.
- **Casing**: Toàn bộ tên cột và định danh bảng sử dụng chuẩn **`snake_case`**.
- **SQLAlchemy 2.0 Typing**: Bắt buộc dùng `DeclarativeBase`, `Mapped[...]` và `mapped_column(...)`. Không dùng `Column()` của SQLAlchemy 1.x.
- **Cross-DB Type Safety (SQLite Test Compatibility)**:
  - **UUID Khóa chính**: Sử dụng `from sqlalchemy import Uuid` kèm `default=uuid.uuid4` (hoặc kế thừa `UUIDPrimaryKeyMixin` từ `src/db/base.py`). Tuyệt đối không dùng `server_default=text("gen_random_uuid()")` hoặc kiểu dialect `UUID` trần.
  - **Mảng dữ liệu**: SQLite không hỗ trợ `ARRAY`. Dùng `from sqlalchemy import JSON` với `default=list` cho các mảng chuỗi (`list[str]`) hoặc variant `JSON().with_variant(ARRAY(String), "postgresql")`.
  - **JSON/JSONB**: Dùng `JSON` chuẩn hoặc variant với `JSONB`.
- **Chống lỗi N+1**: Toàn bộ quan hệ nạp trong `AsyncSession` phải sử dụng `selectinload()` hoặc `joinedload()`.

---

## 3. Tổ Chức Models, Migrations & Seeds
- **Auto-Discovery Models**: File `src/db/models/__init__.py` tự động nạp mọi model con cho Alembic autogenerate.
- **Phân tách Migration & Testing**:
  - SQLite in-memory test (`:memory:`) được sinh bảng tự động qua `Base.metadata.create_all` trong `conftest.py`. Không áp dụng Alembic cho SQLite in-memory test.
  - Alembic chỉ dùng cho PostgreSQL runtime (`docker compose up -d postgres`).
  - Trong sandbox không có PostgreSQL, tự tạo file migration chuẩn trong `src/db/migrations/versions/` có đủ `upgrade()` và `downgrade()`.
- **Seed Data**: Đặt tại `src/db/seeds/<module>_seed.py`, đảm bảo tính idempotent (kiểm tra tồn tại trước khi add). Chạy qua `PYTHONPATH=src .venv/bin/python src/db/seeds/runner.py`.

---

## 4. Tham Gia Vòng Lặp Sửa Lỗi (Feedback Loop Protocol)
Khi nhận tin nhắn điều phối `[SELF-HEALING ACTION REQUIRED]` từ QA hoặc `[REVIEW-FIX ACTION REQUIRED]` từ Reviewer:
1. Phân tích nguyên nhân và **chỉ chỉnh sửa trong phạm vi `src/db/`**.
2. Kiểm tra smoke check: `.venv/bin/ruff check src/db/` và `python3 -m py_compile src/db/...`.
3. Gửi thông điệp phản hồi `[FIX-COMPLETED]` cho Tech Lead Orchestrator:
   ```text
   [FIX-COMPLETED]
   - Feature: <feature-slug>
   - Iteration: <iteration_number>
   - Target Agent: db-dev
   - Modified Files: src/db/...
   - Resolved Bug/Finding IDs: <BUG-01 hoặc REV-01>
   - Summary of Fix: <tóm tắt ngắn giải pháp đã thực hiện>
   ```
