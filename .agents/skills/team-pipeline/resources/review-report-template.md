# Principal Code Review & Security Audit Report: `<Feature Name>`

- **Feature Slug**: `<feature-slug>`
- **Reviewer**: `code-reviewer`
- **Final Verdict**: `APPROVED` | `CHANGES_REQUESTED`

---

## 1. Đánh giá Tổng quan (Executive Assessment)

| Hạng mục Kiểm định | Trạng thái | Nhận xét |
| :--- | :---: | :--- |
| **1. Tuân thủ Contract (`plan.md`)** | Pass / Fail | |
| **2. Database & Hiệu năng (`db/`)** | Pass / Fail | |
| **3. Backend & Bảo mật (`backend/`)** | Pass / Fail | |
| **4. Frontend & Accessibility (`frontend/`)** | Pass / Fail | |
| **5. Độ phủ Kiểm thử (`test-report.md`)** | Pass / Fail | |

---

## 2. Danh sách Phát hiện Chi tiết (Findings)

> Phân loại mức độ:
> - `[CRITICAL]`: Lỗi bảo mật, mất dữ liệu, crash hoặc sai lệch hợp đồng API (Bắt buộc sửa).
> - `[MAJOR]`: Lỗi N+1 query, thiếu xử lý lỗi, dùng `any`, thiếu validation quan trọng (Bắt buộc sửa).
> - `[MINOR]`: Code smell, đặt tên chưa tối ưu, có thể cải thiện hiệu năng nhỏ.
> - `[NIT]`: Gợi ý phong cách code / định dạng.

### 2.1. Mục cần sửa bắt buộc (`[CRITICAL]` & `[MAJOR]`)
- Không có (hoặc liệt kê chi tiết kèm link `file:///...#L...` và đội phụ trách `db-dev` / `backend-dev` / `frontend-dev`).

### 2.2. Gợi ý cải tiến (`[MINOR]` & `[NIT]`)
- ...

---

## 3. Kết luận Nghiệm thu (Sign-off)
- **Trạng thái bàn giao**: Sẵn sàng merge / Cần sửa lại theo mục 2.1.
