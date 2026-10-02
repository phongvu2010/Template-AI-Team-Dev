# Frontend Layer Rules (`src/frontend/AGENTS.md`)

Quy tắc bắt buộc khi bất kỳ Agent nào (`frontend-dev`, `qa-tester`, `code-reviewer`) thao tác trong thư mục `src/frontend/`:

---

## 1. Rào Chắn An Toàn Dòng Lệnh & Phân Quyền (CLI Guardrails)
- **Quyền sở hữu File**: Tác tử `frontend-dev` chỉ được tạo và chỉnh sửa file trong `src/frontend/`. Tuyệt đối không can thiệp vào `src/db/` hay `src/backend/`.
- **Lệnh được phép**:
  - `npm --prefix src/frontend run typecheck`
  - `npm --prefix src/frontend run lint`
  - `npm --prefix src/frontend run build`
- **Lệnh cấm tuyệt đối**:
  - Cấm `rm -rf`, `git reset`, `git checkout`.
  - Cấm chạy lệnh `npm install` trần trong sandbox. Khi cần thêm package mới (như `lucide-react`, `zod`, `clsx`), cập nhật trực tiếp vào `dependencies` hoặc `devDependencies` trong `src/frontend/package.json` và gắn cờ `[DEPENDENCY REQUIRED]`.
  - Cấm sửa code ngoài `src/frontend/`.

---

## 2. Tuân Thủ Hợp Đồng API & Dữ Liệu Xuyên Tầng (Contract Alignment)
- Mọi dữ liệu trao đổi với Backend phải được định nghĩa interface rõ ràng tại `src/frontend/src/types/` và khớp 100% với mục **Cross-Layer Data Contract Matrix** và **API Contract** trong `docs/specs/<feature-slug>/plan.md`.
- **Casing**: Interface properties sử dụng thống nhất chuẩn **`snake_case`** theo đúng hợp đồng REST API JSON. Không tự ý đổi tên trường sang `camelCase` khi nhận từ API để tránh lỗi `undefined` tại runtime.
- **Strict TypeScript — Tuyệt đối không dùng `any`**: Mọi props, state, tham số và giá trị trả về đều phải có kiểu tường minh.

---

## 3. Wave 1 Mocking & Trải Nghiệm Giao Diện (UX & A11y)
- **Chiến lược Mocking Wave 1**: Khi Backend chưa triển khai (Wave 1), tạo mock fixtures tại `src/frontend/src/lib/api/mocks/<resource>.ts` bám sát `plan.md` và hỗ trợ flag `NEXT_PUBLIC_USE_MOCKS=true` để kiểm chứng UI độc lập, không để xảy ra unhandled fetch exception.
- **Bắt buộc Xử lý Đủ 4 Trạng Thái UI**:
  1. **Loading state**: Skeleton loader hoặc spinner tương ứng layout.
  2. **Error state**: Alert thông báo lỗi rõ ràng kèm nút Thử lại (Retry).
  3. **Empty state**: Giao diện khi dữ liệu rỗng kèm nút hành động (CTA) tạo mới.
  4. **Success state**: Render dữ liệu chuẩn xác, responsive trên di động và máy tính.
- **Accessibility (A11y)**: Sử dụng HTML ngữ nghĩa (`<main>`, `<nav>`, `<form>`, `<button>`), mọi ô nhập phải có `<label htmlFor="...">`, nút icon phải có `aria-label`.

---

## 4. Tham Gia Vòng Lặp Sửa Lỗi (Feedback Loop Protocol)
Khi nhận tin nhắn điều phối `[SELF-HEALING ACTION REQUIRED]` từ QA hoặc `[REVIEW-FIX ACTION REQUIRED]` từ Reviewer:
1. Phân tích nguyên nhân và **chỉ chỉnh sửa trong phạm vi `src/frontend/`**.
2. Kiểm tra smoke check: `npm --prefix src/frontend run typecheck`.
3. Gửi thông điệp phản hồi `[FIX-COMPLETED]` cho Tech Lead Orchestrator:
   ```text
   [FIX-COMPLETED]
   - Feature: <feature-slug>
   - Iteration: <iteration_number>
   - Target Agent: frontend-dev
   - Modified Files: src/frontend/...
   - Resolved Bug/Finding IDs: <BUG-01 hoặc REV-01>
   - Summary of Fix: <mô tả ngắn giải pháp đã thực hiện>
   ```
