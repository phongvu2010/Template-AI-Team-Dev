---
name: team-pipeline
description: >-
  Orchestrates the Multi-Agent Matrix Dev Team pipeline (Planner -> [Wave 1: DB Dev + Frontend Dev -> Wave 2: Backend Dev] -> QA Tester -> Code Reviewer) on Antigravity 2.0. Activate this skill when the user wants to build a full-stack feature, run the multi-agent team workflow, or coordinate tasks across DB, Backend, and Frontend teams.
---

# Multi-Agent Matrix Dev Team Pipeline (`team-pipeline`)

Skill này cung cấp quy trình điều phối chuẩn (Runbook) và bộ mẫu tài liệu bàn giao (Handoff Templates) cho mô hình **Ma trận (Matrix Architecture)** trên Antigravity 2.0, tổ chức mã nguồn tập trung trong `src/`.

## 1. Sơ đồ Luồng Thực thi & Bàn giao (Handoff Artifacts)

Mọi tính năng đều được định danh bằng một `<feature-slug>` (dạng `kebab-case`, ví dụ: `user-authentication`, `order-management`) và lưu trữ tài liệu bàn giao tại `docs/specs/<feature-slug>/`:

| Giai đoạn | Subagent | Đầu vào (Input) | Đầu ra (Output Artifact & Code) |
| :--- | :--- | :--- | :--- |
| **1. Planning** | `planner` | Yêu cầu từ User + Codebase hiện tại | `docs/specs/<feature-slug>/plan.md` ([Mẫu](./resources/plan-template.md)) |
| **2A. Wave 1 (DB)** | `db-dev` | `plan.md` (Data Contract) | Code trong `src/db/` (Models, Migrations, Repositories) |
| **2B. Wave 1 (Frontend)** | `frontend-dev` | `plan.md` (API Contract + UI Spec) | Code trong `src/frontend/` (Types, API Client, Pages/Components) |
| **2C. Wave 2 (Backend)** | `backend-dev` | `plan.md` (API Contract) + `src/db/` | Code trong `src/backend/` (Schemas, Services, Routers kết nối `src/db/`) |
| **3. Testing** | `qa-tester` | `plan.md` + Code (`src/db/`, `src/backend/`, `src/frontend/`) | Test suites (`PYTHONPATH=src`) + `docs/specs/<feature-slug>/test-report.md` ([Mẫu](./resources/test-report-template.md)) |
| **4. Review** | `code-reviewer` | `plan.md` + `test-report.md` + `git diff` | `docs/specs/<feature-slug>/review-report.md` ([Mẫu](./resources/review-report-template.md)) |
| **5. Packaging** | `tech-lead` | `review-report.md` (`APPROVED`) + Git status | Conventional Git commit + Handoff report cho User |

---

## 2. Hướng dẫn Điều phối Chi tiết cho Tech Lead (Main Agent)

### Bước 1: Khởi chạy `planner`
Gọi `invoke_subagent`:
- `TypeName`: `"planner"`
- `Role`: `"System Architect & Planner"`
- `Prompt`: Yêu cầu đọc `.agents/skills/team-pipeline/resources/plan-template.md` và tạo bản thiết kế đầy đủ tại `docs/specs/<feature-slug>/plan.md` cho các thư mục `src/db/`, `src/backend/`, `src/frontend/`.

### Bước 2: Khởi chạy Đội ngũ Dev theo Quy trình 2-Wave
Sau khi `plan.md` hoàn tất:
- **Wave 1 (Triển khai song song `db-dev` & `frontend-dev`)**:
  - Gọi đồng thời `db-dev` và `frontend-dev` trong cùng một lệnh `invoke_subagent`.
  - `db-dev` xây dựng models, migrations và repositories trong `src/db/`.
  - `frontend-dev` xây dựng types, API client, mock fixtures và UI components trong `src/frontend/` (hoàn toàn độc lập nhờ API Contract và Mock fixtures đã có trong `plan.md`).
- **Wave 2 (Triển khai `backend-dev`)**:
  - Ngay khi `db-dev` hoàn thành models trong `src/db/`, gọi `backend-dev` trong `invoke_subagent`.
  - `backend-dev` viết schemas, services và API routes trong `src/backend/`, kết nối trực tiếp với models từ `src/db/` (`from db.models...`) thông qua `PYTHONPATH=src`.

### Bước 3: Khởi chạy `qa-tester` & Vòng lặp Tự sửa lỗi (Self-Healing Loop)
Gọi `invoke_subagent` với `TypeName: "qa-tester"`:
- Yêu cầu `qa-tester` đọc `plan.md`, viết và chạy test thực tế với `PYTHONPATH=src ./.venv/bin/pytest src/backend/tests` (hỗ trợ `sqlite+aiosqlite:///:memory:` fallback) và `npm --prefix src/frontend run typecheck`.
- Xuất báo cáo theo mẫu `.agents/skills/team-pipeline/resources/test-report-template.md` tại `docs/specs/<feature-slug>/test-report.md`.
- Nếu `Status: FAILED`:
  - Xác định lỗi nằm ở `src/db/`, `src/backend/` hay `src/frontend/`.
  - Dùng `send_message` (tới `conversationId` của Dev subagent tương ứng) kèm chi tiết lỗi từ `test-report.md` để yêu cầu sửa ngay.
  - Sau khi Dev subagent sửa xong, nhắn `qa-tester` chạy lại test (tối đa 3 vòng lặp).

### Bước 4: Khởi chạy `code-reviewer`
Khi `test-report.md` đạt `PASSED`:
- Gọi `invoke_subagent` với `TypeName: "code-reviewer"`.
- Yêu cầu `code-reviewer` dùng `git status` và `git diff` để audit tập trung, tiết kiệm token, kiểm tra kiến trúc, bảo mật, hiệu năng (N+1 query) và xuất `docs/specs/<feature-slug>/review-report.md`.
- Nếu Verdict là `CHANGES_REQUESTED`, điều phối Dev subagent sửa các mục `[CRITICAL]` / `[MAJOR]` và kiểm tra lại trước khi chuyển sang Bước 5.

### Bước 5: Hoàn tất & Đóng gói Git Commit
Khi `review-report.md` đạt `APPROVED`:
- Chạy `git status --short` kiểm tra các file thay đổi trong `src/` và `docs/specs/<feature-slug>/`.
- Thực hiện commit theo chuẩn Conventional Commits:
  ```bash
  git add src/ docs/specs/<feature-slug>/
  git commit -m "feat(<feature-slug>): implement <feature name>

  - DB: add models & migrations in src/db/
  - Backend: implement FastAPI routers & services in src/backend/
  - Frontend: build Next.js UI & typed API client in src/frontend/
  - Testing & Review: 100% test passed, reviewed and approved
  - Specs: docs/specs/<feature-slug>/plan.md"
  ```
- Tổng hợp báo cáo nghiệm thu hoàn tất cho User.
