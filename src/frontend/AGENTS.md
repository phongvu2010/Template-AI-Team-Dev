# Frontend Layer Rules (`frontend/AGENTS.md`)

Quy tắc bắt buộc khi bất kỳ Agent nào (`frontend-dev`, `qa-tester`, `code-reviewer`) thao tác trong thư mục `frontend/`:

1. **Strict TypeScript — Không dùng `any`**:
   - Mọi dữ liệu trao đổi với Backend phải được định nghĩa interface rõ ràng tại `src/types/` và khớp 100% với **API Contract** trong `docs/specs/<feature-slug>/plan.md`.
2. **Next.js App Router Conventions**:
   - Mặc định viết **Server Components**; chỉ thêm `"use client"` ở đầu file khi component thực sự cần React hooks (`useState`, `useEffect`), browser APIs hoặc event listeners (`onClick`, `onSubmit`).
   - Tách biệt rõ tầng gọi API (`src/lib/api/`) khỏi tầng giao diện (`src/components/`, `src/app/`).
3. **Bắt buộc Đủ 4 Trạng thái Giao diện (UI States)**:
   - Mọi màn hình/component tải dữ liệu đều phải hiển thị rõ:
     1. **Loading state** (Skeleton / Spinner).
     2. **Error state** (Thông báo lỗi thân thiện + nút Thử lại).
     3. **Empty state** (Khi danh sách rỗng + nút/hướng dẫn tạo mới).
     4. **Success state** (Hiển thị dữ liệu chính xác, responsive trên mobile & desktop).
4. **Accessibility (A11y) & UX**:
   - Sử dụng thẻ HTML ngữ nghĩa (`<main>`, `<section>`, `<nav>`, `<button>`, `<form>`).
   - Mọi ô nhập liệu phải có `<label htmlFor="...">` và thông báo lỗi validation rõ ràng.
5. **Wave 1 Mocking Strategy**:
   - Khi Backend chưa triển khai (Wave 1), tạo mock fixtures tại `src/lib/api/mocks/` bám sát `plan.md` để test UI độc lập, không để xảy ra unhandled fetch exception khi render các trạng thái giao diện.
