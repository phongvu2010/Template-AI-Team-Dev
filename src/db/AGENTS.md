# Database Layer Rules (`db/AGENTS.md`)

Quy tắc bắt buộc khi bất kỳ Agent nào (`db-dev`, `qa-tester`, `code-reviewer`) thao tác trong thư mục `db/`:

1. **SQLAlchemy 2.0 Typing Bắt buộc**:
   - Sử dụng `DeclarativeBase`, `Mapped[...]` và `mapped_column(...)`.
   - Không sử dụng `Column()` kiểu cũ hoặc `session.query()` của SQLAlchemy 1.x.
2. **Async-First (`AsyncSession`)**:
   - Toàn bộ kết nối và truy vấn sử dụng `AsyncEngine` và `AsyncSession` (`sqlalchemy.ext.asyncio`).
   - Luôn chỉ định rõ chiến lược tải quan hệ (`selectinload`, `joinedload`) trong các hàm repository để ngăn chặn lỗi `MissingGreenlet` và bài toán **N+1 Query**.
3. **Toàn vẹn Dữ liệu & Hiệu năng**:
   - Mọi bảng phải có khoá chính (`primary_key=True`), `created_at` và `updated_at` (`DateTime(timezone=True)`, `server_default=func.now()`).
   - Mọi cột khoá ngoại (`ForeignKey`) và cột thường xuyên dùng để lọc/sắp xếp bắt buộc phải có `index=True` hoặc khai báo trong `__table_args__`.
4. **Alembic Migrations**:
   - Mỗi thay đổi schema phải đi kèm migration có cả `upgrade()` và `downgrade()` có thể hoàn tác an toàn.
5. **Tuân thủ Hợp đồng**:
   - Tên bảng, tên cột và kiểu dữ liệu phải khớp chính xác với mục **Data Contract** trong `docs/specs/<feature-slug>/plan.md`.
6. **Tổ chức Models & Auto-Discovery (`src/db/models/`)**:
   - Mỗi model được định nghĩa trong một module riêng biệt (ví dụ `src/db/models/item.py`).
   - File `src/db/models/__init__.py` đã cài đặt cơ chế tự động tìm và nạp (auto-discovery) toàn bộ các module con để `Base.metadata` luôn nhận diện đầy đủ các bảng khi chạy `alembic revision --autogenerate`. Khuyến khích xuất khẩu rõ ràng trong `__all__` nếu cần.
7. **Tương thích Testing (Cross-DB Compatibility cho SQLite Fallback)**:
   - Bộ kiểm thử tự động sử dụng `sqlite+aiosqlite:///:memory:` để chạy cô lập nhanh mà không cần daemon PostgreSQL.
   - **UUID Khóa chính**: Sử dụng `from sqlalchemy import Uuid` với `default=uuid.uuid4` ở tầng Python (hoặc kế thừa `UUIDPrimaryKeyMixin` từ `src/db/base.py`). **Tuyệt đối không dùng** `server_default=text("gen_random_uuid()")` hoặc kiểu dialect `UUID` trần của PostgreSQL vì SQLite test không có hàm native `gen_random_uuid()`.
   - **Mảng danh sách (ARRAY vs JSON)**: SQLite không hỗ trợ kiểu `ARRAY`. Mặc định dùng `from sqlalchemy import JSON` với `default=list` cho các mảng chuỗi (`list[str]`). Nếu production cần PostgreSQL native `ARRAY`, bắt buộc dùng variant: `JSON().with_variant(ARRAY(String), "postgresql")`.
   - **JSON / JSONB**: Ưu tiên dùng `JSON` chuẩn hoặc `JSON().with_variant(JSONB, "postgresql")` để tránh `CompileError` trên SQLite.
8. **Quy chuẩn Phân tách Alembic Migration & SQLite Testing**:
   - **SQLite In-Memory (`:memory:`)**: Dùng độc quyền cho testing tự động (`pytest`). Schema được khởi tạo tức thì qua `Base.metadata.create_all(conn)` trong `conftest.py`. **Tuyệt đối không chạy Alembic migrations trên SQLite in-memory**.
   - **PostgreSQL Thật (Docker / Production)**: Dùng cho Runtime thực tế và quản lý version schema bằng Alembic trong `src/db/migrations/versions/`.
   - **Quy trình tạo Migration của `db-dev`**:
     1. *Khi Docker PostgreSQL đang chạy*: Chạy `alembic revision --autogenerate -m "<slug>"`, kiểm tra file sinh ra và chạy `alembic upgrade head`.
     2. *Khi chạy trong môi trường cô lập / Sandbox không có PostgreSQL*: `db-dev` tự tay tạo/viết file migration trong `src/db/migrations/versions/<timestamp>_<slug>.py` sử dụng các lệnh chuẩn `op.create_table(...)` có đủ `upgrade()` và `downgrade()`. Không cố gọi lệnh trần `alembic revision --autogenerate` để tránh bị connection timeout.
     3. *Kiểm tra chất lượng*: Luôn chạy `.venv/bin/ruff check src/db/` và `python3 -m py_compile src/db/migrations/versions/*.py`.
9. **Kịch bản Seed Data cho Local Dev (`src/db/seeds/`)**:
   - Khi phát triển tính năng mới cần nạp dữ liệu mẫu khởi đầu, tạo file `src/db/seeds/<module>_seed.py` chứa hàm `async def seed(session: AsyncSession)` (hoặc dùng `@register_seed`).
   - Đảm bảo tính idempotent (kiểm tra dữ liệu đã tồn tại chưa trước khi insert).
   - Thử nghiệm chạy seed qua lệnh: `PYTHONPATH=src .venv/bin/python src/db/seeds/runner.py`.

