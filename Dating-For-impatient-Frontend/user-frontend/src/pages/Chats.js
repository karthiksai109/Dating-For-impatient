import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function Chats() {
  const [chatList, setChatList] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const endRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    api.get("/chats").then(r => { if (r.data.status) setChatList(r.data.data); })
      .catch(() => {}).finally(() => setLoading(false));
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  useEffect(() => {
    if (!active) return;
    const load = () => api.get(`/messages/${active.matchId}`).then(r => { if (r.data.status) setMessages(r.data.data); }).catch(e => {
      if (e.response?.status === 400) setError("Must be at venue to chat");
    });
    load();
    pollRef.current = setInterval(load, 3000);
    return () => clearInterval(pollRef.current);
  }, [active]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !active || sending) return;
    setSending(true); setError("");
    try {
      const r = await api.post("/messages", { matchId: active.matchId, text: text.trim() });
      if (r.data.status) { setMessages(p => [...p, r.data.data]); setText(""); }
    } catch (err) { setError(err.response?.data?.message || "Send failed"); }
    finally { setSending(false); }
  };

  if (loading) return <div className="page-loader"><div className="loader-ring"></div></div>;

  if (active) {
    return (
      <div className="chat-room">
        <div className="cr-header">
          <button className="cr-back" onClick={() => { setActive(null); setMessages([]); setError(""); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div className="cr-user">
            <div className="cr-av">{active.otherUser?.photos?.[0] ? <img src={active.otherUser.photos[0]} alt={active.otherUser.name} /> : (active.otherUser?.name?.[0] || "?")}</div>
            <div>
              <h3>{active.otherUser?.name}</h3>
              <p>{active.venue?.name || "Venue"}</p>
            </div>
          </div>
        </div>

        {error && <div className="toast-error">{error}</div>}

        <div className="cr-messages">
          <div className="venue-notice">Messages disappear when you leave this venue</div>
          {messages.map((m, i) => {
            const mine = (m.from?._id || m.from) === user._id;
            return (
              <div key={m._id || i} className={`bubble-row ${mine ? "mine" : "theirs"}`}>
                <div className="bubble">
                  <p>{m.text}</p>
                  <span className="btime">{new Date(m.createdAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</span>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        <form className="cr-input" onSubmit={send}>
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Say something..." maxLength={500} />
          <button type="submit" disabled={!text.trim() || sending}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-top">
        <div>
          <h1 className="page-title">Messages</h1>
          <p className="page-sub">Venue-locked for your privacy</p>
        </div>
      </header>

      <div className="cl-list">
        {chatList.length === 0 ? (
          <div className="empty-box">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            <h3>No conversations</h3>
            <p>Match with someone to start chatting</p>
          </div>
        ) : chatList.map(c => (
          <div key={c.matchId} className={`cl-item ${c.canChat ? "" : "locked"}`} onClick={() => c.canChat && setActive(c)}>
            <div className="cl-av">
              {c.otherUser?.photos?.[0] ? <img src={c.otherUser.photos[0]} alt={c.otherUser.name} /> : (c.otherUser?.name?.[0] || "?")}
              {c.canChat && <span className="pulse-dot"></span>}
            </div>
            <div className="cl-body">
              <h3>{c.otherUser?.name || "Unknown"}</h3>
              <p className="cl-venue">{c.venue?.name || ""}</p>
              <p className="cl-preview">{c.lastMessage?.text || "No messages yet"}</p>
            </div>
            {c.canChat ? (
              <span className="cl-status active">Active</span>
            ) : (
              <span className="cl-status">Locked</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
