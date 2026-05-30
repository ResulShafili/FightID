const API_URL = (import.meta.env.VITE_API_URL || "https://fightid-production.up.railway.app/api").replace(/\/$/, "");

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const apiRequest = async (path, options = {}, retry = true) => {
  const hasBody = options.body !== undefined;
  const isFormData = options.isFormData === true;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(hasBody && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401 && retry) {
    try {
      const data = await apiRequest("/auth/refresh", { method: "POST" }, false);
      if (data?.user) localStorage.setItem("fightidUser", JSON.stringify(data.user));
      return apiRequest(path, options, false);
    } catch {
      setAccessToken(null);
      localStorage.removeItem("fightidAccessToken");
      localStorage.removeItem("fightidRefreshToken");
      localStorage.removeItem("fightidUser");
      window.dispatchEvent(new Event("auth:logout"));
    }
  }

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
  verifyEmailCode: (payload) => apiRequest("/auth/verify-email-code", { method: "POST", body: JSON.stringify(payload) }),
  me: () => apiRequest("/auth/me"),
  refresh: () => apiRequest("/auth/refresh", { method: "POST" }),
  logout: () => apiRequest("/auth/logout", { method: "POST" }),
};

export const fighterApi = {
  list: (params = {}) => apiRequest(`/fighters${toQueryString(params)}`),
  get: (id) => apiRequest(`/fighters/${id}`),
  leaderboard: (params = {}) => apiRequest(`/fighters/leaderboard${toQueryString(params)}`),
  rivals: (id) => apiRequest(`/fighters/${id}/rivals`),
  updateMe: (payload) => apiRequest("/fighters/me", { method: "PUT", body: JSON.stringify(payload) }),
  uploadPhoto: (file) => {
    const fd = new FormData();
    fd.append("photo", file);
    return apiRequest("/fighters/me/photo", { method: "POST", body: fd, isFormData: true });
  },
};

export const challengeApi = {
  mine: () => apiRequest("/challenges/mine"),
  send: (payload) => apiRequest("/challenges", { method: "POST", body: JSON.stringify(payload) }),
  accept: (id) => apiRequest(`/challenges/${id}/accept`, { method: "PUT" }),
  decline: (id) => apiRequest(`/challenges/${id}/decline`, { method: "PUT" }),
};

export const notificationApi = {
  list: () => apiRequest("/notifications"),
  markRead: (id) => apiRequest(`/notifications/${id}/read`, { method: "PUT" }),
  markAllRead: () => apiRequest("/notifications/read-all", { method: "PUT" }),
};

export const cardApi = {
  getForFighter: (fighterId) => apiRequest(`/cards/fighter/${fighterId}`),
  collect: (cardId) => apiRequest(`/cards/${cardId}/collect`, { method: "POST" }),
  uncollect: (cardId) => apiRequest(`/cards/${cardId}/collect`, { method: "DELETE" }),
  myCollection: () => apiRequest("/cards/my-collection"),
};

export const cornerManApi = {
  add: (fighterId) => apiRequest(`/cornermen/${fighterId}`, { method: "POST" }),
  remove: (fighterId) => apiRequest(`/cornermen/${fighterId}`, { method: "DELETE" }),
  count: (fighterId) => apiRequest(`/cornermen/${fighterId}/count`),
  myFighters: () => apiRequest("/cornermen/my-fighters"),
};

export const seekApi = {
  list: (params = {}) => apiRequest(`/fightseek${toQueryString(params)}`),
  post: (payload) => apiRequest("/fightseek", { method: "POST", body: JSON.stringify(payload) }),
  remove: (id) => apiRequest(`/fightseek/${id}`, { method: "DELETE" }),
};

export const trainingApi = {
  log: (payload) => apiRequest("/training", { method: "POST", body: JSON.stringify(payload) }),
  forFighter: (fighterId) => apiRequest(`/training/fighter/${fighterId}`),
  delete: (id) => apiRequest(`/training/${id}`, { method: "DELETE" }),
};

export const tournamentApi = {
  list: (params = {}) => apiRequest(`/tournaments${toQueryString(params)}`),
  get: (id) => apiRequest(`/tournaments/${id}`),
  create: (payload) => apiRequest("/tournaments", { method: "POST", body: JSON.stringify(payload) }),
  setWinner: (id, matchId, winnerId) => apiRequest(`/tournaments/${id}/matches/${matchId}/winner`, { method: "PUT", body: JSON.stringify({ winnerId }) }),
};

export const badgeApi = {
  forFighter: (fighterId) => apiRequest(`/badges/fighter/${fighterId}`),
};

export const gymApi = {
  list: (params = {}) => apiRequest(`/gyms${toQueryString(params)}`),
  get: (id) => apiRequest(`/gyms/${id}`),
  leaderboard: () => apiRequest("/gyms/leaderboard"),
  create: (payload) => apiRequest("/gyms", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) => apiRequest(`/gyms/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  uploadLogo: (id, file) => {
    const fd = new FormData();
    fd.append("logo", file);
    return apiRequest(`/gyms/${id}/logo`, { method: "POST", body: fd, isFormData: true });
  },
  join: (id) => apiRequest(`/gyms/${id}/join`, { method: "POST" }),
  leave: (id) => apiRequest(`/gyms/${id}/join`, { method: "DELETE" }),
};

export const micCheckApi = {
  post: (payload) => apiRequest("/micchecks", { method: "POST", body: JSON.stringify(payload) }),
  feed: () => apiRequest("/micchecks/feed"),
  forChallenge: (challengeId) => apiRequest(`/micchecks/challenge/${challengeId}`),
  react: (id, emoji) => apiRequest(`/micchecks/${id}/react`, { method: "POST", body: JSON.stringify({ emoji }) }),
  unreact: (id) => apiRequest(`/micchecks/${id}/react`, { method: "DELETE" }),
};

export const leaderboardApi = {
  national: () => apiRequest("/leaderboard/national"),
  nationalByCountry: (country) => apiRequest(`/leaderboard/national/${country}`),
  isChampion: (fighterId) => apiRequest(`/fighters/${fighterId}/isNationalChampion`),
};

export const adminApi = {
  stats: () => apiRequest("/admin/stats"),
  fighters: (params = {}) => apiRequest(`/admin/fighters${toQueryString(params)}`),
  updateRole: (fighterId, role) => apiRequest(`/admin/fighters/${fighterId}/role`, { method: "PUT", body: JSON.stringify({ role }) }),
};

export const verificationApi = {
  pending: () => apiRequest("/verification/pending"),
  approve: (id, adminNote = "") => apiRequest(`/verification/${id}/approve`, { method: "PUT", body: JSON.stringify({ adminNote }) }),
  reject: (id, adminNote) => apiRequest(`/verification/${id}/reject`, { method: "PUT", body: JSON.stringify({ adminNote }) }),
};

function toQueryString(params = {}) {
  const filtered = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "");
  const query = new URLSearchParams(filtered).toString();
  return query ? `?${query}` : "";
}
