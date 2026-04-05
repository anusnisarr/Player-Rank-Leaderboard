import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: "/backend",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Attach token from cookie to every request

// api.interceptors.request.use((config) => {
//   if (typeof document !== "undefined") {
//     const token = document.cookie
//       .split("; ")
//       .find(r => r.startsWith("accessToken="))
//       ?.split("=")[1];

//     if (token) config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// Players
export const getPlayers = (params = {}) => api.get("/players", { params });
export const getTeams = () => api.get("/players/teams");
export const getPlayer = (id) => api.get(`/players/${id}`);
export const createPlayer = (data) => api.post("/players", data);
export const updatePlayer = (id, data) => api.put(`/players/${id}`, data);
export const deletePlayer = (id) => api.delete(`/players/${id}`);

// Matches
export const getMatches = (params = {}) => api.get("/matches", { params });
export const getMatch = (id) => api.get(`/matches/${id}`);
export const createMatch = (data) => api.post("/matches", data);
export const deleteMatch = (id) => api.delete(`/matches/${id}`);

// utils
export const getHealth = () => api.get("/health");

export default api;
