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

## 2. Data Contract — Thiết kế Database (`db-dev`)

### 2.1. Bảng & SQLAlchemy Models (`db/models/<module>.py`)
| Tên Bảng (`__tablename__`) | Class Model | Cột (`Column`) | Kiểu (`SQLAlchemy / PG`) | Ràng buộc & Index (`Constraints / Index`) |
| :--- | :--- | :--- | :--- | :--- |
| `items` | `Item` | `id` | `UUID` / `Integer` | `PK, index=True` |
| `items` | `Item` | `title` | `String(255)` | `nullable=False, index=True` |
| `items` | `Item` | `created_at` | `DateTime(timezone=True)` | `server_default=func.now()` |

### 2.2. Relationships & Truy vấn (`db/repositories/<module>.py`)
- Quan hệ (`relationship`) và chiến lược eager loading (`selectinload` / `joinedload`).
- Các hàm repository/query cần cung cấp cho `backend-dev` (tên hàm, tham số, kiểu trả về).

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

---

## 4. UI & State Architecture — Thiết kế Giao diện (`frontend-dev`)

- **Routes (`frontend/src/app/...`)**:
  - `/...`: Mô tả trang (Server Component / Client Component).
- **Components (`frontend/src/components/...`)**:
  - `<ComponentName>`: Props, state và hành vi tương tác.
- **TypeScript Interfaces (`frontend/src/types/<module>.ts`)**:
  - Định nghĩa rõ các interface khớp với Mục 3.
- **Xử lý 4 Trạng thái UI**:
  - `Loading`: ...
  - `Error`: ...
  - `Empty`: ...
  - `Success`: ...

---

## 5. Phân rã Công việc (Atomic Tasks)

### Dành cho `db-dev` (Phạm vi: `db/`)
- [ ] Task DB-1: ...
- [ ] Task DB-2: ...

### Dành cho `backend-dev` (Phạm vi: `backend/`)
- [ ] Task BE-1: ...
- [ ] Task BE-2: ...

### Dành cho `frontend-dev` (Phạm vi: `frontend/`)
- [ ] Task FE-1: ...
- [ ] Task FE-2: ...

---

## 6. Kịch bản Kiểm thử & Nghiệm thu (`qa-tester` & `code-reviewer`)
- [ ] **TC-01 (DB)**: Kiểm tra ràng buộc dữ liệu và CRUD cơ bản.
- [ ] **TC-02 (API Happy Path)**: Gọi API thành công trả về đúng schema.
- [ ] **TC-03 (API Edge/Error Case)**: Kiểm tra mã lỗi `404`, `422`, `409`.
- [ ] **TC-04 (Frontend UI)**: Kiểm tra render đủ trạng thái Loading/Error/Empty/Success và TypeScript strict check.
