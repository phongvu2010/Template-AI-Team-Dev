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
