import type { AnalyticsResponse, Filters, SaleRecord } from "../types";

const API_BASE = import.meta.env.PROD ? "/api" : "http://localhost:4000/api";

type LoginResponse = {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
};

function buildQuery(filters: Filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params.toString() ? `?${params.toString()}` : "";
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem("jbb_token");
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "Request failed");
  }

  return response.json() as Promise<T>;
}

export const api = {
  login(payload: { email: string; password: string }) {
    return request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  me() {
    return request<{ user: LoginResponse["user"] }>("/auth/me");
  },
  options() {
    return request<{
      sellers: string[];
      cities: string[];
      tableTypes: string[];
      tableNames: string[];
    }>("/options");
  },
  sales(filters: Filters) {
    return request<SaleRecord[]>(`/sales${buildQuery(filters)}`);
  },
  sale(id: string) {
    return request<SaleRecord>(`/sales/${id}`);
  },
  createSale(payload: Omit<SaleRecord, "id" | "createdAt" | "updatedAt">) {
    return request<SaleRecord>("/sales", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateSale(id: string, payload: Omit<SaleRecord, "id" | "createdAt" | "updatedAt">) {
    return request<SaleRecord>(`/sales/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  analytics(filters: Filters) {
    return request<AnalyticsResponse>(`/analytics/overview${buildQuery(filters)}`);
  },
  map(filters: Filters) {
    return request<SaleRecord[]>(`/map/installations${buildQuery(filters)}`);
  },
  insights(filters: Filters) {
    return request<{
      generatedAt: string;
      fallback: boolean;
      insights: string[];
      predictions: string[];
      suggestions: string[];
    }>("/ai/insights", {
      method: "POST",
      body: JSON.stringify(filters),
    });
  },
  chat(payload: { question: string; filters: Filters }) {
    return request<{ answer: string }>("/ai/chat", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
