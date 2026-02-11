import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";

const HOBBIES = [
  "Travel","Music","Cooking","Fitness","Reading","Gaming","Photography",
  "Dancing","Hiking","Movies","Art","Yoga","Sports","Writing","Tech",
  "Fashion","Food","Nature","Pets","Meditation"
];

export default function Profile() {
  const { user, logout, updateUser, location } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name:"", bio:"", gender:"", interestedIn:"", hobbies:[], photoUrl:"", privacySettings:{showAge:true,showBio:true} });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type:"", text:"" });

  useEffect(() => {
    if (user) setForm({
      name: user.name||"", bio: user.bio||"", gender: user.gender||"",
      interestedIn: user.interestedIn||"everyone", hobbies: user.hobbies||[],
      photoUrl: user.photos?.[0] || "",
      privacySettings: user.privacySettings || {showAge:true,showBio:true}
    });
  }, [user]);

  const set = (k,v) => setForm(p => ({...p,[k]:v}));
  const toggleH = h => set("hobbies", form.hobbies.includes(h) ? form.hobbies.filter(x=>x!==h) : [...form.hobbies,h]);
  const toggleP = k => set("privacySettings", {...form.privacySettings, [k]:!form.privacySettings[k]});

  const save = async () => {
    setSaving(true); setMsg({type:"",text:""});
    try {
      const { photoUrl, ...rest } = form;
      const r = await api.patch("/me", { ...rest, interests: form.hobbies, photos: photoUrl ? [photoUrl] : [] });
      if (r.data.status) { updateUser(r.data.data); setMsg({type:"ok",text:"Saved!"}); setEditing(false); }
    } catch (e) { setMsg({type:"err",text:e.response?.data?.message||"Failed"}); }
    finally { setSaving(false); }
  };

  if (!user) return null;

  return (
    <div className="page">
      <header className="page-top">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-sub">{location ? "Location active" : "Location off"}</p>
        </div>
        <button className="btn-sm btn-danger-text" onClick={() => { logout(); navigate("/login"); }}>Sign Out</button>
      </header>

      {msg.text && <div className={msg.type === "ok" ? "toast-ok" : "toast-error"}>{msg.text}</div>}

      <div className="prof-card">
        <div className="prof-top">
          {user.photos?.[0] ? <img className="prof-av-img" src={user.photos[0]} alt={user.name} /> : <div className="prof-av">{user.name?.[0]}</div>}
          <div className="prof-info">
            <h2>{user.name}{user.age ? `, ${user.age}` : ""}</h2>
            <p className="prof-email">{user.email}</p>
            <div className="prof-badges">
              {user.gender && <span className="pbadge">{user.gender}</span>}
              <span className="pbadge">{user.interestedIn || "everyone"}</span>
              <span className={`pbadge ${(user.status||"active").toLowerCase()}`}>{user.status||"Active"}</span>
            </div>
          </div>
        </div>

        {!editing ? (
          <>
            <section className="prof-section">
              <h3>About</h3>
              <p>{user.bio || "No bio yet"}</p>
            </section>
            <section className="prof-section">
              <h3>Interests</h3>
              <div className="sc-tags">
                {(user.hobbies||[]).map((h,i) => <span key={i} className="stag">{h}</span>)}
                {(user.hobbies||[]).length === 0 && <p className="muted-text">None added</p>}
              </div>
            </section>
            <section className="prof-section">
              <h3>Privacy</h3>
              <div className="priv-list">
                <div className="priv-row"><span>Age</span><span className={user.privacySettings?.showAge?"priv-on":"priv-off"}>{user.privacySettings?.showAge?"Visible":"Hidden"}</span></div>
                <div className="priv-row"><span>Bio</span><span className={user.privacySettings?.showBio?"priv-on":"priv-off"}>{user.privacySettings?.showBio?"Visible":"Hidden"}</span></div>
                <div className="priv-row"><span>Email</span><span className="priv-off">Always hidden</span></div>
                <div className="priv-row"><span>Phone</span><span className="priv-off">Always hidden</span></div>
              </div>
            </section>
            <button className="btn-main full" onClick={() => setEditing(true)}>Edit Profile</button>
          </>
        ) : (
          <div className="edit-section">
            <div className="input-group"><label>Name</label><input value={form.name} onChange={e=>set("name",e.target.value)} /></div>
            <div className="input-group">
              <label>Photo URL <span className="char-count">optional</span></label>
              <input type="url" value={form.photoUrl} onChange={e=>set("photoUrl",e.target.value)} placeholder="https://example.com/photo.jpg" />
              {form.photoUrl && <img src={form.photoUrl} alt="Preview" className="photo-preview" onError={e => e.target.style.display='none'} />}
            </div>
            <div className="input-group">
              <label>Bio <span className="char-count">{form.bio.length}/500</span></label>
              <textarea value={form.bio} onChange={e=>set("bio",e.target.value)} maxLength={500} rows={3} />
            </div>
            <div className="row-2">
              <div className="input-group"><label>Gender</label>
                <select value={form.gender} onChange={e=>set("gender",e.target.value)}>
                  <option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="non-binary">Non-Binary</option><option value="other">Other</option>
                </select>
              </div>
              <div className="input-group"><label>Show me</label>
                <select value={form.interestedIn} onChange={e=>set("interestedIn",e.target.value)}>
                  <option value="everyone">Everyone</option><option value="male">Men</option><option value="female">Women</option>
                </select>
              </div>
            </div>
            <div className="input-group">
              <label>Interests</label>
              <div className="interest-grid">
                {HOBBIES.map(h => <button key={h} type="button" className={`interest-btn ${form.hobbies.includes(h)?"picked":""}`} onClick={()=>toggleH(h)}>{h}</button>)}
              </div>
            </div>
            <div className="input-group">
              <label>Privacy</label>
              <label className="toggle-row"><span>Show age</span><input type="checkbox" checked={form.privacySettings.showAge} onChange={()=>toggleP("showAge")} /></label>
              <label className="toggle-row"><span>Show bio</span><input type="checkbox" checked={form.privacySettings.showBio} onChange={()=>toggleP("showBio")} /></label>
              <p className="priv-note">Email and phone are never shown to other users</p>
            </div>
            <div className="btn-pair">
              <button className="btn-ghost" onClick={()=>setEditing(false)}>Cancel</button>
              <button className="btn-main" onClick={save} disabled={saving}>{saving ? <span className="btn-loader"></span> : "Save"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
