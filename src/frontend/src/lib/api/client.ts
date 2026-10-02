/**
 * Typed HTTP Client for communicating with the FastAPI Backend (`frontend/src/lib/api/client.ts`).
 * Supports seamless toggling between Wave 1 Mock Fixtures and Wave 2 Live Backend,
 * with Next.js 15 / React 19 Client Cache Invalidation safeguards.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Returns true if mock mode is explicitly enabled via NEXT_PUBLIC_USE_MOCKS=true.
 * Defaults to false (Live Backend API mode).
 */
export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCKS === "true";
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

export interface ApiRequestOptions extends RequestInit {
  mockData?: unknown;
  /** Force cache busting / bypass Next.js 15 fetch and client router cache */
  invalidateCache?: boolean;
}

/**
 * Utility to clear any persisted client-side cache or storage when switching modes
 */
export function clearClientApiCache(): void {
  if (typeof window !== "undefined") {
    try {
      // Clear session/local storage keys associated with API responses
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith("api_") || key.startsWith("cache_"))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k));
    } catch {
      // Ignore storage errors in restricted iframe/browser environments
    }
  }
}

/**
 * Typed API request wrapper with built-in mock fallback support and Next.js 15 cache invalidation.
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: ApiRequestOptions,
): Promise<T> {
  // Wave 1 Mock Interception: If mock mode is enabled and mockData is provided, return it directly
  if (isMockMode() && options?.mockData !== undefined) {
    return options.mockData as T;
  }

  const { mockData: _, invalidateCache, ...fetchOptions } = options ?? {};

  // Next.js 15 Cache Invalidation: Default to 'no-store' in live mode to avoid stale mock or stale data
  const cacheStrategy: RequestCache =
    fetchOptions.cache ?? (invalidateCache || !isMockMode() ? "no-store" : "default");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((fetchOptions.headers as Record<string, string>) ?? {}),
  };

  if (invalidateCache || !isMockMode()) {
    headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
    headers["Pragma"] = "no-cache";
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    cache: cacheStrategy,
    headers,
  });

  if (!response.ok) {
    let detail = `HTTP Error ${response.status}`;
    try {
      const errBody = (await response.json()) as { detail?: string };
      if (typeof errBody.detail === "string") {
        detail = errBody.detail;
      }
    } catch {
      // Fallback to status message if body is not JSON
    }
    throw new ApiError(response.status, detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
