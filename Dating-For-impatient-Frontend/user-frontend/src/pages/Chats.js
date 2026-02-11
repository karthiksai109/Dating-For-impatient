import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function Chats() {
  const [chatList, setChatList] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    fetchChatList();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.matchId);
      pollRef.current = setInterval(() => fetchMessages(activeChat.matchId), 3000);
      return () => clearInterval(pollRef.current);
    }
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchChatList = async () => {
    try {
      const res = await api.get("/chats");
      if (res.data.status) setChatList(res.data.data);
    } catch (err) {
      setError("Failed to load chats");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (matchId) => {
    try {
      const res = await api.get(`/messages/${matchId}`);
      if (res.data.status) setMessages(res.data.data);
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response?.data?.message || "You must be at the venue to view messages");
      }
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeChat || sending) return;
    setSending(true);
    setError("");
    try {
      const res = await api.post("/messages", { matchId: activeChat.matchId, text: newMsg.trim() });
      if (res.data.status) {
        setMessages(prev => [...prev, res.data.data]);
        setNewMsg("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="page chats-page">
      {!activeChat ? (
        <>
          <div className="page-header">
            <h1>💬 Chats</h1>
            <p>Messages are venue-locked for privacy</p>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <div className="chat-list">
            {chatList.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">💬</span>
                <h3>No chats yet</h3>
                <p>Match with someone at a venue to start chatting!</p>
              </div>
            ) : (
              chatList.map(chat => (
                <div
                  key={chat.matchId}
                  className={`chat-list-item ${chat.canChat ? "" : "disabled"}`}
                  onClick={() => chat.canChat ? setActiveChat(chat) : null}
                >
                  <div className="chat-avatar">
                    {chat.otherUser?.photos?.[0] ? (
                      <img src={chat.otherUser.photos[0]} alt={chat.otherUser?.name} />
                    ) : (
                      <div className="avatar-placeholder">{chat.otherUser?.name?.[0] || "?"}</div>
                    )}
                    {chat.canChat && <span className="online-dot"></span>}
                  </div>
                  <div className="chat-preview">
                    <h3>{chat.otherUser?.name || "Unknown"}</h3>
                    <p className="chat-venue-label">
                      {chat.venue?.name ? `📍 ${chat.venue.name}` : ""}
                    </p>
                    {chat.lastMessage ? (
                      <p className="last-msg">{chat.lastMessage.text}</p>
                    ) : (
                      <p className="last-msg empty">No messages yet</p>
                    )}
                  </div>
                  <div className="chat-status">
                    {chat.canChat ? (
                      <span className="chat-active-badge">Active</span>
                    ) : (
                      <span className="chat-locked-badge">🔒 Locked</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="chat-room">
          <div className="chat-room-header">
            <button className="back-btn" onClick={() => { setActiveChat(null); setMessages([]); setError(""); }}>
              ← Back
            </button>
            <div className="chat-room-user">
              <div className="chat-avatar small">
                {activeChat.otherUser?.photos?.[0] ? (
                  <img src={activeChat.otherUser.photos[0]} alt={activeChat.otherUser?.name} />
                ) : (
                  <div className="avatar-placeholder small">{activeChat.otherUser?.name?.[0] || "?"}</div>
                )}
              </div>
              <div>
                <h3>{activeChat.otherUser?.name}</h3>
                <p className="chat-venue-small">📍 {activeChat.venue?.name || "Venue"}</p>
              </div>
            </div>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <div className="messages-container">
            <div className="venue-lock-notice">
              🔒 Messages are only visible while both of you are at this venue
            </div>
            {messages.map((msg, idx) => {
              const isMe = (msg.from?._id || msg.from) === user._id;
              return (
                <div key={msg._id || idx} className={`message ${isMe ? "sent" : "received"}`}>
                  <div className="message-bubble">
                    <p>{msg.text}</p>
                    <span className="message-time">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form className="message-input-form" onSubmit={sendMessage}>
            <input
              type="text"
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              placeholder="Type a message..."
              maxLength={500}
            />
            <button type="submit" disabled={!newMsg.trim() || sending}>
              {sending ? "..." : "Send"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
