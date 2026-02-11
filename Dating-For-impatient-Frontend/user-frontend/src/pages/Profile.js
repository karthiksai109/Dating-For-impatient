import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";

const HOBBY_OPTIONS = [
  "Travel", "Music", "Cooking", "Fitness", "Reading", "Gaming", "Photography",
  "Dancing", "Hiking", "Movies", "Art", "Yoga", "Sports", "Writing", "Tech",
  "Fashion", "Food", "Nature", "Pets", "Meditation"
];

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "", bio: "", gender: "", interestedIn: "", hobbies: [], interests: [],
    privacySettings: { showEmail: false, showPhone: false, showAge: true, showBio: true }
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        bio: user.bio || "",
        gender: user.gender || "",
        interestedIn: user.interestedIn || "everyone",
        hobbies: user.hobbies || [],
        interests: user.interests || [],
        privacySettings: user.privacySettings || { showEmail: false, showPhone: false, showAge: true, showBio: true }
      });
    }
  }, [user]);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const toggleHobby = (h) => {
    setForm(prev => ({
      ...prev,
      hobbies: prev.hobbies.includes(h) ? prev.hobbies.filter(x => x !== h) : [...prev.hobbies, h]
    }));
  };

  const togglePrivacy = (key) => {
    setForm(prev => ({
      ...prev,
      privacySettings: { ...prev.privacySettings, [key]: !prev.privacySettings[key] }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.patch("/me", {
        name: form.name,
        bio: form.bio,
        gender: form.gender,
        interestedIn: form.interestedIn,
        hobbies: form.hobbies,
        interests: form.hobbies,
        privacySettings: form.privacySettings
      });
      if (res.data.status) {
        updateUser(res.data.data);
        setSuccess("Profile updated!");
        setEditing(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="page profile-page">
      <div className="page-header">
        <h1>👤 My Profile</h1>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}

      <div className="profile-view-card">
        <div className="profile-view-header">
          <div className="profile-view-avatar">
            {user.photos?.[0] ? (
              <img src={user.photos[0]} alt={user.name} />
            ) : (
              <div className="avatar-placeholder xlarge">{user.name?.[0]}</div>
            )}
          </div>
          <div className="profile-view-info">
            <h2>{user.name}{user.age ? `, ${user.age}` : ""}</h2>
            <p className="profile-email">{user.email}</p>
            {user.gender && <span className="gender-badge">{user.gender}</span>}
            <span className="preference-badge">Interested in: {user.interestedIn || "everyone"}</span>
          </div>
        </div>

        {!editing ? (
          <>
            <div className="profile-section">
              <h3>About Me</h3>
              <p>{user.bio || "No bio yet"}</p>
            </div>

            <div className="profile-section">
              <h3>Hobbies & Interests</h3>
              <div className="interest-chips">
                {(user.hobbies || []).map((h, i) => (
                  <span key={i} className="interest-chip">{h}</span>
                ))}
                {(user.hobbies || []).length === 0 && <p className="muted">No hobbies added</p>}
              </div>
            </div>

            <div className="profile-section">
              <h3>Privacy Settings</h3>
              <div className="privacy-list">
                <div className="privacy-item">
                  <span>Show Age</span>
                  <span className={user.privacySettings?.showAge ? "privacy-on" : "privacy-off"}>
                    {user.privacySettings?.showAge ? "Visible" : "Hidden"}
                  </span>
                </div>
                <div className="privacy-item">
                  <span>Show Bio</span>
                  <span className={user.privacySettings?.showBio ? "privacy-on" : "privacy-off"}>
                    {user.privacySettings?.showBio ? "Visible" : "Hidden"}
                  </span>
                </div>
                <div className="privacy-item">
                  <span>Email</span>
                  <span className="privacy-off">Always Hidden from users</span>
                </div>
                <div className="privacy-item">
                  <span>Phone</span>
                  <span className="privacy-off">Always Hidden from users</span>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h3>Account Status</h3>
              <span className={`status-badge ${user.status?.toLowerCase()}`}>{user.status || "Active"}</span>
            </div>

            <div className="profile-actions">
              <button className="btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
              <button className="btn-danger" onClick={handleLogout}>Logout</button>
            </div>
          </>
        ) : (
          <div className="edit-form">
            <div className="form-group">
              <label>Name</label>
              <input type="text" value={form.name} onChange={e => update("name", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea value={form.bio} onChange={e => update("bio", e.target.value)} maxLength={500} rows={3} />
              <small>{form.bio.length}/500</small>
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select value={form.gender} onChange={e => update("gender", e.target.value)}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-Binary</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Interested In</label>
              <select value={form.interestedIn} onChange={e => update("interestedIn", e.target.value)}>
                <option value="everyone">Everyone</option>
                <option value="male">Men</option>
                <option value="female">Women</option>
              </select>
            </div>

            <div className="form-group">
              <label>Hobbies & Interests</label>
              <div className="hobby-grid">
                {HOBBY_OPTIONS.map(h => (
                  <button
                    key={h}
                    type="button"
                    className={`hobby-chip ${form.hobbies.includes(h) ? "selected" : ""}`}
                    onClick={() => toggleHobby(h)}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Privacy Settings</label>
              <div className="privacy-toggles">
                <label className="toggle-row">
                  <span>Show Age to others</span>
                  <input type="checkbox" checked={form.privacySettings.showAge} onChange={() => togglePrivacy("showAge")} />
                </label>
                <label className="toggle-row">
                  <span>Show Bio to others</span>
                  <input type="checkbox" checked={form.privacySettings.showBio} onChange={() => togglePrivacy("showBio")} />
                </label>
              </div>
              <p className="privacy-note">Your email and phone are NEVER shown to other users</p>
            </div>

            <div className="btn-row">
              <button className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
