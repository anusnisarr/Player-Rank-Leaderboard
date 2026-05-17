"use client";
import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.data);
      const savedId = localStorage.getItem("activeUser");
      if (savedId) {
        const found = pgs.find(p => p._id === savedId);
        if (found) { setUser(found); setLoading(false); return; }
      }
    } catch {
      // Not logged in or failed — silently ignore
    } finally {
      setLoading(false);
    }
  };


  return (
    <UserContext.Provider value={{ user, setUser, fetchUsers }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
