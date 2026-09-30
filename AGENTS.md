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
      ├──► Phase 2: DEV SQUADS (Chạy theo Contract từ `plan.md`)
      │      ├── `db-dev`       (PostgreSQL + SQLAlchemy 2.0 + Alembic)
      │      ├── `backend-dev`  (Python 3.11+ + FastAPI + Pydantic v2)
      │      └── `frontend-dev` (React / Next.js + TypeScript + Tailwind)
      │
      ├──► Phase 3: TESTING (`qa-tester`)
      │      └── Viết & chạy Unit/Integration/E2E Tests (`pytest`, `vitest`)
      │      └── Xuất bản: `docs/specs/<feature-slug>/test-report.md`
      │          (Nếu FAILED -> Điều phối ngược lại Dev Squad tương ứng để fix)
      │
      └──► Phase 4: CODE REVIEW (`code-reviewer`)
             └── Kiểm định Kiến trúc, Bảo mật (OWASP), Hiệu năng (N+1), Type Safety
             └── Xuất bản: `docs/specs/<feature-slug>/review-report.md`
                 (Verdict: `APPROVED` hoặc `CHANGES_REQUESTED`)
```

---

## 1. Tech Stack Chuẩn của Dự án

- **Database (`db/`)**: PostgreSQL, SQLAlchemy 2.0 (`AsyncSession`, `Mapped`, `mapped_column`, `asyncpg`), Alembic.
- **Backend (`backend/`)**: Python 3.11+, FastAPI, Pydantic v2 (`ConfigDict(from_attributes=True)`), `pytest` + `httpx.AsyncClient`.
- **Frontend (`frontend/`)**: Next.js (App Router), React 19, TypeScript (Strict mode), Tailwind CSS.
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
   - Thiết kế bảng, khoá ngoại, index cho `db-dev`.
   - Hợp đồng REST API (Endpoint, Method, Request/Response JSON, Status Code) cho `backend-dev` và `frontend-dev`.
   - Cấu trúc trang/component và trạng thái UI cho `frontend-dev`.
   - Kịch bản kiểm thử (Acceptance Criteria) cho `qa-tester`.

### Bước 2: Giai đoạn Development (`db-dev`, `backend-dev`, `frontend-dev`)
Sau khi `docs/specs/<feature-slug>/plan.md` hoàn tất:
1. **Triển khai Database & Code song song (Parallel Execution)**:
   - Nếu tính năng cần cả DB, Backend và Frontend:
     - Có thể chạy `db-dev` trước để khởi tạo Models/Migrations nền tảng trong `db/`, sau đó gọi **song song** `backend-dev` và `frontend-dev` trong **cùng một lệnh `invoke_subagent`** (vì cả hai đã có API Contract cố định trong `plan.md`).
     - Hoặc nếu cấu trúc model đã được định nghĩa rõ ràng trong `plan.md` và không xung đột file, có thể gọi đồng thời cả 3 subagents (`db-dev`, `backend-dev`, `frontend-dev`) trong mảng `Subagents` của `invoke_subagent`.
2. **Phân vùng phạm vi file nghiêm ngặt (File Ownership Isolation)**:
   - `db-dev` chỉ ghi file trong `db/` (models, session, migrations, seeds).
   - `backend-dev` chỉ ghi file trong `backend/` (routers, schemas, services, dependencies).
   - `frontend-dev` chỉ ghi file trong `frontend/` (app routes, components, hooks, api clients, types).
   - Quy tắc này đảm bảo các subagent chạy song song (`Workspace: "inherit"`) không bao giờ ghi đè file của nhau.

### Bước 3: Giai đoạn Testing (`qa-tester`)
Sau khi các Dev subagents hoàn thành:
1. Gọi `invoke_subagent` với `TypeName: "qa-tester"` (Role: `"QA & Automated Tester"`).
2. `qa-tester` đọc `plan.md`, viết test tự động (`backend/tests/`, `frontend/`), thực thi test bằng `run_command` và xuất `docs/specs/<feature-slug>/test-report.md`.
3. **Vòng lặp Sửa lỗi (Self-Healing Bug Fix Loop)**:
   - Nếu `test-report.md` báo `FAILED`, Orchestrator phân tích nguyên nhân lỗi thuộc tầng nào (`db`, `backend`, hay `frontend`) và gửi tin nhắn (`send_message`) hoặc gọi lại đúng Dev subagent đó để sửa lỗi, sau đó chạy lại `qa-tester` cho đến khi `PASSED` (tối đa 3 vòng lặp).

### Bước 4: Giai đoạn Code Review (`code-reviewer`)
Sau khi `qa-tester` xác nhận `PASSED`:
1. Gọi `invoke_subagent` với `TypeName: "code-reviewer"` (Role: `"Principal Code Reviewer"`).
2. `code-reviewer` kiểm tra toàn bộ code mới cùng `plan.md` và `test-report.md`, sau đó xuất `docs/specs/<feature-slug>/review-report.md`.
3. Nếu Verdict là `CHANGES_REQUESTED` (có lỗi `[CRITICAL]` hoặc `[MAJOR]`), Orchestrator điều phối Dev subagent tương ứng khắc phục và yêu cầu `qa-tester` / `code-reviewer` xác nhận lại.
4. Khi Verdict đạt `APPROVED`, tổng hợp báo cáo ngắn gọn cho User kèm liên kết tới các file đã tạo và bộ tài liệu trong `docs/specs/<feature-slug>/`.

---

## 3. Chế độ Gọi Nhanh (Direct Squad Invocation)

Ngoài việc chạy toàn bộ pipeline 4 bước, nếu người dùng chỉ yêu cầu tác vụ đơn lẻ:
- **"Thiết kế / Lập kế hoạch..."** -> Chỉ gọi `planner`.
- **"Tạo bảng / Migration / Tối ưu SQL..."** -> Gọi `db-dev`.
- **"Viết API / Sửa logic FastAPI..."** -> Gọi `backend-dev`.
- **"Làm giao diện / Component Next.js..."** -> Gọi `frontend-dev`.
- **"Viết test / Kiểm thử tính năng..."** -> Gọi `qa-tester`.
- **"Review code / Audit bảo mật..."** -> Gọi `code-reviewer`.
