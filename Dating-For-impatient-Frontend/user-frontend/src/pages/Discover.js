import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function Discover() {
  const [profiles, setProfiles] = useState([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(null);
  const [matchPopup, setMatchPopup] = useState(null);
  const [error, setError] = useState("");
  const { user, venue } = useAuth();
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      const res = await api.get("/discover");
      if (res.data.status) { setProfiles(res.data.data); setIdx(0); }
    } catch (err) {
      setError(err.response?.data?.message || "Could not load profiles");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!user?.activeVenueId) { setError("Check in to a venue first"); setLoading(false); return; }
    load();
  }, [user?.activeVenueId, load]);

  const swipe = async (dir) => {
    if (idx >= profiles.length) return;
    const target = profiles[idx];
    setSwiping(dir);
    try {
      if (dir === "right") {
        const res = await api.post("/swipe/right", { targetUserId: target._id });
        if (res.data.data?.matched) setMatchPopup(res.data.data.matchedUser);
      } else {
        await api.post("/swipe/left", { targetUserId: target._id });
      }
    } catch (err) { /* silent */ }
    setTimeout(() => { setSwiping(null); setIdx(p => p + 1); }, 350);
  };

  const p = profiles[idx];
  const remaining = Math.max(profiles.length - idx, 0);

  if (loading) return <div className="page-loader"><div className="loader-ring"></div></div>;

  if (!user?.activeVenueId) {
    return (
      <div className="page center-page">
        <div className="empty-box">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#c93545" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <h3>No venue yet</h3>
          <p>Check in to a venue to see who's around</p>
          <button className="btn-main" onClick={() => navigate("/venues")}>Find a Venue</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-top">
        <div>
          <h1 className="page-title">Discover</h1>
          {venue && <p className="page-sub">at {typeof venue === "object" ? venue.name : "your venue"}</p>}
        </div>
        <span className="badge-count">{remaining} left</span>
      </header>

      {error && <div className="toast-error">{error}</div>}

      {matchPopup && (
        <div className="overlay" onClick={() => setMatchPopup(null)}>
          <div className="match-modal" onClick={e => e.stopPropagation()}>
            <div className="match-hearts">
              <svg width="48" height="48" viewBox="0 0 40 40" fill="none"><path d="M20 36C20 36 4 26 4 14C4 8 8 4 14 4C17.5 4 20 6.5 20 6.5C20 6.5 22.5 4 26 4C32 4 36 8 36 14C36 26 20 36 20 36Z" fill="#e8465a"/></svg>
            </div>
            <h2>It's a match!</h2>
            <p>You and <strong>{matchPopup.name}</strong> liked each other</p>
            {matchPopup.photos?.[0] ? <img className="match-avatar-img" src={matchPopup.photos[0]} alt={matchPopup.name} /> : <div className="match-avatar">{matchPopup.name?.[0]}</div>}
            <div className="match-btns">
              <button className="btn-main" onClick={() => { setMatchPopup(null); navigate("/chats"); }}>Send Message</button>
              <button className="btn-ghost" onClick={() => setMatchPopup(null)}>Keep Swiping</button>
            </div>
          </div>
        </div>
      )}

      <div className="card-stack">
        {idx >= profiles.length ? (
          <div className="empty-box">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 15s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            <h3>That's everyone</h3>
            <p>You've seen all profiles at this venue</p>
            <button className="btn-main" onClick={() => { setLoading(true); load(); }}>Refresh</button>
          </div>
        ) : p ? (
          <div className={`swipe-card ${swiping === "left" ? "exit-left" : swiping === "right" ? "exit-right" : "enter"}`}>
            <div className="sc-photo">
              {p.photos?.[0] ? <img src={p.photos[0]} alt={p.name} /> : <div className="sc-avatar">{p.name?.[0]}</div>}
              <div className="sc-gradient">
                <h2>{p.name}{p.age ? `, ${p.age}` : ""}</h2>
                {p.gender && <span className="sc-gender">{p.gender}</span>}
              </div>
            </div>
            <div className="sc-body">
              {p.bio && <p className="sc-bio">{p.bio}</p>}
              {p.matchScore > 0 && (
                <div className="compat">
                  <div className="compat-bar"><div className="compat-fill" style={{width:`${p.matchScore}%`}}></div></div>
                  <span className="compat-pct">{p.matchScore}% compatible</span>
                </div>
              )}
              {p.commonInterests?.length > 0 && (
                <div className="sc-tags">
                  {p.commonInterests.map((c,i) => <span key={i} className="stag shared">{c}</span>)}
                </div>
              )}
              {p.hobbies?.length > 0 && (
                <div className="sc-tags">
                  {p.hobbies.filter(h => !p.commonInterests?.includes(h.toLowerCase())).map((h,i) => <span key={i} className="stag">{h}</span>)}
                </div>
              )}
            </div>
            <div className="sc-actions">
              <button className="action-btn pass" onClick={() => swipe("left")}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <button className="action-btn like" onClick={() => swipe("right")}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
