import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const tabs = [
  { path: "/venues", label: "Explore", d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10m-3 0a3 3 0 106 0 3 3 0 10-6 0" },
  { path: "/discover", label: "Discover", d: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" },
  { path: "/matches", label: "Matches", d: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75" },
  { path: "/chats", label: "Chats", d: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" },
  { path: "/profile", label: "You", d: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8" },
];

export default function Navbar() {
  const { user, venue } = useAuth();
  const loc = useLocation();
  if (!user) return null;

  return (
    <>
      <div className="topbar">
        <Link to="/discover" className="topbar-brand">Impulse</Link>
        {venue && (
          <div className="topbar-venue">
            <span className="tv-dot"></span>
            {typeof venue === "object" ? venue.name : "At Venue"}
          </div>
        )}
      </div>
      <nav className="bottomnav">
        {tabs.map(t => (
          <Link key={t.path} to={t.path} className={`bn-tab ${loc.pathname === t.path ? "on" : ""}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {t.d.split(" M").map((seg, i) => <path key={i} d={i === 0 ? seg : "M" + seg} />)}
            </svg>
            <span>{t.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
