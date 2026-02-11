import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        <div style={{ color: "white", fontSize: "1.5rem", fontWeight: "bold" }}>Loading...</div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
