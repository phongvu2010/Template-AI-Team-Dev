# AI Team Dev — Hệ thống Multi-Agent trên Antigravity 2.0

Workspace này đã được cấu hình chuẩn **Native Antigravity 2.0 Multi-Agent** theo **Mô hình Ma trận (Matrix Architecture)**:

$$\text{Tech Lead (Orchestrator)} \longrightarrow \text{Planner} \longrightarrow \begin{bmatrix} \text{DB Dev} \\ \text{Backend Dev} \\ \text{Frontend Dev} \end{bmatrix} \longrightarrow \text{QA Tester} \longrightarrow \text{Code Reviewer}$$

---

## 1. Kiến trúc & Danh sách 6 Subagents Chuyên biệt

| Subagent ID | Vai trò (Role) | Phạm vi (Scope) | Công nghệ phụ trách |
| :--- | :--- | :--- | :--- |
| [`planner`](.agents/agents/planner.md) | System Architect & Planner | `docs/specs/<slug>/plan.md` | Thiết kế DB Schema, OpenAPI Contract, UI Tree & Test Cases |
| [`db-dev`](.agents/agents/db-dev.md) | Database Specialist | `db/` | PostgreSQL, SQLAlchemy 2.0 (`AsyncSession`), Alembic |
| [`backend-dev`](.agents/agents/backend-dev.md) | Backend Specialist | `backend/` | Python 3.11+, FastAPI, Pydantic v2, Async Services |
| [`frontend-dev`](.agents/agents/frontend-dev.md) | Frontend Specialist | `frontend/` | React 19, Next.js (App Router), TypeScript Strict, Tailwind CSS |
| [`qa-tester`](.agents/agents/qa-tester.md) | QA & Automated Tester | `docs/specs/<slug>/test-report.md` | `pytest`, `httpx.AsyncClient`, `vitest`, `tsc --noEmit` |
| [`code-reviewer`](.agents/agents/code-reviewer.md) | Principal Code Reviewer | `docs/specs/<slug>/review-report.md` | Audit Kiến trúc, Bảo mật (OWASP), Hiệu năng (N+1) & A11y |

---

## 2. Cấu trúc Thư mục Workspace

```text
AI Team Dev/
├── AGENTS.md                                      # Quy tắc điều phối Tech Lead / Orchestrator toàn cục
├── .agents/
│   ├── agents/                                    # Định nghĩa 6 Subagents chuyên biệt
│   │   ├── planner.md
│   │   ├── db-dev.md
│   │   ├── backend-dev.md
│   │   ├── frontend-dev.md
│   │   ├── qa-tester.md
│   │   └── code-reviewer.md
│   └── skills/                                    # Bộ Skills & Runbooks tải theo ngữ cảnh (On-demand)
│       ├── team-pipeline/
│       │   ├── SKILL.md
│       │   └── resources/
│       │       ├── plan-template.md
│       │       ├── test-report-template.md
│       │       └── review-report-template.md
│       ├── db-sqlalchemy-alembic/SKILL.md
│       ├── backend-fastapi/SKILL.md
│       └── frontend-nextjs/SKILL.md
└── docs/
    └── specs/                                     # Nơi lưu trữ hồ sơ bàn giao (plan, test-report, review-report)
        └── README.md
```

---

## 3. Cách Sử dụng trên Giao diện Antigravity 2.0

### Cách 1: Chạy Toàn bộ Quy trình (`Planner -> Dev -> Testing -> Review`)
Chỉ cần nhập yêu cầu tính năng vào khung chat Antigravity 2.0, ví dụ:
> *"Hãy triển khai tính năng Quản lý Công việc (Task Management) gồm bảng tasks (title, status, priority, due_date), CRUD API trên FastAPI và trang Dashboard trên Next.js theo quy trình Multi-Agent."*

Agent chính (**Tech Lead**) sẽ tự động:
1. Gọi `planner` lập bản thiết kế tại `docs/specs/task-management/plan.md`.
2. Gọi `db-dev`, `backend-dev`, `frontend-dev` (chạy song song theo Contract) để viết code vào `db/`, `backend/`, `frontend/`.
3. Gọi `qa-tester` viết & chạy bộ kiểm thử tự động, xuất `test-report.md` (tự động điều phối sửa lỗi nếu test fail).
4. Gọi `code-reviewer` kiểm định chất lượng và xuất `review-report.md` (`APPROVED`).

### Cách 2: Gọi Trực tiếp Từng Team hoặc Giai đoạn
- *"Nhờ `planner` thiết kế kiến trúc cho phân hệ Thanh toán (Payment)."*
- *"Nhờ `db-dev` thêm bảng `categories` và tạo quan hệ 1-nhiều với `tasks`."*
- *"Nhờ `backend-dev` bổ sung bộ lọc phân trang cho API `/api/v1/tasks`."*
- *"Nhờ `frontend-dev` thiết kế lại form tạo Task có hiệu ứng loading."*
- *"Nhờ `qa-tester` chạy lại toàn bộ pytest và cập nhật báo cáo."*
- *"Nhờ `code-reviewer` kiểm tra bảo mật và hiệu năng cho thư mục `backend/`."*
