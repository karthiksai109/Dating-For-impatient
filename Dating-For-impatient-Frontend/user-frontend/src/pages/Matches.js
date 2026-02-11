import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [allMatches, setAllMatches] = useState([]);
  const [tab, setTab] = useState("venue");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, venue } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const [venueRes, allRes] = await Promise.all([
        api.get("/matches").catch(() => ({ data: { data: [] } })),
        api.get("/matches/all").catch(() => ({ data: { data: [] } }))
      ]);
      if (venueRes.data?.data) setMatches(venueRes.data.data);
      if (allRes.data?.data) setAllMatches(allRes.data.data);
    } catch (err) {
      setError("Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  const currentList = tab === "venue" ? matches : allMatches;

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="page matches-page">
      <div className="page-header">
        <h1>💕 Matches</h1>
        <p>{venue ? "People you matched with at this venue" : "Check in to see venue matches"}</p>
      </div>

      <div className="tab-bar">
        <button className={`tab ${tab === "venue" ? "active" : ""}`} onClick={() => setTab("venue")}>
          At Venue ({matches.length})
        </button>
        <button className={`tab ${tab === "all" ? "active" : ""}`} onClick={() => setTab("all")}>
          All Matches ({allMatches.length})
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="matches-list">
        {currentList.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">💫</span>
            <h3>No matches yet</h3>
            <p>{tab === "venue" ? "Start swiping to find matches at this venue!" : "Your matches will appear here"}</p>
            <button className="btn-primary" onClick={() => navigate("/discover")}>Discover People</button>
          </div>
        ) : (
          currentList.map(match => (
            <div key={match._id} className="match-card">
              <div className="match-card-left">
                <div className="match-avatar">
                  {match.matchedUser?.photos?.[0] ? (
                    <img src={match.matchedUser.photos[0]} alt={match.matchedUser?.name} />
                  ) : (
                    <div className="avatar-placeholder">{match.matchedUser?.name?.[0] || "?"}</div>
                  )}
                  {match.canChat && <span className="online-dot"></span>}
                </div>
                <div className="match-info">
                  <h3>{match.matchedUser?.name || "Unknown"}</h3>
                  <p className="match-venue">
                    {match.venueId?.name ? `📍 ${match.venueId.name}` : ""}
                    {match.venueId?.type ? ` (${match.venueId.type})` : ""}
                  </p>
                  <p className="match-time">
                    Matched {new Date(match.matchedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="match-card-right">
                {match.canChat ? (
                  <button className="btn-chat" onClick={() => navigate("/chats")}>
                    💬 Chat
                  </button>
                ) : (
                  <span className="chat-locked">🔒 Not at venue</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
