import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function Discover() {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(null);
  const [matchPopup, setMatchPopup] = useState(null);
  const [error, setError] = useState("");
  const { user, venue } = useAuth();
  const navigate = useNavigate();

  const fetchProfiles = useCallback(async () => {
    try {
      const res = await api.get("/discover");
      if (res.data.status) {
        setProfiles(res.data.data);
        setCurrentIndex(0);
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response?.data?.message || "Check in to a venue first");
      } else {
        setError("Failed to load profiles");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.activeVenueId) {
      setError("Check in to a venue first to discover people");
      setLoading(false);
      return;
    }
    fetchProfiles();
  }, [user?.activeVenueId, fetchProfiles]);

  const handleSwipe = async (direction) => {
    if (currentIndex >= profiles.length) return;
    const target = profiles[currentIndex];
    setSwiping(direction);

    try {
      if (direction === "right") {
        const res = await api.post("/swipe/right", { targetUserId: target._id });
        if (res.data.data?.matched) {
          setMatchPopup(res.data.data.matchedUser);
        }
      } else {
        await api.post("/swipe/left", { targetUserId: target._id });
      }
    } catch (err) {
      console.error("Swipe error:", err);
    }

    setTimeout(() => {
      setSwiping(null);
      setCurrentIndex(prev => prev + 1);
    }, 300);
  };

  const currentProfile = profiles[currentIndex];

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  if (!user?.activeVenueId) {
    return (
      <div className="page discover-page">
        <div className="empty-state">
          <span className="empty-icon">📍</span>
          <h3>No Venue Selected</h3>
          <p>Check in to a venue to start discovering people nearby</p>
          <button className="btn-primary" onClick={() => navigate("/venues")}>Find Venues</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page discover-page">
      <div className="page-header">
        <h1>🔥 Discover</h1>
        {venue && <p className="venue-indicator">At: {typeof venue === "object" ? venue.name : "Your Venue"}</p>}
      </div>

      {error && <div className="error-msg">{error}</div>}

      {/* Match Popup */}
      {matchPopup && (
        <div className="match-popup-overlay" onClick={() => setMatchPopup(null)}>
          <div className="match-popup" onClick={e => e.stopPropagation()}>
            <div className="match-animation">💕</div>
            <h2>It's a Match!</h2>
            <p>You and <strong>{matchPopup.name}</strong> liked each other</p>
            <div className="match-popup-photo">
              {matchPopup.photos?.[0] ? (
                <img src={matchPopup.photos[0]} alt={matchPopup.name} />
              ) : (
                <div className="avatar-placeholder large">{matchPopup.name?.[0]}</div>
              )}
            </div>
            <div className="match-popup-actions">
              <button className="btn-primary" onClick={() => { setMatchPopup(null); navigate("/chats"); }}>
                Send a Message
              </button>
              <button className="btn-secondary" onClick={() => setMatchPopup(null)}>
                Keep Swiping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Cards */}
      <div className="swipe-container">
        {currentIndex >= profiles.length ? (
          <div className="empty-state">
            <span className="empty-icon">👀</span>
            <h3>No more profiles</h3>
            <p>You've seen everyone at this venue. Check back later!</p>
            <button className="btn-primary" onClick={() => { setLoading(true); fetchProfiles(); }}>Refresh</button>
          </div>
        ) : currentProfile ? (
          <div className={`profile-card ${swiping === "left" ? "swipe-left-anim" : swiping === "right" ? "swipe-right-anim" : ""}`}>
            <div className="profile-photo">
              {currentProfile.photos?.[0] ? (
                <img src={currentProfile.photos[0]} alt={currentProfile.name} />
              ) : (
                <div className="avatar-placeholder xlarge">{currentProfile.name?.[0]}</div>
              )}
              <div className="profile-overlay">
                <h2>{currentProfile.name}{currentProfile.age ? `, ${currentProfile.age}` : ""}</h2>
                {currentProfile.gender && <span className="gender-badge">{currentProfile.gender}</span>}
              </div>
            </div>

            <div className="profile-details">
              {currentProfile.bio && <p className="profile-bio">{currentProfile.bio}</p>}

              {currentProfile.matchScore > 0 && (
                <div className="match-score">
                  <div className="match-score-bar">
                    <div className="match-score-fill" style={{ width: `${currentProfile.matchScore}%` }}></div>
                  </div>
                  <span>{currentProfile.matchScore}% Match</span>
                </div>
              )}

              {currentProfile.commonInterests?.length > 0 && (
                <div className="common-interests">
                  <h4>Common Interests</h4>
                  <div className="interest-chips">
                    {currentProfile.commonInterests.map((i, idx) => (
                      <span key={idx} className="interest-chip common">{i}</span>
                    ))}
                  </div>
                </div>
              )}

              {currentProfile.hobbies?.length > 0 && (
                <div className="profile-hobbies">
                  <h4>Hobbies</h4>
                  <div className="interest-chips">
                    {currentProfile.hobbies.map((h, idx) => (
                      <span key={idx} className="interest-chip">{h}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="swipe-actions">
              <button className="swipe-btn pass" onClick={() => handleSwipe("left")} title="Pass">
                ✕
              </button>
              <button className="swipe-btn like" onClick={() => handleSwipe("right")} title="Like">
                ♥
              </button>
            </div>
          </div>
        ) : null}

        <div className="profiles-remaining">
          {profiles.length - currentIndex} profiles remaining at this venue
        </div>
      </div>
    </div>
  );
}
