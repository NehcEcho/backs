import { APP_CONFIG } from "@/app/lib/config";
import type { GatewayResponse, RequestResult } from "@/app/types";

export function getStoredToken() {
  return localStorage.getItem(APP_CONFIG.localStorageTokenKey) || "";
}

export function setStoredToken(token: string) {
  localStorage.setItem(APP_CONFIG.localStorageTokenKey, token);
}

export function clearStoredToken() {
  localStorage.removeItem(APP_CONFIG.localStorageTokenKey);
}

export function getStoredUsername() {
  return localStorage.getItem(APP_CONFIG.localStorageUsernameKey) || "管理员";
}

export function setStoredUsername(username: string) {
  localStorage.setItem(APP_CONFIG.localStorageUsernameKey, username);
}

export function clearStoredUsername() {
  localStorage.removeItem(APP_CONFIG.localStorageUsernameKey);
}

async function request<T>(path: string, init?: RequestInit, raw = false): Promise<RequestResult<T>> {
  try {
    const headers = new Headers(init?.headers || {});
    const token = getStoredToken();
    if (token) {
      headers.set("X-Access-Token", token);
    }
    if (!raw && !headers.has("Content-Type") && init?.body) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${APP_CONFIG.apiBaseUrl}${path}`, {
      ...init,
      headers,
    });

    const text = await response.text();
    const data = text ? (JSON.parse(text) as GatewayResponse<T>) : null;
    return {
      ok: response.ok && !!data?.success,
      status: response.status,
      data,
      error: response.ok ? null : data?.message || `请求失败 (${response.status})`,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: error instanceof Error ? error.message : "未知错误",
    };
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export function buildDownloadUrl(path: string) {
  const token = getStoredToken();
  const url = new URL(`${APP_CONFIG.apiBaseUrl}${path}`);
  if (token) {
    url.searchParams.set("_token", token);
  }
  return url.toString();
}
