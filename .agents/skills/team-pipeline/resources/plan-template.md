# Technical Specification & Execution Plan: `<Feature Name>`

- **Feature Slug**: `<feature-slug>`
- **Author**: `planner` (System Architect)
- **Status**: `READY_FOR_DEV`

---

## 1. Tổng quan & Mục tiêu (Overview & Objectives)
- **Mô tả ngắn gọn**: ...
- **User Stories chính**:
  1. Là một `<role>`, tôi muốn `<action>` để `<benefit>`.

---

## 2. Data Contract — Thiết kế Database (`db-dev` — Đích: `src/db/`)

### 2.1. Bảng & SQLAlchemy Models (`src/db/models/<module>.py`)
| Tên Bảng (`__tablename__`) | Class Model | Cột (`Column`) | Kiểu (`SQLAlchemy / PG`) | Ràng buộc & Index (`Constraints / Index`) |
| :--- | :--- | :--- | :--- | :--- |
| `items` | `Item` | `id` | `Uuid` (Python `default=uuid.uuid4`) | `PK, index=True` |
| `items` | `Item` | `title` | `String(255)` | `nullable=False, index=True` |
| `items` | `Item` | `tags` | `JSON` (hoặc `JSON.with_variant`) | `default=list` |
| `items` | `Item` | `created_at` | `DateTime(timezone=True)` | `server_default=func.now()` |

### 2.2. Relationships & Truy vấn (`src/db/repositories/<module>.py`)
- Quan hệ (`relationship`) và chiến lược eager loading (`selectinload` / `joinedload`).
- Các hàm repository/query cần cung cấp cho `backend-dev` (tên hàm, tham số, kiểu trả về).

### 2.3. Kịch bản Dữ liệu Mẫu Ban đầu (Seed Data — `src/db/seeds/<module>_seed.py`)
- Dữ liệu mẫu cần khởi tạo (nếu có): admin user, danh mục mặc định, sample items.
- Cơ chế kiểm tra trùng lặp (Idempotency check).

---

## 3. API Contract — Hợp đồng Giao tiếp (`backend-dev` & `frontend-dev`)

### Endpoint 1: `<METHOD> /api/v1/<resource>`
- **Mô tả**: ...
- **Query Params**: `page: int = 1`, `size: int = 20`
- **Request Body (`Pydantic Schema` / `TypeScript Interface`)**:
```json
{
  "title": "string (required, max 255)",
  "description": "string | null"
}
```
- **Response `200 OK` / `201 Created`**:
```json
{
  "id": "uuid-or-int",
  "title": "string",
  "description": "string | null",
  "created_at": "2026-10-01T00:00:00Z"
}
```
- **Error Responses**:
  - `400 Bad Request`: Dữ liệu vi phạm quy tắc nghiệp vụ.
  - `404 Not Found`: Không tìm thấy bản ghi.
  - `422 Unprocessable Entity`: Lỗi xác thực schema Pydantic.
- **Wave 1 Mock Fixture (`src/frontend/src/lib/api/mocks/<resource>.ts`)**:
```json
[
  {
    "id": "1",
    "title": "Mẫu dữ liệu kiểm thử Wave 1",
    "description": "Dùng để kiểm thử UI 4 trạng thái khi Backend chưa hoàn tất",
    "created_at": "2026-10-01T00:00:00Z"
  }
]
```

---

## 4. UI & State Architecture — Thiết kế Giao diện (`frontend-dev` — Đích: `src/frontend/`)

- **Routes (`src/frontend/src/app/...`)**:
  - `/...`: Mô tả trang (Server Component / Client Component).
- **Components (`src/frontend/src/components/...`)**:
  - `<ComponentName>`: Props, state và hành vi tương tác.
- **TypeScript Interfaces (`src/frontend/src/types/<module>.ts`)**:
  - Định nghĩa rõ các interface khớp với Mục 3.
- **Xử lý 4 Trạng thái UI**:
  - `Loading`: ...
  - `Error`: ...
  - `Empty`: ...
  - `Success`: ...

---

## 5. Phân rã Công việc theo 2-Wave (Atomic Tasks)

### Wave 1: Dành cho `db-dev` (Phạm vi: `src/db/`)
- [ ] Task DB-1: Khởi tạo model trong `src/db/models/` (tuân thủ UUID & ARRAY cross-DB).
- [ ] Task DB-2: Tạo migration script trong `src/db/migrations/`.
- [ ] Task DB-3: Tạo kịch bản seed dữ liệu trong `src/db/seeds/` (nếu cần dữ liệu mẫu khởi đầu).

### Wave 1: Dành cho `frontend-dev` (Phạm vi: `src/frontend/`)
- [ ] Task FE-1: Khai báo types và API client trong `src/frontend/src/`.
- [ ] Task FE-2: Xây dựng UI components & xử lý 4 trạng thái giao diện.
- [ ] Task FE-3: Khai báo dependencies mới vào `src/frontend/package.json` (nếu cần).

### Wave 2: Dành cho `backend-dev` (Phạm vi: `src/backend/`, kết nối `src/db/`)
- [ ] Task BE-1: Khai báo Pydantic schemas trong `src/backend/app/schemas/`.
- [ ] Task BE-2: Cài đặt services và endpoints trong `src/backend/app/` kết nối `src/db/`.
- [ ] Task BE-3: Khai báo dependencies mới vào `pyproject.toml` (nếu cần).

---

## 6. Kịch bản Kiểm thử & Nghiệm thu (`qa-tester` & `code-reviewer`)
- [ ] **TC-01 (DB)**: Kiểm tra ràng buộc dữ liệu và CRUD cơ bản trong `src/db/`.
- [ ] **TC-02 (API Happy Path)**: Gọi API thành công trả về đúng schema trong `src/backend/tests/`.
- [ ] **TC-03 (API Edge/Error Case)**: Kiểm tra mã lỗi `404`, `422`, `409`.
- [ ] **TC-04 (Frontend UI)**: Kiểm tra render đủ trạng thái Loading/Error/Empty/Success và TypeScript strict check.
