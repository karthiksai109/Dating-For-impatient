import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [allMatches, setAllMatches] = useState([]);
  const [tab, setTab] = useState("venue");
  const [loading, setLoading] = useState(true);
  const { venue } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [v, a] = await Promise.all([
          api.get("/matches").catch(() => ({ data: { data: [] } })),
          api.get("/matches/all").catch(() => ({ data: { data: [] } }))
        ]);
        if (v.data?.data) setMatches(v.data.data);
        if (a.data?.data) setAllMatches(a.data.data);
      } catch (e) { /* silent */ }
      finally { setLoading(false); }
    })();
  }, []);

  const list = tab === "venue" ? matches : allMatches;

  if (loading) return <div className="page-loader"><div className="loader-ring"></div></div>;

  return (
    <div className="page">
      <header className="page-top">
        <div>
          <h1 className="page-title">Matches</h1>
          <p className="page-sub">{venue ? "People who liked you back" : "Check in to see venue matches"}</p>
        </div>
      </header>

      <div className="seg-control">
        <button className={`seg ${tab === "venue" ? "on" : ""}`} onClick={() => setTab("venue")}>
          Here ({matches.length})
        </button>
        <button className={`seg ${tab === "all" ? "on" : ""}`} onClick={() => setTab("all")}>
          All ({allMatches.length})
        </button>
      </div>

      <div className="match-list">
        {list.length === 0 ? (
          <div className="empty-box">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            <h3>No matches yet</h3>
            <p>{tab === "venue" ? "Swipe right on someone you like" : "Your matches will show up here"}</p>
            <button className="btn-main" onClick={() => navigate("/discover")}>Start Discovering</button>
          </div>
        ) : list.map(m => (
          <div key={m._id} className="m-card">
            <div className="m-left">
              <div className="m-av">
                {m.matchedUser?.photos?.[0] ? <img src={m.matchedUser.photos[0]} alt={m.matchedUser.name} /> : (m.matchedUser?.name?.[0] || "?")}
                {m.canChat && <span className="pulse-dot"></span>}
              </div>
              <div className="m-info">
                <h3>{m.matchedUser?.name || "Unknown"}</h3>
                <p className="m-where">{m.venueId?.name || ""}{m.venueId?.type ? ` \u00B7 ${m.venueId.type}` : ""}</p>
                <p className="m-when">{new Date(m.matchedAt).toLocaleDateString()}</p>
              </div>
            </div>
            {m.canChat ? (
              <button className="btn-sm btn-main" onClick={() => navigate("/chats")}>Chat</button>
            ) : (
              <span className="locked-badge">Venue only</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
