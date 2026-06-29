import axios from "axios";

/*
  FIX — baseURL vuoto.

  Prima puntava direttamente all'URL ngrok del backend
  (https://pardon-raffle-grip.ngrok-free.dev). Questo richiedeva
  2 tunnel ngrok attivi simultaneamente (frontend + backend),
  cosa che il piano free non permette (ERR_NGROK_334).

  Ora il frontend chiama path RELATIVI (es. /api/auth/login).
  Il browser li indirizza allo stesso dominio su cui sta navigando
  (il dominio ngrok del frontend, porta 3000). next.config.js
  intercetta quei path con un rewrite e li proxa internamente verso
  http://localhost:8000, dove gira FastAPI.

  Risultato: un solo tunnel ngrok necessario (quello del frontend).
*/
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
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
  (res) => res.data,
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
interface AuthResponse {
  access_token: string;
  user: any;
}

export const authApi = {
  register: (data: { email: string; full_name: string; password: string; faculty: string }) =>
    api.post<AuthResponse>("/api/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>("/api/auth/login", data),
  me: () => api.get("/api/auth/me"),
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
  updateProfile: (data: { full_name?: string; bio?: string; avatar_url?: string; country_code?: string; language?: string }) =>
    api.patch("/api/users/profile", data),
};

// Profile (alias per chiarezza)
export const profileApi = {
  update: async (data: {
    full_name?: string;
    bio?: string;
    avatar_url?: string;
    country_code?: string;
    language?: string;
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
    return res;
  },
};
