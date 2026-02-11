import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function Venues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [checking, setChecking] = useState(null);
  const [error, setError] = useState("");
  const { user, venue, location, locationError, updateVenue, updateUser, detectVenue, requestLocation } = useAuth();
  const navigate = useNavigate();

  const fetchVenues = useCallback(async () => {
    try {
      const q = location ? `?lat=${location.lat}&lng=${location.lng}` : "";
      const res = await api.get("/venues/nearby" + q);
      if (res.data.status) setVenues(res.data.data);
    } catch (err) {
      setError("Could not load venues");
    } finally { setLoading(false); }
  }, [location]);

  useEffect(() => { fetchVenues(); }, [fetchVenues]);

  useEffect(() => {
    if (location && !venue && user) handleAutoDetect();
    // eslint-disable-next-line
  }, [location]);

  const handleAutoDetect = async () => {
    if (!location) return;
    setDetecting(true);
    const result = await detectVenue(location.lat, location.lng);
    if (result && result.atVenue) {
      navigate("/discover");
    } else if (result && result.venues) {
      setVenues(result.venues);
    }
    setDetecting(false);
  };

  const handleCheckIn = async (venueId) => {
    setChecking(venueId); setError("");
    try {
      const res = await api.post("/venues/checkin", { venueId });
      if (res.data.status) {
        updateVenue(res.data.data.venue);
        updateUser({ ...user, activeVenueId: venueId });
        navigate("/discover");
      }
    } catch (err) { setError(err.response?.data?.message || "Check-in failed"); }
    finally { setChecking(null); }
  };

  const handleCheckOut = async () => {
    setError("");
    try {
      const res = await api.post("/venues/checkout");
      if (res.data.status) { updateVenue(null); updateUser({ ...user, activeVenueId: null }); }
    } catch (err) { setError(err.response?.data?.message || "Check-out failed"); }
  };

  const typeIcon = (t) => ({ restaurant:"utensils", cafe:"coffee", bar:"wine", club:"music", gym:"dumbbell", park:"trees", library:"book-open", mall:"shopping-bag", coworking:"laptop", event:"calendar" }[t] || "map-pin");

  if (loading) return <div className="page-loader"><div className="loader-ring"></div></div>;

  return (
    <div className="page">
      <header className="page-top">
        <div>
          <h1 className="page-title">Explore</h1>
          <p className="page-sub">
            {location ? `Location found` : locationError ? "Location unavailable" : "Getting your location..."}
          </p>
        </div>
        {!venue && location && (
          <button className="btn-sm" onClick={handleAutoDetect} disabled={detecting}>
            {detecting ? "Scanning..." : "Detect Venue"}
          </button>
        )}
        {!location && (
          <button className="btn-sm" onClick={requestLocation}>Enable Location</button>
        )}
      </header>

      {error && <div className="toast-error">{error}</div>}

      {detecting && (
        <div className="detect-banner">
          <div className="loader-ring small"></div>
          <span>Scanning your location for nearby venues...</span>
        </div>
      )}

      {venue && (
        <div className="active-venue-banner">
          <div className="avb-left">
            <div className="avb-icon">{typeIcon(typeof venue === "object" ? venue.type : "other")}</div>
            <div>
              <h3>{typeof venue === "object" ? venue.name : "Your Venue"}</h3>
              <p>You're checked in - start meeting people</p>
            </div>
          </div>
          <div className="avb-actions">
            <button className="btn-main btn-sm" onClick={() => navigate("/discover")}>Discover</button>
            <button className="btn-outline-danger btn-sm" onClick={handleCheckOut}>Leave</button>
          </div>
        </div>
      )}

      <div className="venue-list">
        {venues.length === 0 && (
          <div className="empty-box">
            <div className="empty-icon-wrap">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <h3>No venues yet</h3>
            <p>Venues will appear here once the admin adds them</p>
          </div>
        )}
        {venues.map(v => (
          <div key={v._id} className={`venue-item ${user?.activeVenueId === v._id ? "active" : ""}`}>
            <div className="vi-top">
              <div className="vi-info">
                <h3>{v.name}</h3>
                <span className="vi-type">{v.type}</span>
                {v.distance !== undefined && v.distance < 999999 && (
                  <span className="vi-dist">{v.distance < 1000 ? `${v.distance}m` : `${(v.distance/1000).toFixed(1)}km`} away</span>
                )}
              </div>
              <div className="vi-people">
                <span className="people-count">{v.currentOccupancy || 0}</span>
                <span className="people-label">here</span>
              </div>
            </div>
            {v.description && <p className="vi-desc">{v.description}</p>}
            <div className="vi-meta">
              {v.city && <span>{v.city}{v.state ? `, ${v.state}` : ""}</span>}
              {v.operatingHours && <span>{v.operatingHours.open} - {v.operatingHours.close}</span>}
            </div>
            {v.tags && v.tags.length > 0 && (
              <div className="vi-tags">{v.tags.map((t,i) => <span key={i} className="vtag">{t}</span>)}</div>
            )}
            <button
              className={`btn-venue ${user?.activeVenueId === v._id ? "checked" : ""}`}
              onClick={() => handleCheckIn(v._id)}
              disabled={checking === v._id || user?.activeVenueId === v._id}
            >
              {user?.activeVenueId === v._id ? "Checked In" : checking === v._id ? "Joining..." : "Check In"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
