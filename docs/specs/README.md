# Thư Mục Hồ Sơ Đặc Tả Kỹ Thuật & Bàn Giao Tính Năng (`docs/specs/`)

Mỗi tính năng mới được phát triển bởi **Multi-Agent Dev Team (Antigravity 2.0)** được quản lý trong một thư mục chuyên biệt `docs/specs/<feature-slug>/` theo chuẩn **Artifact Handover Schema**. Bộ hồ sơ này là hợp đồng giao tiếp kỹ thuật và bằng chứng nghiệm thu chất lượng giữa các giai đoạn:

```text
docs/specs/<feature-slug>/
├── plan.md            # [Giai đoạn 1] Bản thiết kế kiến trúc, hợp đồng dữ liệu 3 tầng & kịch bản kiểm thử
├── test-report.md     # [Giai đoạn 3] Kết quả kiểm thử tự động, độ phủ AC và phiếu báo lỗi Self-Healing
└── review-report.md   # [Giai đoạn 4] Thẩm định kiến trúc qua git diff, an toàn bảo mật và quyết định nghiệm thu
```

---

## 1. Chi Tiết 3 Tài Liệu Chuyển Giao Chuẩn Hóa

### 1. `plan.md` — Hợp Đồng Kỹ Thuật (Single Source of Truth)
- **Tác tử khởi tạo**: `planner` (System Architect & Planner).
- **Mẫu tham chiếu**: [plan-template.md](../../.agents/skills/team-pipeline/resources/plan-template.md).
- **Mục tiêu**:
  - Xác định mục tiêu và ranh giới nghiệp vụ (MVP vs Post-MVP).
  - **Ma trận Hợp đồng Dữ liệu Xuyên tầng (Cross-Layer Data Contract Matrix)**: Đồng bộ 100% tên trường (`snake_case`), kiểu dữ liệu giữa Database (PostgreSQL/SQLAlchemy), Backend (Pydantic v2) và Frontend (TypeScript Strict).
  - Đặc tả REST API Endpoints (Request payload, Success response, Error standard response).
  - Kiến trúc giao diện Next.js App Router và xử lý đủ **4 trạng thái UI**: `Loading`, `Error`, `Empty`, `Success`.
  - Ma trận truy xuất yêu cầu: Liên kết trực tiếp giữa Tiêu chí Nghiệm thu (`AC-ID`) và Kịch bản Kiểm thử (`TC-ID`).
  - Phân rã nhiệm vụ nguyên tử (Atomic Tasks) theo mô hình 2-Wave.

### 2. `test-report.md` — Báo Cáo Kiểm Thử Tự Động & Chẩn Đoán Lỗi
- **Tác tử khởi tạo**: `qa-tester` (QA & Automated Tester).
- **Mẫu tham chiếu**: [test-report-template.md](../../.agents/skills/team-pipeline/resources/test-report-template.md).
- **Mục tiêu**:
  - Ghi nhận chỉ số kiểm thử tự động: Tổng số bài test, số bài đạt/thất bại, thời gian thực thi.
  - Kiểm tra 4 tầng cô lập: Linter (`.venv/bin/ruff`), Database & Backend (`PYTHONPATH=src .venv/bin/pytest` với SQLite in-memory fallback), Frontend (`npm run typecheck`).
  - **Phiếu Báo Lỗi Có Cấu Trúc (Structured Bug Tickets)**: Cung cấp mã lỗi (`BUG-ID`), mức độ (`CRITICAL`, `MAJOR`, `MINOR`), tác tử phụ trách, file & dòng vi phạm, traceback nguyên văn và lệnh tái hiện phục vụ vòng lặp **Self-Healing Loop**.

### 3. `review-report.md` — Thẩm Định Kiến Trúc & An Toàn Bảo Mật
- **Tác tử khởi tạo**: `code-reviewer` (Principal Code Reviewer & Security Auditor).
- **Mẫu tham chiếu**: [review-report-template.md](../../.agents/skills/team-pipeline/resources/review-report-template.md).
- **Mục tiêu**:
  - Áp dụng phương pháp thẩm định tiết kiệm token qua `git diff` tập trung vào những thay đổi mới trong `src/`.
  - Chấm điểm **Bảng Cổng Chất Lượng (Quality Gate Scorecard)** qua 5 tiêu chí: Hợp đồng dữ liệu, Hiệu năng DB (chống N+1 query), Bảo mật Backend (OWASP), Frontend Type Safety & A11y, Độ phủ kiểm thử.
  - **Phiếu Đánh Giá Chi Tiết (Structured Finding Tickets)**: Phân loại theo cấp độ (`[CRITICAL]`, `[MAJOR]`, `[MINOR]`, `[NIT]`), trích xuất đoạn code vi phạm và hướng dẫn khắc phục cụ thể.
  - Ra quyết định cuối cùng (**Final Verdict**):
    - `APPROVED`: Cung cấp thông điệp commit chuẩn Conventional Commits sẵn sàng để Tech Lead đóng gói tại Bước 5.
    - `CHANGES_REQUESTED`: Yêu cầu Tech Lead kích hoạt vòng lặp khắc phục phản hồi review (`[REVIEW-FIX ACTION REQUIRED]`).

---

## 2. Tiêu Chuẩn Metadata Header (YAML Frontmatter)

Cả 3 tài liệu bàn giao bắt buộc phải chứa khối khai báo Metadata chuẩn ở đầu file:

```yaml
---
feature_slug: "<feature-slug>"
version: "1.0.0"
artifact_type: "plan" # plan | test-report | review-report
author: "planner"     # planner | qa-tester | code-reviewer
created_at: "YYYY-MM-DDTHH:MM:SSZ"
updated_at: "YYYY-MM-DDTHH:MM:SSZ"
status: "READY_FOR_DEV" # DRAFT | READY_FOR_DEV | IN_DEV | TESTING | REVIEWING | APPROVED | REJECTED
iteration: 1          # Số lần lặp lại quy trình sửa lỗi (tối đa 3)
---
```

---

## 3. Vòng Lặp Phản Hồi Tự Động & Ngắt Mạch (Feedback Loop & Circuit Breaker)

Quy trình quản lý trạng thái và phản hồi tự động tuân thủ nghiêm ngặt các mốc:
1. **Kiểm thử thất bại (`qa-tester` báo FAILED)**:
   - Tech Lead gửi tin nhắn `[SELF-HEALING ACTION REQUIRED]` tới Dev Squad chịu trách nhiệm.
   - Dev Squad khắc phục trong phân vùng thư mục của mình, chạy smoke test và gửi phản hồi `[FIX-COMPLETED]`.
   - `qa-tester` chạy lại bài test. Bộ đếm `iteration` tăng thêm 1.
2. **Review yêu cầu sửa đổi (`code-reviewer` báo CHANGES_REQUESTED)**:
   - Tech Lead gửi tin nhắn `[REVIEW-FIX ACTION REQUIRED]` tới Dev Squad tương ứng.
   - Dev Squad hoàn tất sửa chữa và gửi phản hồi `[FIX-COMPLETED]`.
   - `qa-tester` chạy lại test suite, sau đó `code-reviewer` thẩm định lại.
3. **Cơ chế Ngắt Mạch (Circuit Breaker Protocol)**:
   - Số vòng lặp tối đa cho mỗi tính năng là **3 lần** (`MAX_ITERATIONS = 3`).
   - Nếu sau 3 lần lặp vẫn chưa đạt `PASSED` và `APPROVED`, hệ thống tự động tạm dừng, bảo lưu hiện trạng mã nguồn và xuất báo cáo leo thang cho User / Product Owner xử lý.
