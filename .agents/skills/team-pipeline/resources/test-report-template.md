# QA & Automated Test Report: `<Feature Name>`

- **Feature Slug**: `<feature-slug>`
- **Tester**: `qa-tester`
- **Overall Status**: `PASSED` | `FAILED`

---

## 1. Tóm tắt Kết quả Kiểm thử (Test Execution Summary)

| Tầng (Layer) | Thư mục kiểm thử | Công cụ (Runner) | Trạng thái / Passed | Failed | Ghi chú |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Linter & Code Standards** | `src/` | `.venv/bin/ruff check src/` | PASSED | 0 | Syntax, imports, code style |
| **Database (`src/db/`)** | `src/backend/tests/` hoặc `src/db/tests/` | `PYTHONPATH=src .venv/bin/pytest` | 0 | 0 | SQLite memory fallback |
| **Backend (`src/backend/`)** | `src/backend/tests/` | `PYTHONPATH=src .venv/bin/pytest` | 0 | 0 | `httpx.AsyncClient` |
| **Frontend (`src/frontend/`)** | `src/frontend/` | `npm --prefix src/frontend run typecheck` | 0 | 0 | Strict TypeScript safety |

---

## 2. Chi tiết Các Kịch bản Đã Kiểm thử (Test Cases)
- [x] **TC-01**: ...
- [x] **TC-02**: ...

---

## 3. Lệnh Thực thi & Kết quả Đầu ra (Command Output)
```text
# 1. Ruff Linter Output:
.venv/bin/ruff check src/
All checks passed!

# 2. Pytest Output:
PYTHONPATH=src ./.venv/bin/pytest src/backend/tests -v
...

# 3. Frontend Typecheck Output:
npm --prefix src/frontend run typecheck
...
```

---

## 4. Danh sách Lỗi Phát hiện (Bugs & Diagnostics — Nếu `FAILED`)

> Nếu tất cả đều `PASSED`, ghi: *"Không phát hiện lỗi."*

### [BUG-01] `<Tiêu đề lỗi>`
- **Tầng phụ trách**: `db-dev` (`src/db/`) | `backend-dev` (`src/backend/`) | `frontend-dev` (`src/frontend/`)
- **File & Dòng**: `src/...#L...`
- **Nguyên nhân gốc (Root Cause)**: ...
- **Hướng dẫn khắc phục**: ...
