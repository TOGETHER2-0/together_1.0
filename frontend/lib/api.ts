import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// Inject token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("together-token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Unwrap data + handle 401
api.interceptors.response.use(
  (res) => res.data,  // ← restituisce direttamente res.data
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("together-token");
      localStorage.removeItem("together-user");
      window.location.href = "/auth/login";
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const authApi = {
  register: (data: { email: string; full_name: string; password: string; faculty: string }) =>
    api.post("/api/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/api/auth/login", data),
  me: () => api.get("/api/auth/me"),
    register: (data: { email: string; full_name: string; password: string; faculty: string }) =>
    api.post("/api/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/api/auth/login", data),
  me: () => api.get("/api/auth/me"),
  // ── NUOVO ──
  logout: () => api.post("/api/auth/logout"),
  
};


// Events
export const eventsApi = {
  list: () => api.get("/api/events"),
  get: (id: number) => api.get(`/api/events/${id}`),
  create: (data: any) => api.post("/api/events", data),
  update: (id: number, data: any) => api.patch(`/api/events/${id}`, data),
  delete: (id: number) => api.delete(`/api/events/${id}`),
  requestJoin: (id: number) => api.post(`/api/events/${id}/join`),
  handleRequest: (eventId: number, requestId: number, action: "approve" | "reject") =>
    api.patch(`/api/events/${eventId}/requests/${requestId}?action=${action}`),
  getMessages: (eventId: number, after?: number) => {
    const url = after ? `/api/events/${eventId}/messages?after=${after}` : `/api/events/${eventId}/messages`;
    return api.get(url);
  },
  sendMessage: (eventId: number, data: { text: string }) =>
    api.post(`/api/events/${eventId}/messages`, data),
};

// Users
export const usersApi = {
  myEvents: () => api.get("/api/users/me/events"),
  getProfile: () => api.get("/api/users/profile"),
  updateProfile: (data: { full_name?: string; bio?: string; avatar_url?: string; country_code?: string }) =>
    api.patch("/api/users/profile", data),
};

// Profile (alias per chiarezza)
export const profileApi = {
  update: async (data: {
    full_name?: string;
    bio?: string;
    avatar_url?: string;
    country_code?: string;
  }) => {
    const res = await api.patch('/api/users/profile', data);
    return res;
  },

  uploadAvatar: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const res = await api.post('/api/users/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res; // { avatar_url: "..." }
  },
};