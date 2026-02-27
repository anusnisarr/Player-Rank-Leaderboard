import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Players
export const getPlayers = (params = {}) => api.get("/players", { params });
export const getPlayer = (id) => api.get(`/players/${id}`);
export const createPlayer = (data) => api.post("/players", data);
export const updatePlayer = (id, data) => api.put(`/players/${id}`, data);
export const deletePlayer = (id) => api.delete(`/players/${id}`);

// Matches
export const getMatches = (params = {}) => api.get("/matches", { params });
export const getMatch = (id) => api.get(`/matches/${id}`);
export const createMatch = (data) => api.post("/matches", data);
export const deleteMatch = (id) => api.delete(`/matches/${id}`);

export default api;
