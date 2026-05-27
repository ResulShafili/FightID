const API_URL = (import.meta.env.VITE_API_URL || "https://fightid-production.up.railway.app/api").replace(/\/$/, "");

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const apiRequest = async (path, options = {}) => {
  const hasBody = options.body !== undefined;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  if (response.status === 204) return null;
  return response.json();
};

export const authApi = {
  register: (payload) => apiRequest("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => apiRequest("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  refresh: (refreshToken) => apiRequest("/auth/refresh", { method: "POST", body: JSON.stringify({ refreshToken }) }),
  logout: (refreshToken) => apiRequest("/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken }) }),
};

export const fighterApi = {
  list: (params = {}) => apiRequest(`/fighters${toQueryString(params)}`),
  get: (id) => apiRequest(`/fighters/${id}`),
  leaderboard: (params = {}) => apiRequest(`/fighters/leaderboard${toQueryString(params)}`),
  updateMe: (payload) => apiRequest("/fighters/me", { method: "PUT", body: JSON.stringify(payload) }),
};

export const challengeApi = {
  mine: () => apiRequest("/challenges/mine"),
  send: (payload) => apiRequest("/challenges", { method: "POST", body: JSON.stringify(payload) }),
  accept: (id) => apiRequest(`/challenges/${id}/accept`, { method: "PUT" }),
  decline: (id) => apiRequest(`/challenges/${id}/decline`, { method: "PUT" }),
};

function toQueryString(params = {}) {
  const filtered = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "");
  const query = new URLSearchParams(filtered).toString();
  return query ? `?${query}` : "";
}
