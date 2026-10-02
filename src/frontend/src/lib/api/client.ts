/**
 * Typed HTTP Client for communicating with the FastAPI Backend (`frontend/src/lib/api/client.ts`).
 * Supports seamless toggling between Wave 1 Mock Fixtures and Wave 2 Live Backend.
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
}

/**
 * Typed API request wrapper with built-in mock fallback support.
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: ApiRequestOptions,
): Promise<T> {
  // Wave 1 Mock Interception: If mock mode is enabled and mockData is provided, return it directly
  if (isMockMode() && options?.mockData !== undefined) {
    return options.mockData as T;
  }

  const { mockData: _, ...fetchOptions } = options ?? {};

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
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
      // Fallback to status message if body is not JSON
    }
    throw new ApiError(response.status, detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
