import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, venue, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const navItems = [
    { path: "/venues", label: "Venues", icon: "📍" },
    { path: "/discover", label: "Discover", icon: "🔥" },
    { path: "/matches", label: "Matches", icon: "💕" },
    { path: "/chats", label: "Chats", icon: "💬" },
    { path: "/profile", label: "Profile", icon: "👤" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Top bar */}
      <div className="navbar-top">
        <div className="navbar-brand" onClick={() => navigate("/discover")}>
          <span className="brand-icon">💘</span>
          <span className="brand-text">VenueMatch</span>
        </div>
        {venue && (
          <div className="venue-badge">
            <span className="venue-dot"></span>
            <span>{typeof venue === "object" ? venue.name : "At Venue"}</span>
          </div>
        )}
        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mobile-menu">
          {navItems.map(item => (
            <Link key={item.path} to={item.path} className="mobile-menu-item" onClick={() => setMenuOpen(false)}>
              {item.icon} {item.label}
            </Link>
          ))}
          <button className="mobile-menu-item logout-btn" onClick={() => { logout(); navigate("/login"); }}>
            🚪 Logout
          </button>
        </div>
      )}

      {/* Bottom navigation */}
      <div className="navbar-bottom">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive(item.path) ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
