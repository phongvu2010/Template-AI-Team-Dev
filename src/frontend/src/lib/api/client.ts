/**
 * Typed HTTP Client for communicating with the FastAPI Backend (`frontend/src/lib/api/client.ts`).
 * Supports seamless toggling between Wave 1 Mock Fixtures and Wave 2 Live Backend,
 * with Next.js 15 / React 19 Client Cache Invalidation safeguards and automated port/network alignment.
 */

/**
 * Dynamically resolves the API Base URL:
 * - Server-side (SSR / Server Actions): prioritizes INTERNAL_API_URL (e.g. Docker bridge or localhost:8000).
 * - Client-side (Browser): uses NEXT_PUBLIC_API_URL or defaults to http://localhost:8000.
 */
export function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return (
      process.env.INTERNAL_API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      "http://127.0.0.1:8000"
    );
  }
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
}

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
 * Diagnostics & Network alignment interface
 */
export interface HealthStatus {
  ok: boolean;
  status: number;
  url: string;
  data?: unknown;
  error?: string;
}

/**
 * Utility to clear any persisted client-side cache, localStorage, sessionStorage,
 * and browser CacheStorage when switching between Mock and Live API modes.
 */
export async function clearClientApiCache(): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      // 1. Clear session and local storage keys associated with API responses
      const clearStorage = (storage: Storage) => {
        const keysToRemove: string[] = [];
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && (key.startsWith("api_") || key.startsWith("cache_") || key.startsWith("mock_"))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => storage.removeItem(k));
      };

      clearStorage(sessionStorage);
      clearStorage(localStorage);

      // 2. Clear Browser CacheStorage if supported
      if ("caches" in window) {
        const cacheNames = await window.caches.keys();
        await Promise.all(
          cacheNames
            .filter((name) => name.includes("api") || name.includes("fetch"))
            .map((name) => window.caches.delete(name)),
        );
      }
    } catch {
      // Ignore storage errors in restricted iframe/sandbox environments
    }
  }
}

/**
 * Check backend API health and connectivity on configured port.
 */
export async function checkApiHealth(): Promise<HealthStatus> {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/health`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    });
    if (res.ok) {
      const data = await res.json();
      return { ok: true, status: res.status, url: baseUrl, data };
    }
    return { ok: false, status: res.status, url: baseUrl, error: `HTTP ${res.status}` };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      url: baseUrl,
      error: err instanceof Error ? err.message : String(err),
    };
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
    headers["Expires"] = "0";
  }

  // If explicit cache bust requested, append timestamp query parameter
  let targetUrl = `${getApiBaseUrl()}${endpoint}`;
  if (invalidateCache) {
    const separator = targetUrl.includes("?") ? "&" : "?";
    targetUrl = `${targetUrl}${separator}_t=${Date.now()}`;
  }

  const response = await fetch(targetUrl, {
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
