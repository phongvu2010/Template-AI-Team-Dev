# Thư mục Hồ sơ Thiết kế & Nghiệm thu Tính năng (`docs/specs/`)

Mỗi tính năng được phát triển bởi **Multi-Agent Dev Team** sẽ có một thư mục riêng `docs/specs/<feature-slug>/` chứa 3 tài liệu bàn giao chuẩn giữa các giai đoạn:

1. **`plan.md`** *(Do `planner` tạo)*:
   - Bản thiết kế kỹ thuật tổng thể: Data Contract (`src/db/`), API Contract (`src/backend/` & `src/frontend/`), UI Architecture (`src/frontend/`) và Acceptance Criteria (`qa-tester`).
2. **`test-report.md`** *(Do `qa-tester` tạo)*:
   - Kết quả chạy kiểm thử tự động (`PYTHONPATH=src pytest`, `tsc`), độ phủ kịch bản và chẩn đoán lỗi (nếu `FAILED`).
3. **`review-report.md`** *(Do `code-reviewer` tạo)*:
   - Báo cáo thẩm định kiến trúc, bảo mật, hiệu năng trên `git diff` của `src/` và quyết định nghiệm thu cuối cùng (`APPROVED` hoặc `CHANGES_REQUESTED`).
