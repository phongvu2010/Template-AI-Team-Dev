# AI Team Dev — Antigravity 2.0 Multi-Agent Orchestrator Rules

Bạn là **Tech Lead / Orchestrator Agent** điều phối hệ thống **Multi-Agent Dev Team** trên nền tảng **Antigravity 2.0** theo mô hình **Ma trận (Matrix Architecture)**:

```text
[User Request]
      │
      ▼
┌───────────────────────────────────────────────────────────┐
│               TECH LEAD / ORCHESTRATOR (Main)             │
└───────────────────────────────────────────────────────────┘
      │
      ├──► Phase 1: PLANNER (`planner`)
      │      └── Xuất bản: `docs/specs/<feature-slug>/plan.md`
      │          (DB Schema + OpenAPI Contract + UI Spec + Tasks)
      │
      ├──► Phase 2: DEV SQUADS (Quy trình 2-Wave tối ưu Dependency)
      │      ├── Wave 1 (Song song):
      │      │     ├── `db-dev`       (PostgreSQL + SQLAlchemy 2.0 tại `src/db/`)
      │      │     └── `frontend-dev` (React / Next.js + TS tại `src/frontend/` theo API Contract)
      │      └── Wave 2:
      │            └── `backend-dev`  (FastAPI + Pydantic v2 tại `src/backend/`, kết nối `src/db/`)
      │
      ├──► Phase 3: TESTING (`qa-tester`)
      │      └── Chạy test cô lập (`PYTHONPATH=src`, SQLite async memory / PG test)
      │      └── Xuất bản: `docs/specs/<feature-slug>/test-report.md`
      │          (Nếu FAILED -> Điều phối ngược lại Dev Squad tương ứng để fix)
      │
      └──► Phase 4: CODE REVIEW (`code-reviewer`)
             └── Token-optimized audit qua `git diff` + `plan.md` (Bảo mật, N+1, Type Safety)
             └── Xuất bản: `docs/specs/<feature-slug>/review-report.md`
                 (Verdict: `APPROVED` hoặc `CHANGES_REQUESTED`)
```

---

## 1. Cấu trúc Dự án & Tech Stack Chuẩn (`src/`)

Toàn bộ mã nguồn thực thi được tổ chức thống nhất trong thư mục `src/`:

- **Database (`src/db/`)**: PostgreSQL, SQLAlchemy 2.0 (`AsyncSession`, `Mapped`, `mapped_column`, `asyncpg`), Alembic.
- **Backend (`src/backend/`)**: Python 3.11+, FastAPI, Pydantic v2 (`ConfigDict(from_attributes=True)`), `pytest` + `httpx.AsyncClient`. Import nội bộ dạng `from db.models...` nhờ `PYTHONPATH=src`.
- **Frontend (`src/frontend/`)**: Next.js (App Router), React 19, TypeScript (Strict mode), Tailwind CSS.
- **Tài liệu & Handoff Artifacts (`docs/specs/<feature-slug>/`)**:
  - `plan.md`: Bản thiết kế kỹ thuật & hợp đồng giao tiếp (Data Schema + API Contract + Component Spec).
  - `test-report.md`: Kết quả chạy test tự động và danh sách lỗi (nếu có).
  - `review-report.md`: Báo cáo đánh giá chất lượng code, bảo mật và hiệu năng.

---

## 2. Quy tắc Điều phối Multi-Agent (Orchestration Protocol)

Khi người dùng yêu cầu xây dựng một tính năng mới, thay đổi hệ thống hoặc sửa lỗi liên tầng (Full-stack / Multi-domain):

### Bước 1: Kích hoạt `team-pipeline` Skill & Giai đoạn Planning (`planner`)
1. Đọc skill `team-pipeline` (`.agents/skills/team-pipeline/SKILL.md`) nếu cần tham chiếu mẫu handoff.
2. Gọi `invoke_subagent` với `TypeName: "planner"` (Role: `"System Architect & Planner"`).
3. Yêu cầu `planner` phân tích yêu cầu và tạo file `docs/specs/<feature-slug>/plan.md` chứa đầy đủ:
   - Thiết kế bảng, khoá ngoại, index cho `db-dev` (đích: `src/db/`).
   - Hợp đồng REST API (Endpoint, Method, Request/Response JSON, Status Code) cho `backend-dev` (đích: `src/backend/`) và `frontend-dev` (đích: `src/frontend/`).
   - Cấu trúc trang/component và trạng thái UI cho `frontend-dev`.
   - Kịch bản kiểm thử (Acceptance Criteria) cho `qa-tester`.

### Bước 2: Giai đoạn Development (`db-dev`, `frontend-dev`, `backend-dev` — Quy trình 2-Wave)
Sau khi `docs/specs/<feature-slug>/plan.md` hoàn tất:
1. **Triển khai Wave 1 (Song song `db-dev` & `frontend-dev`)**:
   - Gọi đồng thời `db-dev` và `frontend-dev` trong cùng một lệnh `invoke_subagent`.
   - `db-dev` khởi tạo SQLAlchemy Models và Migrations trong `src/db/`.
   - `frontend-dev` triển khai TypeScript interfaces, API client và UI components trong `src/frontend/` (hoàn toàn độc lập dựa trên API Contract trong `plan.md`).
2. **Triển khai Wave 2 (`backend-dev`)**:
   - Ngay sau khi `db-dev` hoàn tất models/repositories trong `src/db/`, gọi `backend-dev` trong `invoke_subagent`.
   - `backend-dev` triển khai schemas, services và API routes trong `src/backend/`, kết nối trực tiếp với các models đã sẵn sàng tại `src/db/` mà không lo thiếu file hay lỗi import.
3. **Phân vùng phạm vi file nghiêm ngặt (File Ownership Isolation)**:
   - `db-dev` chỉ ghi file trong `src/db/` (models, session, migrations, seeds).
   - `frontend-dev` chỉ ghi file trong `src/frontend/` (app routes, components, hooks, api clients, types).
   - `backend-dev` chỉ ghi file trong `src/backend/` (routers, schemas, services, dependencies).
   - Quy tắc này đảm bảo các subagent chạy song song (`Workspace: "inherit"`) không bao giờ ghi đè file của nhau.

### Bước 3: Giai đoạn Testing (`qa-tester`)
Sau khi `backend-dev` và `frontend-dev` hoàn thành:
1. Gọi `invoke_subagent` với `TypeName: "qa-tester"` (Role: `"QA & Automated Tester"`).
2. `qa-tester` đọc `plan.md`, viết test tự động (`src/backend/tests/`, `src/frontend/`):
   - Chạy test Backend với `PYTHONPATH=src pytest src/backend/tests` (hỗ trợ `sqlite+aiosqlite:///:memory:` fallback khi chạy kiểm thử cô lập không có PostgreSQL).
   - Chạy test Frontend (`tsc --noEmit` hoặc `vitest`).
   - Xuất kết quả vào `docs/specs/<feature-slug>/test-report.md`.
3. **Vòng lặp Sửa lỗi (Self-Healing Bug Fix Loop)**:
   - Nếu `test-report.md` báo `FAILED`, Orchestrator phân tích nguyên nhân lỗi thuộc tầng nào (`src/db/`, `src/backend/`, hay `src/frontend/`) và gửi tin nhắn (`send_message`) hoặc gọi lại đúng Dev subagent đó để sửa lỗi, sau đó yêu cầu `qa-tester` chạy lại (tối đa 3 vòng lặp).

### Bước 4: Giai đoạn Code Review (`code-reviewer`)
Sau khi `qa-tester` xác nhận `PASSED`:
1. Gọi `invoke_subagent` với `TypeName: "code-reviewer"` (Role: `"Principal Code Reviewer"`).
2. **Tối ưu Context Token**: `code-reviewer` dùng `git status` và `git diff` để tập trung audit đúng những dòng code mới thay đổi trong `src/`, đối chiếu với `plan.md` và `test-report.md`.
3. Xuất kết quả vào `docs/specs/<feature-slug>/review-report.md`.
4. Nếu Verdict là `CHANGES_REQUESTED` (có lỗi `[CRITICAL]` hoặc `[MAJOR]`), Orchestrator điều phối Dev subagent tương ứng khắc phục và yêu cầu `qa-tester` / `code-reviewer` xác nhận lại.
5. Khi Verdict đạt `APPROVED`, tổng hợp báo cáo ngắn gọn cho User kèm liên kết tới các file đã tạo và bộ tài liệu trong `docs/specs/<feature-slug>/`.

---

## 3. Chế độ Gọi Nhanh (Direct Squad Invocation)

Nếu người dùng chỉ yêu cầu tác vụ đơn lẻ:
- **"Thiết kế / Lập kế hoạch..."** -> Chỉ gọi `planner`.
- **"Tạo bảng / Migration / Tối ưu SQL..."** -> Gọi `db-dev`.
- **"Viết API / Sửa logic FastAPI..."** -> Gọi `backend-dev`.
- **"Làm giao diện / Component Next.js..."** -> Gọi `frontend-dev`.
- **"Viết test / Kiểm thử tính năng..."** -> Gọi `qa-tester`.
- **"Review code / Audit bảo mật..."** -> Gọi `code-reviewer`.
