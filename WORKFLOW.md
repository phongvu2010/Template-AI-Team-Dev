# Cẩm Nang Quy Trình Làm Việc Multi-Agent Dev Team (SOP)
### Chu trình Lập trình Dự án Chuẩn từ Ý tưởng đến Bàn giao trên Antigravity 2.0

Tài liệu này là **Quy trình Vận hành Chuẩn (Standard Operating Procedure - SOP)** dành cho **Product Owner / Tech Founder / Developer** điều phối hệ thống **Multi-Agent Dev Team** theo mô hình **Ma trận (Matrix Architecture)** kết hợp quy trình **2-Wave Execution** trên nền tảng **Antigravity 2.0**.

---

## 1. Sơ Đồ Quy Trình Vận Hành Toàn Diện (End-to-End Pipeline)

Mọi tính năng mới hoặc phân hệ nghiệp vụ đều vận hành qua chu trình 7 giai đoạn khép kín:

```text
[User / Product Owner]
          │ (Ý tưởng & Nhu cầu nghiệp vụ)
          ▼
┌────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 0: Tiếp nhận Ý tưởng & Định hình Phạm vi (Ideation & Scope)  │
│ - Xác định Feature Slug (kebab-case)                                   │
│ - Xác định Scope: Nghiệp vụ MVP vs Tính năng mở rộng                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 1: Lập Kế hoạch Kiến trúc & Đặc tả Hợp đồng (`planner`)      │
│ - Xuất bản: docs/specs/<feature-slug>/plan.md                          │
│   ├── Data Contract (PostgreSQL / SQLAlchemy 2.0 tại src/db/)          │
│   ├── API Contract (OpenAPI REST specs tại src/backend/)               │
│   ├── UI Architecture (Next.js App Router 4 UI states tại src/frontend/)│
│   └── Acceptance Criteria & Kịch bản Test cho qa-tester                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ [Quality Gate 1: Duyệt plan.md]
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 2: Thẩm định Thư viện & Công nghệ (Tech Provisioning)         │
│ - Rà soát dependencies: pyproject.toml & src/frontend/package.json     │
│ - Quy chuẩn Sandbox: Cắm cờ [DEPENDENCY REQUIRED], không chạy lệnh trần │
│ - Smoke check Day-0: .venv/bin/ruff check src/ sạch sẽ                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 3: Triển khai Lập trình Đợt kép (2-Wave Execution)           │
│                                                                        │
│ ┌──────────────────────────────────┐  ┌──────────────────────────────┐ │
│ │ Nhánh 1A: Database (`db-dev`)    │  │ Nhánh 1B: Frontend           │ │
│ │ - src/db/models/<name>.py        │  │           (`frontend-dev`)   │ │
│ │ - UUIDPrimaryKeyMixin, JSON array│  │ - TypeScript Types           │ │
│ │ - Alembic & Async Seeds          │  │ - Mock data fixtures         │ │
│ │ - Tránh N+1 (selectinload)       │  │ - UI 4 states (Loading,      │ │
│ └────────────────┬─────────────────┘  │   Error, Empty, Success)     │ │
│                  │ (Models sẵn sàng)  └──────────────────────────────┘ │
│                  ▼                                                     │
│ ┌──────────────────────────────────┐                                   │
│ │ Nhánh 2: Backend API             │                                   │
│ │          (`backend-dev`)         │                                   │
│ │ - src/backend/app/schemas/       │                                   │
│ │ - src/backend/app/services/      │                                   │
│ │ - src/backend/app/api/v1/        │                                   │
│ │   (Kết nối src/db/ qua PYTHONPATH)                                   │
│ └──────────────────────────────────┘                                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 4: Kiểm thử Tự động & Vòng lặp Sửa lỗi (`qa-tester`)         │
│ - 1. Linter: .venv/bin/ruff check src/                                 │
│ - 2. DB & Backend Tests: PYTHONPATH=src .venv/bin/pytest -v            │
│   (SQLite async in-memory fallback cô lập)                             │
│ - 3. Frontend Typecheck: npm --prefix src/frontend run typecheck       │
│ - Xuất bản: docs/specs/<feature-slug>/test-report.md                   │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ [Vòng lặp Self-Healing] Nếu FAILED:                                │ │
│ │ Tech Lead điều phối qua tin nhắn [SELF-HEALING ACTION REQUIRED]    │ │
│ │ Dev Squad tương ứng sửa lỗi -> QA test lại (tối đa 3 vòng lặp)    │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ [Quality Gate 2: Test PASSED 100%]
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 5: Thẩm định Code, Tối ưu & Bảo mật (`code-reviewer`)        │
│ - Token-Optimized Audit qua `git status` và `git diff`                 │
│ - Kiểm tra: Khớp Contract, Bảo mật OWASP, N+1 Query, Typescript Any    │
│ - Xuất bản: docs/specs/<feature-slug>/review-report.md                 │
│   (Verdict: APPROVED hoặc CHANGES_REQUESTED)                           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ [Quality Gate 3: Verdict APPROVED]
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 6: Đóng gói, Git Commit & Bàn giao (Tech Lead Orchestrator)  │
│ - git add src/ docs/specs/<feature-slug>/ pyproject.toml package.json  │
│ - Tạo Conventional Commit: feat(<feature-slug>): ...                   │
│ - Báo cáo nghiệm thu & Hướng dẫn User trải nghiệm tính năng            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Bảng Phân Công Trách Nhiệm (RACI Matrix)

| Vai trò / Tác tử | Nhận diện Subagent | Thư mục quyền sở hữu | Nhiệm vụ chính trong chu trình |
| :--- | :--- | :--- | :--- |
| **Product Owner** | User (Con người) | Toàn dự án | Định nghĩa bài toán, nghiệm thu `plan.md` và kiểm chứng sản phẩm. |
| **Tech Lead** | Antigravity Main Agent | Toàn dự án | Điều phối các Phase, gửi tin nhắn Self-Healing, đóng gói Git commit. |
| **Architect** | [`planner`](.agents/agents/planner.md) | `docs/specs/<slug>/` | Xuất bản `plan.md` (Data Contract + API Contract + UI Spec + Test Cases). |
| **DB Specialist** | [`db-dev`](.agents/agents/db-dev.md) | `src/db/` | Xây dựng SQLAlchemy 2.0 models, Alembic migrations, Repositories, Seeds. |
| **Frontend Dev** | [`frontend-dev`](.agents/agents/frontend-dev.md) | `src/frontend/` | Xây dựng Next.js UI, TypeScript interfaces, API clients, Mock fixtures. |
| **Backend Dev** | [`backend-dev`](.agents/agents/backend-dev.md) | `src/backend/` | Xây dựng Pydantic v2 schemas, Services nghiệp vụ, REST API endpoints. |
| **QA Specialist** | [`qa-tester`](.agents/agents/qa-tester.md) | `docs/specs/`, `src/*/tests/` | Viết automated tests, chạy linter, xuất `test-report.md`, cung cấp trace lỗi. |
| **Code Reviewer** | [`code-reviewer`](.agents/agents/code-reviewer.md) | `docs/specs/` | Audit `git diff`, kiểm tra N+1, bảo mật, code quality, ra verdict `APPROVED`. |

---

## 3. Chi Tiết 7 Giai Đoạn Vận Hành

---

### Giai đoạn 0: Tiếp nhận Ý tưởng & Định hình Phạm vi (Ideation & Scope)

* **Mục tiêu**: Biến mong muốn trừu tượng của người dùng thành một bài toán kỹ thuật có phạm vi rõ ràng.
* **Các bước thực hiện**:
  1. **Đặt Feature Slug**: Đặt định danh ngắn gọn dạng `kebab-case` (ví dụ: `auth-system`, `inventory-tracking`, `billing-subscription`). Slug này sẽ là tên thư mục chứa specs: `docs/specs/<feature-slug>/`.
  2. **Xác định 3 trụ cột thông tin**:
     - *Nghiệp vụ (Business Flow)*: Ai là người dùng? Luồng thao tác chính là gì?
     - *Dữ liệu (Data Needs)*: Cần lưu các thực thể nào? Các trường trọng tâm là gì?
     - *Giao diện (UI Expectations)*: Cần màn hình danh sách, form nhập, modal popup hay biểu đồ báo cáo?
  3. **Phân ranh giới MVP**: Ghi chú rõ các tính năng "bắt buộc có ngay" (P0) và tính năng "để giai đoạn tiếp theo" (P1/P2).

---

### Giai đoạn 1: Lập Kế hoạch Kiến trúc & Đặc tả Hợp đồng (`planner`)

* **Mục tiêu**: Tạo **Single Source of Truth** tại `docs/specs/<feature-slug>/plan.md`. Không viết code khi chưa có file này.
* **Các bước thực hiện**:
  1. Tech Lead kích hoạt `planner` (đọc mẫu [plan-template.md](.agents/skills/team-pipeline/resources/plan-template.md)).
  2. `planner` khảo sát hiện trạng thư mục `src/db/`, `src/backend/`, `src/frontend/` để tận dụng code đã có.
  3. `planner` thiết lập **Data Contract**:
     - Tên bảng, kiểu cột, khoá chính UUID (`UUIDPrimaryKeyMixin`), khoá ngoại, indexes.
     - Quy tắc quan hệ (`relationship`), kiểu nạp (`selectinload`).
  4. `planner` thiết lập **API Contract**:
     - Endpoint URL (ví dụ: `POST /api/v1/orders`), HTTP Method, Headers, Query Params.
     - Request Body JSON và Response Payload JSON đầy đủ tên trường và kiểu dữ liệu.
     - Mã trạng thái HTTP chuẩn: `200`, `201`, `204`, `400`, `401`, `404`, `422`.
  5. `planner` thiết lập **UI Architecture**:
     - Cấu trúc trang Next.js App Router (Server Component vs Client Component).
     - Giao diện bắt buộc đủ **4 trạng thái**: `Loading`, `Error`, `Empty`, `Success`.
  6. `planner` thiết lập **Acceptance Criteria & Test Cases** cho QA.

> 🛡️ **Quality Gate 1**: User/Tech Lead xem xét `plan.md`. Nếu cần thay đổi nghiệp vụ, chỉnh sửa ngay tại đây trước khi bắt đầu lập trình.

---

### Giai đoạn 2: Thẩm định Thư viện & Công nghệ (Tech Provisioning)

* **Mục tiêu**: Rà soát các thư viện phát sinh và chuẩn bị môi trường an toàn trong sandbox cô lập.
* **Các bước thực hiện**:
  1. **Rà soát Thư viện**:
     - Backend/DB ([pyproject.toml](pyproject.toml)): Thư viện mã hóa mật khẩu (`passlib[bcrypt]`), JWT (`python-jose`), HTTP client ngoài (`httpx`).
     - Frontend (`src/frontend/package.json`): Icons (`lucide-react`), validation (`zod`), components hỗ trợ.
  2. **Quy tắc Quản lý Thư viện trong Sandbox**:
     - Subagents **tuyệt đối không chạy lệnh `pip install` hoặc `npm install` trần** khi không có internet.
     - Cập nhật trực tiếp vào file manifest (`pyproject.toml` hoặc `src/frontend/package.json`).
     - Gắn cờ thông báo `[DEPENDENCY REQUIRED] <tên_gói>` để User/Orchestrator cài đặt.
  3. **Kiểm tra Day-0**: Chạy `.venv/bin/ruff check src/` để chắc chắn không có lỗi cú pháp tồn dư.

---

### Giai đoạn 3: Triển khai Lập trình Đợt kép (2-Wave Execution)

* **Mục tiêu**: Tối ưu hóa thời gian bằng cách lập trình song song mà không gây xung đột phụ thuộc hay lỗi ghi đè file.
* **Nguyên tắc phân vùng file (Strict File Isolation)**:
  - `db-dev`: Chỉ ghi trong `src/db/`.
  - `frontend-dev`: Chỉ ghi trong `src/frontend/`.
  - `backend-dev`: Chỉ ghi trong `src/backend/`.

#### Đợt 1 (Wave 1 - Song song):
* **Nhánh 1A - Database Specialist (`db-dev` tại `src/db/`)**:
  - Tạo model trong `src/db/models/<name>.py` (tự động nạp qua auto-discovery `src/db/models/__init__.py`).
  - Kế thừa `UUIDPrimaryKeyMixin` (`default=uuid.uuid4`) và `TimestampMixin`.
  - Mảng dữ liệu dùng `JSON` chuẩn (hoặc variant) để SQLite test không bị fail `CompileError`.
  - Viết repository async chống N+1 bằng `selectinload()`.
  - Tạo migration Alembic và kịch bản Seed Data tại `src/db/seeds/<name>_seed.py`.
* **Nhánh 1B - Frontend Specialist (`frontend-dev` tại `src/frontend/`)**:
  - Tạo TypeScript types tại `src/frontend/src/types/` khớp 100% với API Contract trong `plan.md`. Không dùng `any`.
  - Tạo mock fixtures tại `src/frontend/src/lib/api/mocks/` hỗ trợ cờ `NEXT_PUBLIC_USE_MOCKS=true`.
  - Xây dựng UI Components & Pages Next.js xử lý trọn vẹn 4 trạng thái: Loading, Error, Empty, Success.
  - Kiểm tra kiểu: `npm --prefix src/frontend run typecheck`.

#### Đợt 2 (Wave 2 - Kết nối Backend):
* **Backend Specialist (`backend-dev` tại `src/backend/`)**:
  - Kích hoạt ngay sau khi `db-dev` hoàn thành models.
  - Viết Pydantic v2 schemas tại `src/backend/app/schemas/` (`ConfigDict(from_attributes=True)`, giới hạn `max_length`, `ge`/`le`).
  - Viết Services xử lý business logic và transaction tại `src/backend/app/services/`.
  - Viết API routers tại `src/backend/app/api/v1/endpoints/` kết nối models trực tiếp từ `src/db/` thông qua `PYTHONPATH=src`.
  - Cắm router vào tập trung tại `src/backend/app/api/v1/router.py`.

---

### Giai đoạn 4: Kiểm thử Tự động & Vòng lặp Sửa lỗi (`qa-tester`)

* **Mục tiêu**: Đạt 100% tỷ lệ vượt qua bài test trước khi chuyển sang bước review.
* **Các bước thực hiện**:
  1. `qa-tester` đối chiếu `plan.md` và viết test tự động tại `src/backend/tests/test_<feature>.py`.
  2. Thực thi chuỗi lệnh kiểm tra:
     ```bash
     # 1. Linter & Code Standards
     .venv/bin/ruff check src/

     # 2. Backend & DB Testing (SQLite async in-memory fallback)
     PYTHONPATH=src .venv/bin/pytest src/backend/tests -v

     # 3. Frontend TypeScript Integrity
     npm --prefix src/frontend run typecheck
     ```
  3. Xuất báo cáo tại `docs/specs/<feature-slug>/test-report.md`.
  4. **Giao thức Self-Healing (Tự sửa lỗi)**:
     - Nếu phát hiện bài test `FAILED`, `qa-tester` không tự sửa code nghiệp vụ mà trích xuất chi tiết lỗi vào báo cáo.
     - Tech Lead gửi tin nhắn `send_message` theo mẫu chuẩn:
       ```text
       [SELF-HEALING ACTION REQUIRED]
       - Feature: <feature-slug>
       - Target Agent: db-dev (src/db/) | backend-dev (src/backend/) | frontend-dev (src/frontend/)
       - Target File & Line: <đường_dẫn_file>#L...
       - Failed Test: <tên hàm test hoặc ID>
       - Diagnostics & Traceback: <nội dung lỗi>
       - Instructions: Phân tích nguyên nhân và khắc phục. Chỉ sửa trong thư mục phân quyền.
       ```
     - Sau khi Dev Agent báo xong, `qa-tester` chạy lại bài test (tối đa 3 vòng lặp).

> 🛡️ **Quality Gate 2**: Toàn bộ test suite phải đạt trạng thái `PASSED 100%`.

---

### Giai đoạn 5: Thẩm định Code, Tối ưu & Bảo mật (`code-reviewer`)

* **Mục tiêu**: Đánh giá độc lập về kiến trúc, bảo mật và hiệu năng, ngăn chặn nợ kỹ thuật (technical debt).
* **Chiến lược Token-Optimized Audit**:
  - Không đọc toàn bộ codebase.
  - Sử dụng `git status --short` và `git diff` để tập trung phân tích chính xác những dòng code vừa thay đổi trong commit/working tree.
* **Bảng kiểm định (Audit Checklist)**:
  1. *Khớp Hợp đồng*: Tên trường JSON giữa DB, FastAPI và Next.js có bị lệch không (`camelCase` vs `snake_case`)?
  2. *Database*: Có truy vấn N+1 không? Có thiếu index cho trường lọc/tìm kiếm không?
  3. *Bảo mật*: Đã chặn SQL Injection, XSS chưa? Có lộ mật khẩu hash, API token hay stack trace nội bộ ra client không?
  4. *Frontend*: Có ép kiểu `any` không? Component có dọn dẹp side-effect không? Semantic HTML và ARIA có đạt chuẩn không?
* **Đầu ra**: Xuất file `docs/specs/<feature-slug>/review-report.md`.
  - Nếu `CHANGES_REQUESTED`: Gửi yêu cầu Dev Squad khắc phục các lỗi `[CRITICAL]` hoặc `[MAJOR]`.
  - Nếu `APPROVED`: Chuyển sang Giai đoạn 6.

> 🛡️ **Quality Gate 3**: Verdict bắt buộc phải đạt `APPROVED`.

---

### Giai đoạn 6: Đóng gói, Git Commit & Bàn giao (Tech Lead Orchestrator)

* **Mục tiêu**: Đóng gói thành quả lao động theo chuẩn Conventional Commits và bàn giao cho User.
* **Các bước thực hiện**:
  1. Kiểm tra trạng thái Git:
     ```bash
     git status --short
     ```
  2. Chạy commit tự động:
     ```bash
     git add src/ docs/specs/<feature-slug>/
     git add pyproject.toml src/frontend/package*.json 2>/dev/null || true
     git commit -m "feat(<feature-slug>): implement <tên tính năng ngắn gọn>

     - DB: add models, repositories & migrations in src/db/
     - Backend: implement schemas, services & routers in src/backend/
     - Frontend: build UI components, types & mock fixtures in src/frontend/
     - Testing & Review: 100% test passed, approved by reviewer
     - Specs: docs/specs/<feature-slug>/plan.md"
     ```
  3. Bàn giao cho User: Cung cấp Commit Hash, danh sách files đã tạo, đường dẫn tài liệu trong `docs/specs/<feature-slug>/` và hướng dẫn chạy thử nghiệm trực tiếp trên trình duyệt.

---

## 4. Bộ Mẫu Câu Lệnh (Prompt Templates) Sẵn Dùng Cho User

Người dùng (Product Owner) chỉ cần sao chép các mẫu câu lệnh dưới đây và nhập vào chat Antigravity:

### Mẫu 1: Chạy Full-Flow (Toàn bộ 7 Giai đoạn Tự Động)
```text
Hãy phát triển tính năng [Tên tính năng] (slug: [feature-slug]) theo quy trình Multi-Agent Dev Team:
- Nghiệp vụ: [Mô tả chi tiết mục tiêu, luồng thao tác của người dùng]
- Cơ sở dữ liệu: [Bảng cần tạo, các cột chính, quan hệ khoá ngoại nếu có]
- API REST: [Các endpoints CRUD, phân trang, lọc hoặc tính toán cần có]
- Giao diện Next.js: [Màn hình danh sách, form tạo mới, modal, trạng thái UX]
Hãy bắt đầu với Phase 1 Planning và điều phối các tác tử theo đúng quy trình 2-Wave!
```

### Mẫu 2: Điều Phối Tác Tử Chuyên Biệt (Direct Squad Invocation)
* **Khi chỉ cần thiết kế**:
  > *"Nhờ `planner` phân tích và lập bản thiết kế `plan.md` cho phân hệ [Tên phân hệ]."*
* **Khi cần sửa Database**:
  > *"Nhờ `db-dev` thêm cột `avatar_url` vào bảng `users` trong `src/db/` và tạo migration Alembic."*
* **Khi cần viết thêm API**:
  > *"Nhờ `backend-dev` tạo thêm endpoint lọc đơn hàng theo trạng thái tại `src/backend/`."*
* **Khi cần làm giao diện**:
  > *"Nhờ `frontend-dev` thiết kế component OrderStatusBadge xử lý đủ 4 trạng thái tại `src/frontend/`."*
* **Khi cần kiểm thử**:
  > *"Nhờ `qa-tester` chạy lint ruff và toàn bộ test suite pytest xem có lỗi nào không."*
* **Khi cần review bảo mật**:
  > *"Nhờ `code-reviewer` audit các thay đổi mới qua git diff và xuất review-report.md."*

### Mẫu 3: Sửa Lỗi Khẩn Cấp (Bugfix / Self-Healing Handoff)
```text
Tôi phát hiện lỗi sau khi chạy thực tế: [Mô tả lỗi hoặc dán log exception].
Nhờ Tech Lead điều phối Dev Squad tương ứng phân tích nguyên nhân tại src/, khắc phục triệt để và nhờ QA kiểm thử lại nhé!
```

---

## 5. Bảng Tiêu Chí Kiểm Tra Nhanh Chất Lượng (Quality Checklist)

Dùng bảng này để nghiệm thu sản phẩm sau mỗi tính năng:

- [ ] `docs/specs/<feature-slug>/plan.md` có đầy đủ Data Contract, API Contract và UI Spec.
- [ ] Model trong `src/db/models/` kế thừa `UUIDPrimaryKeyMixin` và `TimestampMixin`.
- [ ] Không có truy vấn N+1 (`selectinload` được dùng đầy đủ cho relationships).
- [ ] Endpoint FastAPI có Pydantic v2 validation giới hạn độ dài chuỗi và khoảng giá trị số.
- [ ] Giao diện Next.js hiển thị đầy đủ 4 trạng thái: Loading skeleton, Error message, Empty state, Success state.
- [ ] Không có từ khóa `any` trong toàn bộ code TypeScript (`src/frontend/`).
- [ ] `.venv/bin/ruff check src/` trả về `All checks passed!`.
- [ ] `PYTHONPATH=src .venv/bin/pytest src/backend/tests` đạt `100% passed`.
- [ ] `npm --prefix src/frontend run typecheck` không có lỗi type.
- [ ] `docs/specs/<feature-slug>/review-report.md` đạt Verdict `APPROVED`.
- [ ] Git commit được tạo theo đúng chuẩn Conventional Commits.

---

## 6. Hướng Dẫn Xử Lý Sự Cố Thường Gặp (Troubleshooting)

### Vấn đề 1: Pytest báo lỗi `aiosqlite is not installed` hoặc không tìm thấy module `backend`
* **Nguyên nhân**: Chạy lệnh pytest trần mà không chỉ định virtualenv hoặc thiếu `PYTHONPATH`.
* **Cách khắc phục**: Luôn chạy bằng lệnh chuẩn hóa:
  ```bash
  PYTHONPATH=src .venv/bin/pytest src/backend/tests -v
  ```

### Vấn đề 2: Lỗi SQLite `CompileError: Compiler <...> can't render element of type ARRAY`
* **Nguyên nhân**: Model dùng kiểu `ARRAY` trần của PostgreSQL, khiến SQLite in-memory test không thể render bảng.
* **Cách khắc phục**: Chuyển sang dùng `from sqlalchemy import JSON` với `default=list` hoặc dùng variant `JSON().with_variant(ARRAY(String), "postgresql")`.

### Vấn đề 3: Lỗi `MissingGreenlet` khi truy cập relationship trong FastAPI
* **Nguyên nhân**: Trong môi trường bất đồng bộ (`AsyncSession`), truy cập lazy-loading relationship mà không dùng `await`.
* **Cách khắc phục**: Tại tầng repository, luôn thêm `.options(selectinload(Model.relation_name))` vào câu lệnh `select()`.

### Vấn đề 4: Sandbox không có internet khi subagent chạy `npm/pip install`
* **Nguyên nhân**: Môi trường sandbox được cô lập để bảo mật.
* **Cách khắc phục**: Không cho agent chạy lệnh cài đặt trần. Cập nhật tên thư viện vào `pyproject.toml` hoặc `src/frontend/package.json`, sau đó thoát sandbox hoặc cài đặt thủ công ở terminal máy chủ.
