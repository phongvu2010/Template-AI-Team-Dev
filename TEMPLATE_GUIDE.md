# Hướng dẫn Sử dụng Template Multi-Agent Cho Dự Án Mới

Tài liệu này hướng dẫn cách sử dụng repository này làm **Template Chuẩn (Starter Template)** để khởi tạo và phát triển các dự án phần mềm mới cùng **Hệ thống AI Team Dev (Antigravity 2.0)**.

---

## 1. Tổng quan Kiến trúc Template

Template này được thiết kế theo **Mô hình Ma trận (Matrix Architecture)** kết hợp quy trình **2-Wave Execution**, phân tách quyền sở hữu thư mục nghiêm ngặt:

```text
[User Request]
      │
      ▼
┌───────────────────────────────────────────────────────────┐
│               TECH LEAD / ORCHESTRATOR (Main)             │
└───────────────────────────────────────────────────────────┘
      │
      ├──► Phase 1: PLANNER (`planner`)
      │      └── docs/specs/<feature-slug>/plan.md
      │
      ├──► Phase 2: DEV SQUADS (2-Wave Execution)
      │      ├── Wave 1 (Song song):
      │      │     ├── `db-dev`       ──► src/db/ (SQLAlchemy 2.0 + Alembic)
      │      │     └── `frontend-dev` ──► src/frontend/ (Next.js + Strict TS + Mocks)
      │      └── Wave 2:
      │            └── `backend-dev`  ──► src/backend/ (FastAPI + Pydantic v2)
      │
      ├──► Phase 3: TESTING (`qa-tester`)
      │      └── Ruff Linter + Pytest SQLite in-memory + Frontend Typecheck
      │      └── docs/specs/<feature-slug>/test-report.md
      │
      ├──► Phase 4: CODE REVIEW (`code-reviewer`)
      │      └── Token-optimized audit qua git diff
      │      └── docs/specs/<feature-slug>/review-report.md
      │
      └──► Phase 5: PACKAGING & COMMIT (Tech Lead Orchestrator)
             └── Conventional Commits: feat(<feature-slug>): ...
```

---

## 2. Bước 1: Khởi tạo Repository Mới

### Cách A: Sử dụng tính năng GitHub Template (Khuyên dùng)
1. Trên repository này tại GitHub, bấm nút **"Use this template"** $\to$ chọn **"Create a new repository"**.
2. Đặt tên repository cho dự án mới của bạn (ví dụ: `my-saas-platform`, `ecommerce-core`).
3. Clone repository mới về máy:
   ```bash
   git clone <URL_REPO_MOI>
   cd <THU_MUC_REPO_MOI>
   ```

### Cách B: Sao chép thủ công (Local Copy)
Nếu khởi tạo offline hoặc dùng Git Server nội bộ:
```bash
# Clone hoặc copy template sang thư mục mới
cp -r "AI Team Dev" "my-new-project"
cd "my-new-project"

# Khởi tạo lại lịch sử Git cho dự án mới
rm -rf .git
git init
git add .
git commit -m "chore: initial commit from ai-team-dev template"
```

---

## 3. Bước 2: Thiết lập Môi trường Phát triển (Chỉ mất 2 phút)

Dự án sử dụng Python 3.11+ cho Backend/DB và Node.js 18+ cho Frontend Next.js.

### 2.1. Cấu hình biến môi trường
Tạo file `.env` từ file mẫu `.env.example`:
```bash
cp .env.example .env
```

### 2.2. Thiết lập Python Virtualenv (Backend & Database)
```bash
# 1. Tạo virtualenv .venv
python3 -m venv .venv

# 2. Kích hoạt môi trường
source .venv/bin/activate    # Trên macOS / Linux
# hoặc: .venv\Scripts\activate trên Windows

# 3. Nâng cấp pip và cài đặt dependencies ở chế độ editable
pip install --upgrade pip
pip install -e ".[dev]"
```

### 2.3. Cài đặt dependencies Frontend (Next.js)
```bash
npm --prefix src/frontend install
```

### 2.4. Khởi chạy Database PostgreSQL (Tuỳ chọn)
Khi cần phát triển hoặc chạy server live với cơ sở dữ liệu thật:
```bash
docker compose up -d postgres
```
*(Lưu ý: Bộ test tự động mặc định sử dụng SQLite async in-memory, do đó bạn không nhất thiết phải bật Docker PostgreSQL chỉ để chạy test).*

---

## 4. Bước 3: Kiểm chứng Môi trường Day-0 (Smoke Verification)

Trước khi bắt đầu bất kỳ câu lệnh AI nào, hãy chạy lệnh kiểm tra toàn diện để đảm bảo chuỗi công cụ đã sẵn sàng:

```bash
.venv/bin/ruff check src/ && PYTHONPATH=src .venv/bin/pytest src/backend/tests -v && npm --prefix src/frontend run typecheck
```

**Kết quả kỳ vọng**:
* **Ruff**: `All checks passed!`
* **Pytest**: `2 passed in 0.02s` (Pass cả endpoint `/health` và session async DB)
* **TypeScript**: `tsc --noEmit` hoàn tất sạch sẽ, không có lỗi kiểu.

---

## 5. Bước 4: Bắt đầu Phát triển Tính năng cùng AI Team

Mở thư mục dự án mới trong **Antigravity 2.0**, bạn đóng vai trò là **Product Owner / User**, giao tiếp trực tiếp với **Tech Lead Orchestrator**:

### Mẫu câu lệnh (Prompt Template) để chạy toàn bộ quy trình:
> *"Hãy phát triển tính năng **[Tên tính năng]** (slug: `[feature-slug]`) theo quy trình Multi-Agent Dev Team:*
> - *Yêu cầu nghiệp vụ: [Mô tả chi tiết các màn hình, chức năng, user flow]*
> - *Cơ sở dữ liệu: [Các bảng dữ liệu cần tạo, trường chính, quan hệ]*
> - *API: [Các endpoints CRUD hoặc nghiệp vụ cần cung cấp]*
> - *Frontend: [Trang giao diện Next.js, component, trạng thái UX]*"

### Ví dụ Thực tế:
> *"Hãy phát triển tính năng Quản lý Sản phẩm (slug: `product-catalog`) theo quy trình Multi-Agent Dev Team:*
> - *Database: Tạo bảng `products` (id, title, sku, price, stock, is_active, created_at, updated_at).*
> - *API: Cung cấp CRUD REST API đầy đủ trên FastAPI với phân trang `page`, `size`.*
> - *Frontend: Xây dựng trang danh sách sản phẩm Next.js có thanh tìm kiếm, bảng dữ liệu responsive và nút tạo sản phẩm mới."*

---

## 6. Các Chế độ Thực thi Linh hoạt

Tùy vào nhu cầu công việc, bạn có thể chọn 1 trong 2 chế độ:

### Chế độ 1: Chạy Full-Flow (Tự động 5 Phase)
Tech Lead sẽ tự động điều phối:
1. `planner` $\to$ tạo `docs/specs/<feature-slug>/plan.md`.
2. Wave 1: Gọi song song `db-dev` (`src/db/`) & `frontend-dev` (`src/frontend/`).
3. Wave 2: Gọi `backend-dev` (`src/backend/`) kết nối `src/db/`.
4. `qa-tester` $\to$ chạy ruff, pytest, typecheck $\to$ tạo `docs/specs/<feature-slug>/test-report.md`.
5. `code-reviewer` $\to$ audit `git diff` $\to$ tạo `docs/specs/<feature-slug>/review-report.md`.
6. Tự động đóng gói commit: `git commit -m "feat(<feature-slug>): ..."`

### Chế độ 2: Gọi Trực tiếp Từng Tác tử Chuyên biệt (Direct Squad Invocation)
- **Cần bản thiết kế**: *"Nhờ `planner` thiết kế kiến trúc phân hệ Đơn hàng."*
- **Sửa Database**: *"Nhờ `db-dev` thêm index cho cột `sku` bảng `products` và tạo migration Alembic."*
- **Viết thêm API**: *"Nhờ `backend-dev` thêm endpoint lọc sản phẩm theo khoảng giá."*
- **Làm UI**: *"Nhờ `frontend-dev` làm component ProductFilterBar xử lý đủ 4 trạng thái."*
- **Chạy kiểm thử**: *"Nhờ `qa-tester` kiểm tra lint và chạy test suite."*
- **Audit bảo mật/code**: *"Nhờ `code-reviewer` review các thay đổi mới qua git diff."*

---

## 7. Các Nguyên tắc Sống còn Cần Nhớ (Best Practices)

1. **Tuyệt đối không xoá thư mục `src/`**:
   - `src/` chứa các điểm neo (Anchor Points) và các file luật cục bộ [src/db/AGENTS.md](file:///Users/hunterdo/Documents/Python%20Project/AI%20Team%20Dev/src/db/AGENTS.md), [src/backend/AGENTS.md](file:///Users/hunterdo/Documents/Python%20Project/AI%20Team%20Dev/src/backend/AGENTS.md), [src/frontend/AGENTS.md](file:///Users/hunterdo/Documents/Python%20Project/AI%20Team%20Dev/src/frontend/AGENTS.md).
   - Hãy giữ nguyên khung sườn khởi tạo này.
2. **Cơ chế Auto-Discovery cho Models**:
   - Mọi model SQLAlchemy mới được tạo trong `src/db/models/<name>.py` sẽ **tự động** được nạp vào Alembic nhờ [src/db/models/__init__.py](file:///Users/hunterdo/Documents/Python%20Project/AI%20Team%20Dev/src/db/models/__init__.py).
3. **Luôn dùng Virtualenv Runner**:
   - Luôn sử dụng `.venv/bin/pytest` và `.venv/bin/ruff` thay vì gọi lệnh trần.
4. **Phân vùng File Tuyệt đối (File Isolation)**:
   - `db-dev` chỉ ghi `src/db/`.
   - `backend-dev` chỉ ghi `src/backend/`.
   - `frontend-dev` chỉ ghi `src/frontend/`.
   - `qa-tester` & `code-reviewer` không sửa code nghiệp vụ mà chỉ báo cáo lại cho Dev Squad sửa chữa thông qua vòng lặp Self-Healing.
