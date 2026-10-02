---
name: frontend-nextjs
description: >-
  React 19, Next.js (App Router), TypeScript (Strict), and Tailwind CSS patterns for the Frontend Dev Team (frontend-dev). Activate when building UI pages, components, typed API clients, forms, or state management in src/frontend/.
---

# Frontend Team Runbook: Next.js (App Router) + TypeScript + Tailwind CSS

## 1. Cấu trúc Thư mục Chuẩn (`src/frontend/`)

```text
src/frontend/
├── src/
│   ├── app/                  # Next.js App Router (layout.tsx, page.tsx, loading.tsx, error.tsx)
│   ├── components/           # UI Components tái sử dụng & Feature Components
│   ├── lib/
│   │   └── api/              # Typed Fetch Client kết nối tới FastAPI Backend
│   ├── hooks/                # Custom React Hooks
│   └── types/                # TypeScript Interfaces khớp 100% với Backend Schemas
├── package.json
└── tsconfig.json
```

## 2. Mẫu Typed API Client (`src/frontend/src/lib/api/client.ts`)

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
      // Giữ thông báo mặc định nếu body không phải JSON
    }
    throw new ApiError(response.status, detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
```

## 3. Tiêu chuẩn Giao diện & Accessibility (A11y)
- **Không dùng `any`**: Mọi props, state và API response đều phải có kiểu tường minh trong `src/types/`.
- **Đầy đủ 4 Trạng thái UI**: `Loading` (skeleton/spinner), `Error` (alert + nút Retry), `Empty` (trạng thái trống + hướng dẫn), `Success` (dữ liệu chính).
- **Accessibility**: Mọi `<input>` phải gắn với `<label htmlFor="...">`, nút icon phải có `aria-label`, trạng thái đang gửi form phải có `disabled={isSubmitting}` và `aria-busy={isSubmitting}`.

## 4. Chiến lược Mocking Dữ liệu Độc lập tại Wave 1 (Wave 1 Mocking Strategy)

Do `frontend-dev` được triển khai song song với `db-dev` tại **Wave 1** (khi `backend-dev` chưa dựng xong API thực tế), việc gọi API trực tiếp có thể gây lỗi mạng hoặc chặn quá trình phát triển UI:
- **Biến môi trường kiểm soát Mocking**: Hỗ trợ flag `NEXT_PUBLIC_USE_MOCKS=true` (hoặc tự động fallback sang mock khi chạy dev/test độc lập).
- **Mock Data Fixture (`src/frontend/src/lib/api/mocks/`)**: Tạo các file mock fixture bám sát 100% JSON mẫu trong `docs/specs/<feature-slug>/plan.md`.
- **Mẫu Mock Client Wrapper**:
  ```typescript
  import { MOCK_ITEMS } from "./mocks/items";

  export async function fetchItems(): Promise<Item[]> {
    if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
      // Giả lập độ trễ mạng ngắn để kiểm chứng Loading State
      await new Promise((resolve) => setTimeout(resolve, 400));
      return MOCK_ITEMS;
    }
    return apiRequest<Item[]>("/api/v1/items");
  }
  ```
- **Lợi ích**: Đảm bảo `frontend-dev` có thể hoàn thiện và tự tin kiểm thử trực quan cả 4 trạng thái giao diện (`Loading`, `Error`, `Empty`, `Success`) ngay tại Wave 1 mà hoàn toàn không phụ thuộc vào tiến độ của backend.

