import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function Venues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(null);
  const [error, setError] = useState("");
  const { user, venue, updateVenue, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const res = await api.get("/venues/nearby");
      if (res.data.status) setVenues(res.data.data);
    } catch (err) {
      setError("Failed to load venues");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (venueId) => {
    setChecking(venueId);
    setError("");
    try {
      const res = await api.post("/venues/checkin", { venueId });
      if (res.data.status) {
        updateVenue(res.data.data.venue);
        updateUser({ ...user, activeVenueId: venueId });
        navigate("/discover");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Check-in failed");
    } finally {
      setChecking(null);
    }
  };

  const handleCheckOut = async () => {
    setError("");
    try {
      const res = await api.post("/venues/checkout");
      if (res.data.status) {
        updateVenue(null);
        updateUser({ ...user, activeVenueId: null });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Check-out failed");
    }
  };

  const venueTypeEmoji = (type) => {
    const map = {
      restaurant: "🍽️", cafe: "☕", bar: "🍸", club: "🎵",
      gym: "💪", park: "🌳", library: "📚", mall: "🛍️",
      coworking: "💻", event: "🎉", other: "📍"
    };
    return map[type] || "📍";
  };

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="page venues-page">
      <div className="page-header">
        <h1>📍 Nearby Venues</h1>
        <p>Check in to start discovering people</p>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {venue && (
        <div className="current-venue-card">
          <div className="current-venue-info">
            <span className="venue-emoji">{venueTypeEmoji(typeof venue === "object" ? venue.type : "other")}</span>
            <div>
              <h3>Currently at: {typeof venue === "object" ? venue.name : "A Venue"}</h3>
              <p>You can discover people here</p>
            </div>
          </div>
          <div className="current-venue-actions">
            <button className="btn-accent" onClick={() => navigate("/discover")}>Start Swiping</button>
            <button className="btn-danger-outline" onClick={handleCheckOut}>Check Out</button>
          </div>
        </div>
      )}

      <div className="venues-grid">
        {venues.length === 0 && !loading && (
          <div className="empty-state">
            <span className="empty-icon">🏠</span>
            <h3>No venues available</h3>
            <p>Check back later or ask the admin to add venues</p>
          </div>
        )}
        {venues.map(v => (
          <div key={v._id} className="venue-card">
            <div className="venue-card-header">
              <span className="venue-type-emoji">{venueTypeEmoji(v.type)}</span>
              <div className="venue-card-info">
                <h3>{v.name}</h3>
                <p className="venue-type-label">{v.type}</p>
              </div>
              <div className="venue-people-badge">
                <span>👥</span>
                <span>{v.currentOccupancy || 0}</span>
              </div>
            </div>
            {v.description && <p className="venue-desc">{v.description}</p>}
            <div className="venue-meta">
              {v.city && <span>📍 {v.city}{v.state ? `, ${v.state}` : ""}</span>}
              {v.addressLine1 && <span>🏢 {v.addressLine1}</span>}
              {v.operatingHours && <span>🕐 {v.operatingHours.open} - {v.operatingHours.close}</span>}
            </div>
            {v.tags && v.tags.length > 0 && (
              <div className="venue-tags">
                {v.tags.map((t, i) => <span key={i} className="tag">{t}</span>)}
              </div>
            )}
            <button
              className={`btn-checkin ${user?.activeVenueId === v._id ? "checked-in" : ""}`}
              onClick={() => handleCheckIn(v._id)}
              disabled={checking === v._id || user?.activeVenueId === v._id}
            >
              {user?.activeVenueId === v._id ? "✓ Checked In" : checking === v._id ? "Checking in..." : "Check In Here"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
