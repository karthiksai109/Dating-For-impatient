import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [venue, setVenue] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationError(null);
      },
      (err) => setLocationError(err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const detectVenue = useCallback(async (lat, lng) => {
    try {
      const res = await api.post("/venues/detect", { lat, lng });
      if (res.data.status && res.data.data.atVenue) {
        setVenue(res.data.data.venue);
        setUser(prev => prev ? { ...prev, activeVenueId: res.data.data.venue._id } : prev);
        return res.data.data;
      }
      return res.data.data;
    } catch (err) {
      return null;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("user_token");
    const stored = localStorage.getItem("user_data");
    if (token && stored) {
      try { setUser(JSON.parse(stored)); } catch (e) { localStorage.removeItem("user_data"); }
      api.get("/me").then(res => {
        if (res.data.status) {
          setUser(res.data.data);
          localStorage.setItem("user_data", JSON.stringify(res.data.data));
          if (res.data.data.activeVenueId) setVenue(res.data.data.activeVenueId);
        }
      }).catch(() => {}).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    if (!user || !location) return;
    const interval = setInterval(() => {
      if (venue) api.post("/venues/heartbeat").catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, [user, location, venue]);

  const login = (token, userData) => {
    localStorage.setItem("user_token", token);
    localStorage.setItem("user_data", JSON.stringify(userData));
    setUser(userData);
    if (userData.activeVenueId) setVenue(userData.activeVenueId);
    requestLocation();
  };

  const logout = () => {
    api.post("/venues/checkout").catch(() => {});
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_data");
    setUser(null);
    setVenue(null);
    setLocation(null);
  };

  const updateVenue = (v) => setVenue(v);
  const updateUser = (u) => {
    setUser(u);
    localStorage.setItem("user_data", JSON.stringify(u));
  };

  return (
    <AuthContext.Provider value={{
      user, loading, venue, location, locationError,
      login, logout, updateVenue, updateUser, detectVenue, requestLocation
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
