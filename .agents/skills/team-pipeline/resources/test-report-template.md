# QA & Automated Test Report: `<Feature Name>`

- **Feature Slug**: `<feature-slug>`
- **Tester**: `qa-tester`
- **Overall Status**: `PASSED` | `FAILED`

---

## 1. Tóm tắt Kết quả Kiểm thử (Test Execution Summary)

| Tầng (Layer) | Thư mục kiểm thử | Công cụ (Runner) | Tổng số Test | Passed | Failed | Ghi chú |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **Database (`src/db/`)** | `src/backend/tests/` hoặc `src/db/tests/` | `PYTHONPATH=src pytest` | 0 | 0 | 0 | SQLite memory fallback |
| **Backend (`src/backend/`)** | `src/backend/tests/` | `PYTHONPATH=src pytest` | 0 | 0 | 0 | `httpx.AsyncClient` |
| **Frontend (`src/frontend/`)** | `src/frontend/` | `tsc --noEmit / vitest` | 0 | 0 | 0 | Type safety & components |

---

## 2. Chi tiết Các Kịch bản Đã Kiểm thử (Test Cases)
- [x] **TC-01**: ...
- [x] **TC-02**: ...

---

## 3. Lệnh Thực thi & Kết quả Đầu ra (Command Output)
```text
<Dán kết quả chạy pytest / vitest / tsc tại đây>
```

---

## 4. Danh sách Lỗi Phát hiện (Bugs & Diagnostics — Nếu `FAILED`)

> Nếu tất cả đều `PASSED`, ghi: *"Không phát hiện lỗi."*

### [BUG-01] `<Tiêu đề lỗi>`
- **Tầng phụ trách**: `db-dev` (`src/db/`) | `backend-dev` (`src/backend/`) | `frontend-dev` (`src/frontend/`)
- **File & Dòng**: `file:///...#L...`
- **Nguyên nhân gốc (Root Cause)**: ...
- **Hướng dẫn khắc phục**: ...
