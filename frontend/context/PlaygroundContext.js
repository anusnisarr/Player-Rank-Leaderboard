"use client";
import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

const PlaygroundContext = createContext(null);

export function PlaygroundProvider({ children }) {
  const [user, setUser] = useState(null);
  const [playgrounds, setPlaygrounds]   = useState([]);
  const [active, setActive]             = useState(null); // currently selected playground
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    fetchPlaygrounds();
  }, []);

  useEffect(() => {
  api.get("/auth/me").then(r => setUser(r.data.data)).catch(() => setUser(null));
}, []);

  const fetchPlaygrounds = async () => {
    try {
      const res = await api.get("/playgrounds/mine");
      const pgs = res.data.data || [];
      setPlaygrounds(pgs);

      // Restore last selected from localStorage
      const savedId = localStorage.getItem("activePlayground");
      if (savedId) {
        const found = pgs.find(p => p._id === savedId);
        if (found) { setActive(found); setLoading(false); return; }
      }

      // Default: null = global (all playgrounds)
      setActive(null);
    } catch {
      // Not logged in or failed — silently ignore
    } finally {
      setLoading(false);
    }
  };

  const switchPlayground = (pg) => {
    setActive(pg);
    if (pg) localStorage.setItem("activePlayground", pg._id);
    else     localStorage.removeItem("activePlayground");
  };

  return (
    <PlaygroundContext.Provider value={{ playgrounds, active, loading, switchPlayground, fetchPlaygrounds }}>
      {children}
    </PlaygroundContext.Provider>
  );
}

export function usePlayground() {
  return useContext(PlaygroundContext);
}
