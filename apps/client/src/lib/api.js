const API_BASE = import.meta.env.PROD ? "/api" : "http://localhost:4000/api";
function buildQuery(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value)
            params.set(key, value);
    });
    return params.toString() ? `?${params.toString()}` : "";
}
export async function request(path, init) {
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
    return response.json();
}
export const api = {
    login(payload) {
        return request("/auth/login", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },
    me() {
        return request("/auth/me");
    },
    options() {
        return request("/options");
    },
    sales(filters) {
        return request(`/sales${buildQuery(filters)}`);
    },
    sale(id) {
        return request(`/sales/${id}`);
    },
    createSale(payload) {
        return request("/sales", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },
    updateSale(id, payload) {
        return request(`/sales/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
    },
    analytics(filters) {
        return request(`/analytics/overview${buildQuery(filters)}`);
    },
    map(filters) {
        return request(`/map/installations${buildQuery(filters)}`);
    },
    insights(filters) {
        return request("/ai/insights", {
            method: "POST",
            body: JSON.stringify(filters),
        });
    },
    chat(payload) {
        return request("/ai/chat", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },
};
