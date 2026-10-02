---
name: frontend-nextjs
description: >-
  React 19, Next.js (App Router), TypeScript (Strict), and Tailwind CSS patterns for the Frontend Dev Team (frontend-dev). Activate when building UI pages, components, typed API clients, forms, or state management in src/frontend/.
---

# Frontend Team Runbook: Next.js (App Router) + TypeScript + Tailwind CSS

Runbook này hướng dẫn `frontend-dev` xây dựng giao diện người dùng hiện đại, tuân thủ **Cross-Layer Data Contract Matrix**, rào chắn an toàn dòng lệnh (**CLI Guardrails**) và tham gia vòng lặp tự sửa lỗi (**Feedback Loop**).

---

## 1. Rào Chắn An Toàn Dòng Lệnh (CLI Guardrails)
- **Quyền sở hữu**: Chỉ tạo/sửa file trong `src/frontend/`.
- **Lệnh được phép**:
  - `npm --prefix src/frontend run typecheck`
  - `npm --prefix src/frontend run lint`
  - `npm --prefix src/frontend run build`
- **Lệnh cấm**: Cấm chạy `npm install` trần trong sandbox; cấm sửa file ngoài `src/frontend/`.

---

## 2. Cấu Trúc Thư Mục Chuẩn (`src/frontend/`)

```text
src/frontend/
├── src/
│   ├── app/                  # Next.js App Router (layout.tsx, page.tsx, loading.tsx, error.tsx)
│   ├── components/           # UI Components tái sử dụng & Feature Components
│   ├── lib/
│   │   └── api/              # Typed Fetch Client kết nối tới FastAPI Backend
│   │       └── mocks/        # Mock fixtures phục vụ Wave 1
│   ├── hooks/                # Custom React Hooks
│   └── types/                # TypeScript Interfaces khớp 100% với Backend Schemas
├── package.json
└── tsconfig.json
```

---

## 3. Quy Chuẩn Đồng Bộ Hợp Đồng (Contract Synchronization)

1. **Thống nhất Casing `snake_case`**:
   - Khai báo interface properties trong `src/frontend/src/types/` theo đúng chuẩn `snake_case` của REST API JSON.
   - Không tự ý đổi tên trường sang `camelCase` khi nhận từ API để tránh lỗi `undefined` tại runtime.
2. **Strict TypeScript — Tuyệt đối không dùng `any`**:
   ```typescript
   export interface Item {
     id: string; // RFC 4122 UUID
     title: string;
     description: string | null;
     tags: string[];
     created_at: string; // ISO 8601 UTC
     updated_at: string;
   }
   ```
3. **Mẫu Typed API Client Wrapper**:
   ```typescript
   const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

   export class ApiError extends Error {
     constructor(
       public status: number,
       public detail: string,
     ) {
       super(detail);
       this.name = "ApiError";
     }
   }

   export async function apiRequest<T>(
     endpoint: string,
     options?: RequestInit,
   ): Promise<T> {
     const response = await fetch(`${API_BASE_URL}${endpoint}`, {
       ...options,
       headers: {
         "Content-Type": "application/json",
         ...options?.headers,
       },
     });

     if (!response.ok) {
       let detail = `HTTP Error ${response.status}`;
       try {
         const errBody = (await response.json()) as { detail?: string };
         if (typeof errBody.detail === "string") {
           detail = errBody.detail;
         }
       } catch {
         // Giữ message mặc định nếu không phải JSON
       }
       throw new ApiError(response.status, detail);
     }

     if (response.status === 204) {
       return undefined as T;
     }

     return (await response.json()) as T;
   }
   ```

---

## 4. Wave 1 Mocking & 4 Trạng Thái Giao Diện
- **Mocking Wave 1**: Tạo mock fixtures tại `src/frontend/src/lib/api/mocks/` bám sát `plan.md`. Hỗ trợ flag `NEXT_PUBLIC_USE_MOCKS=true` để dev và test giao diện độc lập.
- **Bắt buộc 4 Trạng Thái UI**:
  1. `Loading`: Skeleton loader layout tương ứng.
  2. `Error`: Alert hiển thị thông báo lỗi + nút Retry.
  3. `Empty`: Trạng thái rỗng + CTA button tạo mới.
  4. `Success`: Render dữ liệu responsive kèm tiêu chuẩn A11y.

---

## 5. Tham Gia Vòng Lặp Sửa Lỗi (Feedback Loop)
Khi nhận tin nhắn `[SELF-HEALING ACTION REQUIRED]` từ QA hoặc `[REVIEW-FIX ACTION REQUIRED]` từ Reviewer:
1. Xác định nguyên nhân (lỗi typecheck, thiếu trạng thái UI, lỗi mock data).
2. Sửa lỗi trong `src/frontend/`, chạy `npm --prefix src/frontend run typecheck`.
3. Phản hồi cho Tech Lead bằng thông điệp `[FIX-COMPLETED]`.
