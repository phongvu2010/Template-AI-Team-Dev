# AI Team Dev — Hệ thống Multi-Agent trên Antigravity 2.0

Workspace này đã được cấu hình chuẩn **Native Antigravity 2.0 Multi-Agent** theo **Mô hình Ma trận (Matrix Architecture)**:

> 🚀 **Hướng dẫn Dùng Template Cho Dự Án Mới**: Xem cẩm nang chi tiết tại [TEMPLATE_GUIDE.md](TEMPLATE_GUIDE.md) để biết cách khởi tạo repo mới, cài đặt môi trường chỉ trong 2 phút và các câu lệnh mẫu.

---

## 🎯 Định Vị Template: Dự Án Nào Phù Hợp Chính Xác?

Template này được tối ưu hoá chuyên sâu cho các dự án **Full-Stack Web Applications Hiện Đại** sử dụng bộ đôi công nghệ **Python (FastAPI) + TypeScript (Next.js)** kết hợp cơ sở dữ liệu quan hệ **PostgreSQL**.

### 1. Hệ sinh thái Công nghệ Cố định (Fixed Stack Foundation)
- **Database (`src/db/`)**: PostgreSQL 16+, SQLAlchemy 2.0 (Async), asyncpg, Alembic migrations tự động. Tương thích cross-DB tuyệt đối giữa SQLite in-memory test và PostgreSQL runtime (UUID sinh qua Python `default=uuid.uuid4`, mảng dữ liệu qua `JSON`), tích hợp sẵn Seed Runner tại `src/db/seeds/`.
- **Backend API (`src/backend/`)**: Python 3.11+, FastAPI (REST API), Pydantic v2 validation, Ruff linter, Pytest.
- **Frontend Web (`src/frontend/`)**: React 19, Next.js (App Router), TypeScript (Strict), Tailwind CSS.
- **Kiểm thử Cô lập**: SQLite async in-memory fallback giúp chạy toàn bộ test không cần cài PostgreSQL local.

### 2. Các Loại Dự Án Phù Hợp Nhất (Sweet Spot / Best Fit)
| Loại hình dự án | Mô tả chi tiết | Độ phù hợp |
| :--- | :--- | :---: |
| **SaaS Web Platforms** | Các ứng dụng SaaS quản lý thuê bao, xác thực, phân quyền (RBAC), thanh toán và dashboard báo cáo số liệu. | ⭐⭐⭐⭐⭐ (Hoàn hảo) |
| **B2B / B2C Web Portals** | Cổng thông tin khách hàng, cổng đối tác, sàn dịch vụ, booking, marketplace vừa và nhỏ. | ⭐⭐⭐⭐⭐ (Hoàn hảo) |
| **Internal Tools & Dashboards** | Hệ thống CRM nội bộ, quản trị bán hàng, theo dõi đơn hàng, quản lý kho bãi, nhân sự. | ⭐⭐⭐⭐⭐ (Hoàn hảo) |
| **Startup MVP $\to$ Production** | Dự án khởi nghiệp cần đưa tính năng ra thị trường thần tốc bằng AI nhưng kiến trúc vẫn sạch và mở rộng được. | ⭐⭐⭐⭐⭐ (Hoàn hảo) |
| **REST API Micro/Modular Backend** | Cần một Backend API chuẩn mực, có Swagger UI tự động và tài liệu hợp đồng API chặt chẽ. | ⭐⭐⭐⭐ (Rất tốt) |

### 3. Khi Nào KHÔNG NÊN Dùng Template Này? (Non-Goals)
- ❌ **Dự án Mobile App thuần (Native iOS/Android / Flutter / React Native)**: Template này chỉ xây dựng Web App Next.js (trừ khi bạn chỉ cần phần Backend API).
- ❌ **Hệ thống Microservices đa ngôn ngữ (Java, Go, Rust, .NET)**: Template này thiết kế tối ưu cho mô hình **Modular Monolith** hoặc 2-Tier (FastAPI + Next.js).
- ❌ **Data Science / Machine Learning thuần túy**: Nếu dự án chỉ chạy Jupyter Notebook, huấn luyện model PyTorch/TensorFlow lớn mà không cần web/API.
- ❌ **Website tĩnh đơn giản (Static Blog, Landing Page 1 trang)**: Nên dùng Astro, Hugo hoặc Next.js static thuần không cần DB/FastAPI.

---

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
                                  └───────────┬────────────┘
                                              │
                                              ▼
                                  ┌────────────────────────┐
                                  │   5. COMMIT & HANDOFF  │
                                  │ (Conventional Commits) │
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
| [`qa-tester`](.agents/agents/qa-tester.md) | QA & Automated Tester | `docs/specs/<slug>/test-report.md` | Linter `ruff` (.venv/bin/ruff), `pytest` (`.venv/bin/pytest`), SQLite fallback, `npm run typecheck` |
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
│   ├── db/                                        # Models, session, repositories, migrations, seeds
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
4. Gọi `qa-tester` chạy kiểm tra `ruff` linter và bộ kiểm thử tự động với `PYTHONPATH=src .venv/bin/pytest src/backend/tests -v` và xuất `test-report.md`.
5. Gọi `code-reviewer` audit qua `git diff` và xuất `review-report.md` (`APPROVED`).
6. **Đóng gói & Commit**: Tự động rà soát `git status` và tạo commit chuẩn Conventional Commits `feat(<slug>): ...` ghi nhận mốc hoàn thành.

### Cách 2: Gọi Trực tiếp Từng Squad hoặc Giai đoạn
- *"Nhờ `planner` thiết kế kiến trúc phân hệ Sản phẩm."*
- *"Nhờ `db-dev` thêm trường `thumbnail_url` vào bảng `categories` tại `src/db/`."*
- *"Nhờ `backend-dev` viết thêm endpoint lọc danh mục tại `src/backend/`."*
- *"Nhờ `frontend-dev` hoàn thiện component CategoryCard tại `src/frontend/`."*
- *"Nhờ `qa-tester` kiểm tra lint và chạy lại pytest cho tầng backend."*
- *"Nhờ `code-reviewer` review các thay đổi mới nhất qua git diff."*
