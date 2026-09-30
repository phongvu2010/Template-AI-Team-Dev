---
name: team-pipeline
description: >-
  Orchestrates the Multi-Agent Matrix Dev Team pipeline (Planner -> [DB Dev | Backend Dev | Frontend Dev] -> QA Tester -> Code Reviewer) on Antigravity 2.0. Activate this skill when the user wants to build a full-stack feature, run the multi-agent team workflow, or coordinate tasks across DB, Backend, and Frontend teams.
---

# Multi-Agent Matrix Dev Team Pipeline (`team-pipeline`)

Skill này cung cấp quy trình điều phối chuẩn (Runbook) và bộ mẫu tài liệu bàn giao (Handoff Templates) cho mô hình **Ma trận (Matrix Architecture)** trên Antigravity 2.0.

## 1. Sơ đồ Luồng Thực thi & Bàn giao (Handoff Artifacts)

Mọi tính năng đều được định danh bằng một `<feature-slug>` (dạng `kebab-case`, ví dụ: `user-authentication`, `order-management`) và lưu trữ tài liệu bàn giao tại `docs/specs/<feature-slug>/`:

| Giai đoạn | Subagent | Đầu vào (Input) | Đầu ra (Output Artifact & Code) |
| :--- | :--- | :--- | :--- |
| **1. Planning** | `planner` | Yêu cầu từ User + Codebase hiện tại | `docs/specs/<feature-slug>/plan.md` ([Mẫu](./resources/plan-template.md)) |
| **2A. DB Dev** | `db-dev` | `plan.md` (Data Contract) | Code trong `db/` (Models, Migrations, Repositories) |
| **2B. Backend Dev** | `backend-dev` | `plan.md` (API Contract) + `db/` | Code trong `backend/` (Schemas, Services, Routers) |
| **2C. Frontend Dev** | `frontend-dev` | `plan.md` (API Contract + UI Spec) | Code trong `frontend/` (Types, API Client, Pages/Components) |
| **3. Testing** | `qa-tester` | `plan.md` + Code (`db/`, `backend/`, `frontend/`) | Test suites + `docs/specs/<feature-slug>/test-report.md` ([Mẫu](./resources/test-report-template.md)) |
| **4. Review** | `code-reviewer` | `plan.md` + `test-report.md` + Toàn bộ Code | `docs/specs/<feature-slug>/review-report.md` ([Mẫu](./resources/review-report-template.md)) |

---

## 2. Hướng dẫn Điều phối Chi tiết cho Tech Lead (Main Agent)

### Bước 1: Khởi chạy `planner`
Gọi `invoke_subagent`:
- `TypeName`: `"planner"`
- `Role`: `"System Architect & Planner"`
- `Prompt`: Yêu cầu đọc `.agents/skills/team-pipeline/resources/plan-template.md` và tạo bản thiết kế đầy đủ tại `docs/specs/<feature-slug>/plan.md`.

### Bước 2: Khởi chạy Đội ngũ Dev (`db-dev`, `backend-dev`, `frontend-dev`)
Sau khi `plan.md` hoàn tất:
- **Chiến lược Tối ưu Tốc độ (2-Wave Parallelism)**:
  - **Wave 1**: Gọi `db-dev` để xây dựng tầng dữ liệu trong `db/` VÀ gọi đồng thời `frontend-dev` để xây dựng giao diện trong `frontend/` (vì `frontend-dev` chỉ cần API Contract từ `plan.md`).
  - **Wave 2**: Ngay khi `db-dev` hoàn tất các SQLAlchemy models trong `db/`, gọi `backend-dev` để kết nối `db/` với FastAPI routers/services trong `backend/`.
- **Chiến lược Toàn phần Song song (1-Wave Parallelism)**:
  - Nếu `plan.md` đã định nghĩa rõ tên class và chữ ký hàm của `db/`, bạn có thể gọi đồng thời cả 3 subagents (`db-dev`, `backend-dev`, `frontend-dev`) trong cùng một lệnh `invoke_subagent`.

### Bước 3: Khởi chạy `qa-tester` & Vòng lặp Tự sửa lỗi (Self-Healing Loop)
Gọi `invoke_subagent` với `TypeName: "qa-tester"`:
- Yêu cầu `qa-tester` đọc `plan.md`, viết và chạy test thực tế, sau đó xuất báo cáo theo mẫu `.agents/skills/team-pipeline/resources/test-report-template.md` tại `docs/specs/<feature-slug>/test-report.md`.
- Nếu `Status: FAILED`:
  - Xác định lỗi nằm ở `db/`, `backend/` hay `frontend/`.
  - Dùng `send_message` (tới `conversationId` của Dev subagent tương ứng) kèm chi tiết lỗi từ `test-report.md` để yêu cầu sửa ngay.
  - Sau khi Dev subagent sửa xong, nhắn `qa-tester` chạy lại test.

### Bước 4: Khởi chạy `code-reviewer` & Nghiệm thu Cuối cùng
Khi `test-report.md` đạt `PASSED`:
- Gọi `invoke_subagent` với `TypeName: "code-reviewer"` để kiểm định kiến trúc, bảo mật, hiệu năng và xuất `docs/specs/<feature-slug>/review-report.md` theo mẫu `.agents/skills/team-pipeline/resources/review-report-template.md`.
- Nếu Verdict là `CHANGES_REQUESTED`, điều phối Dev subagent sửa các mục `[CRITICAL]` / `[MAJOR]` và kiểm tra lại trước khi bàn giao cho User.
