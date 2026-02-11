import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";

const INTERESTS = [
  { label: "Travel", icon: "plane" }, { label: "Music", icon: "music" },
  { label: "Cooking", icon: "chef" }, { label: "Fitness", icon: "dumbbell" },
  { label: "Reading", icon: "book" }, { label: "Gaming", icon: "gamepad" },
  { label: "Photography", icon: "camera" }, { label: "Dancing", icon: "sparkles" },
  { label: "Hiking", icon: "mountain" }, { label: "Movies", icon: "film" },
  { label: "Art", icon: "palette" }, { label: "Yoga", icon: "lotus" },
  { label: "Sports", icon: "trophy" }, { label: "Writing", icon: "pen" },
  { label: "Tech", icon: "code" }, { label: "Fashion", icon: "shirt" },
  { label: "Food", icon: "utensils" }, { label: "Nature", icon: "leaf" },
  { label: "Pets", icon: "paw" }, { label: "Meditation", icon: "brain" }
];

export default function Register() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmpassword: "",
    dateOfBirth: "", gender: "", interestedIn: "everyone",
    bio: "", hobbies: [], photoUrl: ""
  });
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggle = (h) => set("hobbies", form.hobbies.includes(h) ? form.hobbies.filter(x => x !== h) : [...form.hobbies, h]);

  const next = () => {
    setError("");
    if (step === 1) {
      if (!form.name || !form.email || !form.password || !form.confirmpassword) return setError("All fields are required");
      if (form.password.length < 6) return setError("Password must be at least 6 characters");
      if (form.password !== form.confirmpassword) return setError("Passwords don't match");
      setStep(2);
    } else if (step === 2) {
      if (!form.dateOfBirth || !form.bio) return setError("Please complete all fields");
      const age = Math.floor((Date.now() - new Date(form.dateOfBirth).getTime()) / 31557600000);
      if (age < 18) return setError("You must be 18 or older");
      setStep(3);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.hobbies.length < 3) return setError("Pick at least 3 interests");
    setError(""); setLoading(true);
    try {
      const payload = { ...form, interests: form.hobbies, photos: form.photoUrl ? [form.photoUrl] : [] };
      delete payload.photoUrl;
      const res = await api.post("/userregister", payload);
      if (res.data.status) { login(res.data.data.token, res.data.data.user); navigate("/venues"); }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  const stepTitles = ["Create Account", "About You", "Your Interests"];

  return (
    <div className="auth-page">
      <div className="auth-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>
      <div className="auth-card reg-card">
        <div className="auth-brand">
          <h1>Impulse</h1>
          <p className="brand-tagline">{stepTitles[step - 1]}</p>
        </div>

        <div className="step-dots">
          {[1,2,3].map(s => (
            <span key={s} className={`dot ${s === step ? "active" : s < step ? "done" : ""}`}>{s < step ? "\u2713" : s}</span>
          ))}
        </div>

        {error && <div className="toast-error">{error}</div>}

        <form onSubmit={submit} className="auth-form">
          {step === 1 && (
            <>
              <div className="input-group">
                <label>Full name</label>
                <input type="text" value={form.name} onChange={e => set("name", e.target.value)} placeholder="What should we call you?" required />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@example.com" required />
              </div>
              <div className="row-2">
                <div className="input-group">
                  <label>Password</label>
                  <input type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="6+ characters" required />
                </div>
                <div className="input-group">
                  <label>Confirm</label>
                  <input type="password" value={form.confirmpassword} onChange={e => set("confirmpassword", e.target.value)} placeholder="Re-enter" required />
                </div>
              </div>
              <button type="button" className="btn-main" onClick={next}>Continue</button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="row-2">
                <div className="input-group">
                  <label>Date of birth</label>
                  <input type="date" value={form.dateOfBirth} onChange={e => set("dateOfBirth", e.target.value)} required />
                </div>
                <div className="input-group">
                  <label>Gender</label>
                  <select value={form.gender} onChange={e => set("gender", e.target.value)}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-Binary</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label>Show me</label>
                <div className="pill-row">
                  {[{v:"everyone",l:"Everyone"},{v:"male",l:"Men"},{v:"female",l:"Women"}].map(o => (
                    <button key={o.v} type="button" className={`pill ${form.interestedIn === o.v ? "active" : ""}`} onClick={() => set("interestedIn", o.v)}>{o.l}</button>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label>Bio <span className="char-count">{form.bio.length}/500</span></label>
                <textarea value={form.bio} onChange={e => set("bio", e.target.value)} placeholder="A little about yourself..." maxLength={500} rows={3} required />
              </div>
              <div className="input-group">
                <label>Profile Photo URL <span className="char-count">optional</span></label>
                <input type="url" value={form.photoUrl} onChange={e => set("photoUrl", e.target.value)} placeholder="https://example.com/your-photo.jpg" />
                {form.photoUrl && <img src={form.photoUrl} alt="Preview" className="photo-preview" onError={e => e.target.style.display='none'} />}
              </div>
              <div className="btn-pair">
                <button type="button" className="btn-ghost" onClick={() => setStep(1)}>Back</button>
                <button type="button" className="btn-main" onClick={next}>Continue</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="pick-label">Tap to select ({form.hobbies.length} picked, need 3+)</p>
              <div className="interest-grid">
                {INTERESTS.map(i => (
                  <button key={i.label} type="button" className={`interest-btn ${form.hobbies.includes(i.label) ? "picked" : ""}`} onClick={() => toggle(i.label)}>
                    {i.label}
                  </button>
                ))}
              </div>
              <div className="btn-pair">
                <button type="button" className="btn-ghost" onClick={() => setStep(2)}>Back</button>
                <button type="submit" className="btn-main" disabled={loading || form.hobbies.length < 3}>
                  {loading ? <span className="btn-loader"></span> : "Join Impulse"}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="auth-switch">
          Already on Impulse? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
