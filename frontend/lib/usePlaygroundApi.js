// frontend/lib/usePlaygroundApi.js
// Use this in every page that needs playground-aware data

import { usePlayground } from "@/context/PlaygroundContext";
import api from "@/lib/api";

export function usePlaygroundApi() {
  const { active } = usePlayground();

  // Adds ?playground=id to params if a playground is active
  const withPg = (params = {}) => {
    if (active) return { ...params, playground: active._id };
    return params;
  };

  return {
    active,
    // Players
    getPlayers:  (params) => api.get("/players",     { params: withPg(params) }),
    getPlayer:   (id)     => api.get(`/players/${id}`),

    // Matches
    getMatches:  (params) => api.get("/matches",     { params: withPg(params) }),
    createMatch: (data)   => api.post("/matches",    { ...data, playground: active?._id || null }),
    deleteMatch: (id)     => api.delete(`/matches/${id}`),
  };
}
