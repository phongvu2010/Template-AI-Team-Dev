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
