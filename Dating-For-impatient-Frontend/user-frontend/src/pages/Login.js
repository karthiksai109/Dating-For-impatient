import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/userlogin", { email, password });
      if (res.data.status) {
        login(res.data.data.token, res.data.data.user);
        navigate("/venues");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M20 36C20 36 4 26 4 14C4 8 8 4 14 4C17.5 4 20 6.5 20 6.5C20 6.5 22.5 4 26 4C32 4 36 8 36 14C36 26 20 36 20 36Z" fill="#e8465a" stroke="#c93545" strokeWidth="1.5"/>
            </svg>
          </div>
          <h1>Impulse</h1>
          <p className="brand-tagline">Real places. Real people. Real connections.</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="toast-error">{error}</div>}
          <div className="input-group">
            <label>Email address</label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required autoFocus
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <div className="pass-wrap">
              <input
                type={showPass ? "text" : "password"} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password" required
              />
              <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-main" disabled={loading}>
            {loading ? <span className="btn-loader"></span> : "Sign In"}
          </button>
        </form>
        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
