import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";

const HOBBY_OPTIONS = [
  "Travel", "Music", "Cooking", "Fitness", "Reading", "Gaming", "Photography",
  "Dancing", "Hiking", "Movies", "Art", "Yoga", "Sports", "Writing", "Tech",
  "Fashion", "Food", "Nature", "Pets", "Meditation"
];

export default function Register() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmpassword: "",
    dateOfBirth: "", gender: "", interestedIn: "everyone",
    bio: "", hobbies: [], interests: []
  });
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const toggleHobby = (h) => {
    setForm(prev => ({
      ...prev,
      hobbies: prev.hobbies.includes(h) ? prev.hobbies.filter(x => x !== h) : [...prev.hobbies, h]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/userregister", {
        ...form,
        interests: form.hobbies
      });
      if (res.data.status) {
        login(res.data.data.token, res.data.data.user);
        navigate("/venues");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <div className="auth-header">
          <span className="auth-logo">💘</span>
          <h1>Join VenueMatch</h1>
          <p>Step {step} of 3</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="step-content">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={form.name} onChange={e => update("name", e.target.value)} placeholder="Your name" required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="your@email.com" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={form.password} onChange={e => update("password", e.target.value)} placeholder="Min 6 characters" required />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" value={form.confirmpassword} onChange={e => update("confirmpassword", e.target.value)} placeholder="Confirm password" required />
              </div>
              <button type="button" className="btn-primary" onClick={() => {
                if (!form.name || !form.email || !form.password || !form.confirmpassword) { setError("Fill all fields"); return; }
                if (form.password !== form.confirmpassword) { setError("Passwords don't match"); return; }
                setError(""); setStep(2);
              }}>Next</button>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" value={form.dateOfBirth} onChange={e => update("dateOfBirth", e.target.value)} required />
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
                <label>Bio (tell us about yourself)</label>
                <textarea value={form.bio} onChange={e => update("bio", e.target.value)} placeholder="I love exploring new places..." maxLength={500} rows={3} required />
                <small>{form.bio.length}/500</small>
              </div>
              <div className="btn-row">
                <button type="button" className="btn-secondary" onClick={() => setStep(1)}>Back</button>
                <button type="button" className="btn-primary" onClick={() => {
                  if (!form.dateOfBirth || !form.bio) { setError("Fill all fields"); return; }
                  setError(""); setStep(3);
                }}>Next</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content">
              <div className="form-group">
                <label>Pick your interests (at least 3)</label>
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
                <small>{form.hobbies.length} selected</small>
              </div>
              <div className="btn-row">
                <button type="button" className="btn-secondary" onClick={() => setStep(2)}>Back</button>
                <button type="submit" className="btn-primary" disabled={loading || form.hobbies.length < 3}>
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}
