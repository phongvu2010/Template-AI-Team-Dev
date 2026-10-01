# AI Team Dev — Hệ thống Multi-Agent trên Antigravity 2.0

Workspace này đã được cấu hình chuẩn **Native Antigravity 2.0 Multi-Agent** theo **Mô hình Ma trận (Matrix Architecture)**:

```text
                                  ┌────────────────────────┐
                                  │      1. PLANNER        │
                                  │ (docs/specs/<slug>/)   │
                                  └───────────┬────────────┘
                                              │
                                              ▼
               ┌─────────────────────────────────────────────────────────────┐
               │              2. DEV SQUADS (2-Wave Execution)               │
               │                                                             │
               │  [Wave 1 - Song song]                                       │
               │  ├── db-dev       ──► src/db/ (SQLAlchemy 2.0 Models)       │
               │  └── frontend-dev ──► src/frontend/ (Next.js UI & Types)    │
               │                                                             │
               │  [Wave 2]                                                   │
               │  └── backend-dev  ──► src/backend/ (FastAPI + Pydantic v2)  │
               └──────────────────────────────┬──────────────────────────────┘
                                              │
                                              ▼
                                  ┌────────────────────────┐
                                  │      3. QA TESTER      │
                                  │  (pytest / vitest/tsc) │
                                  └───────────┬────────────┘
                                              │
                                              ▼
                                  ┌────────────────────────┐
                                  │    4. CODE REVIEWER    │
                                  │ (Token-optimized diff) │
                                  └────────────────────────┘
```

---

## 1. Kiến trúc & Danh sách 6 Subagents Chuyên biệt

| Subagent ID | Vai trò (Role) | Phạm vi (Scope) | Công nghệ phụ trách |
| :--- | :--- | :--- | :--- |
| [`planner`](.agents/agents/planner.md) | System Architect & Planner | `docs/specs/<slug>/plan.md` | Thiết kế DB Schema, OpenAPI Contract, UI Tree & Test Cases |
| [`db-dev`](.agents/agents/db-dev.md) | Database Specialist | `src/db/` | PostgreSQL, SQLAlchemy 2.0 (`AsyncSession`), Alembic |
| [`frontend-dev`](.agents/agents/frontend-dev.md) | Frontend Specialist | `src/frontend/` | React 19, Next.js (App Router), TypeScript Strict, Tailwind CSS |
| [`backend-dev`](.agents/agents/backend-dev.md) | Backend Specialist | `src/backend/` | Python 3.11+, FastAPI, Pydantic v2, Async Services |
| [`qa-tester`](.agents/agents/qa-tester.md) | QA & Automated Tester | `docs/specs/<slug>/test-report.md` | `pytest` (`PYTHONPATH=src`), SQLite memory fallback, `tsc --noEmit` |
| [`code-reviewer`](.agents/agents/code-reviewer.md) | Principal Code Reviewer | `docs/specs/<slug>/review-report.md` | Audit `git diff`, Kiến trúc, Bảo mật (OWASP), N+1 & A11y |

---

## 2. Cấu trúc Thư mục Workspace

```text
AI Team Dev/
├── AGENTS.md                                      # Quy tắc điều phối Tech Lead / Orchestrator toàn cục
├── pyproject.toml                                 # Khởi tạo dependencies & pytest pythonpath=["src"]
├── docker-compose.yml                             # Khởi chạy PostgreSQL 16 Alpine local
├── .env.example                                   # Biến môi trường mẫu cho DB, API, Frontend
├── .gitignore                                     # Bỏ qua bytecode, node_modules, cache
├── .agents/
│   ├── agents/                                    # Định nghĩa 6 Subagents chuyên biệt
│   │   ├── planner.md
│   │   ├── db-dev.md
│   │   ├── backend-dev.md
│   │   ├── frontend-dev.md
│   │   ├── qa-tester.md
│   │   └── code-reviewer.md
│   └── skills/                                    # Bộ Skills & Runbooks tải theo ngữ cảnh
│       ├── team-pipeline/
│       │   ├── SKILL.md
│       │   └── resources/
│       │       ├── plan-template.md
│       │       ├── test-report-template.md
│       │       └── review-report-template.md
│       ├── db-sqlalchemy-alembic/SKILL.md
│       ├── backend-fastapi/SKILL.md
│       └── frontend-nextjs/SKILL.md
├── src/                                           # Thư mục mã nguồn thực thi tập trung
│   ├── db/                                        # Models, session, repositories, migrations
│   ├── backend/                                   # FastAPI app, schemas, services, api routers, tests
│   └── frontend/                                  # Next.js app router, components, lib api, types
└── docs/
    └── specs/                                     # Hồ sơ bàn giao tính năng (plan, test, review)
        └── README.md
```

---

## 3. Cách Sử dụng trên Giao diện Antigravity 2.0

### Cách 1: Chạy Toàn bộ Quy trình (`Planner -> Dev (2-Wave) -> Testing -> Review`)
Người dùng chỉ cần nhập yêu cầu tính năng vào chat Antigravity, ví dụ:
> *"Hãy triển khai tính năng Quản lý Danh mục (Category Management) gồm bảng categories (id, name, slug, description), CRUD API trên FastAPI và trang giao diện trên Next.js theo quy trình Multi-Agent."*

Agent chính (**Tech Lead**) sẽ tự động:
1. Gọi `planner` lập bản thiết kế tại `docs/specs/category-management/plan.md`.
2. **Wave 1**: Gọi song song `db-dev` (viết model trong `src/db/`) và `frontend-dev` (dựng UI/Types trong `src/frontend/`).
3. **Wave 2**: Gọi `backend-dev` viết router & service trong `src/backend/` kết nối trực tiếp `src/db/`.
4. Gọi `qa-tester` chạy bộ kiểm thử tự động với `PYTHONPATH=src` và xuất `test-report.md`.
5. Gọi `code-reviewer` audit qua `git diff` và xuất `review-report.md` (`APPROVED`).

### Cách 2: Gọi Trực tiếp Từng Squad hoặc Giai đoạn
- *"Nhờ `planner` thiết kế kiến trúc phân hệ Sản phẩm."*
- *"Nhờ `db-dev` thêm trường `thumbnail_url` vào bảng `categories` tại `src/db/`."*
- *"Nhờ `backend-dev` viết thêm endpoint lọc danh mục tại `src/backend/`."*
- *"Nhờ `frontend-dev` hoàn thiện component CategoryCard tại `src/frontend/`."*
- *"Nhờ `qa-tester` chạy lại pytest cho tầng backend."*
- *"Nhờ `code-reviewer` review các thay đổi mới nhất qua git diff."*
