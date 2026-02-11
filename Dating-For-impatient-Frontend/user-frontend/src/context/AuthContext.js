import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [venue, setVenue] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("user_token");
    const stored = localStorage.getItem("user_data");
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem("user_data");
      }
      // Fetch fresh profile
      api.get("/me").then(res => {
        if (res.data.status) {
          setUser(res.data.data);
          localStorage.setItem("user_data", JSON.stringify(res.data.data));
          if (res.data.data.activeVenueId) {
            setVenue(res.data.data.activeVenueId);
          }
        }
      }).catch(() => {}).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("user_token", token);
    localStorage.setItem("user_data", JSON.stringify(userData));
    setUser(userData);
    if (userData.activeVenueId) setVenue(userData.activeVenueId);
  };

  const logout = () => {
    // Check out from venue first
    api.post("/venues/checkout").catch(() => {});
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_data");
    setUser(null);
    setVenue(null);
  };

  const updateVenue = (v) => setVenue(v);
  const updateUser = (u) => {
    setUser(u);
    localStorage.setItem("user_data", JSON.stringify(u));
  };

  return (
    <AuthContext.Provider value={{ user, loading, venue, login, logout, updateVenue, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
