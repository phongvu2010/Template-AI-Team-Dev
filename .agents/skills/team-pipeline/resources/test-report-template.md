# QA & Automated Test Report: `<Feature Name>`

- **Feature Slug**: `<feature-slug>`
- **Tester**: `qa-tester`
- **Overall Status**: `PASSED` | `FAILED`

---

## 1. Tóm tắt Kết quả Kiểm thử (Test Execution Summary)

| Tầng (Layer) | Công cụ (Runner) | Tổng số Test | Passed | Failed | Ghi chú |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Database (`db/`)** | `pytest` | 0 | 0 | 0 | |
| **Backend (`backend/`)** | `pytest + httpx` | 0 | 0 | 0 | |
| **Frontend (`frontend/`)** | `tsc / vitest` | 0 | 0 | 0 | |

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
- **Tầng phụ trách**: `db-dev` | `backend-dev` | `frontend-dev`
- **File & Dòng**: `file:///...#L...`
- **Nguyên nhân gốc (Root Cause)**: ...
- **Hướng dẫn khắc phục**: ...
