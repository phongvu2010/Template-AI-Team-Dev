# Backend Layer Rules (`backend/AGENTS.md`)

Quy tắc bắt buộc khi bất kỳ Agent nào (`backend-dev`, `qa-tester`, `code-reviewer`) thao tác trong thư mục `backend/`:

1. **Kiến trúc Phân lớp Rõ ràng (Router -> Service -> DB Repository)**:
   - `app/core/config.py`: Quản lý cấu hình tập trung (`settings = Settings()`, kế thừa `BaseSettings` của `pydantic-settings`), nạp biến môi trường (`.env`), CORS origins, tiền tố API.
   - `app/api/v1/endpoints/`: Định nghĩa router theo từng resource, chỉ xử lý HTTP routing, dependency injection (`Depends`), status code và response model.
   - `app/api/v1/router.py`: Cắm các router con vào `api_router` tập trung đã được mount vào `main.py` tại `/api/v1`.
   - `app/schemas/`: Chỉ sử dụng **Pydantic v2** (`BaseModel`, `Field`, `ConfigDict(from_attributes=True)`, `.model_dump()`, `.model_validate()`). Không dùng `.dict()` hoặc `class Config: orm_mode = True`.
   - `app/services/`: Xử lý toàn bộ logic nghiệp vụ, kiểm tra quyền/điều kiện và quản lý transaction (`await session.commit()`).

2. **Tuân thủ Tuyệt đối API Contract**:
   - Đường dẫn URL, HTTP Method, Query Params, Request/Response JSON và HTTP Status Code phải khớp 100% với mục **API Contract** trong `docs/specs/<feature-slug>/plan.md`.
3. **Bảo mật & Xác thực Dữ liệu**:
   - Mọi trường chuỗi trong Pydantic Request Schema phải giới hạn `min_length` / `max_length`; mọi trường số phải có `ge` / `le` hợp lý.
   - Không bao giờ trả về mật khẩu hash, secret key hoặc raw exception traceback trong response.
4. **Type Annotations & Clean Code**:
   - Khai báo đầy đủ type hints cho tất cả hàm, tham số và giá trị trả về (chuẩn Python 3.11+ `list[str]`, `str | None`).
