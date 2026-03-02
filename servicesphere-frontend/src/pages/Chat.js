import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import api from "../services/api";
import shared from "../styles/shared.module.css";
import chatStyles from "./Chat.module.css";
import Navbar from "../components/Navbar";

const socket = io("http://localhost:5000");

function Chat() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const navLinks = [
    { label: "Services", to: "/services" },
    { label: "Logout", onClick: logout, danger: true },
  ];

  useEffect(() => {
    if (!bookingId) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${bookingId}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Load messages error:", err.response?.data || err.message);
      }
    };

    fetchMessages();
    socket.emit("joinRoom", bookingId);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [bookingId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !bookingId) return;
    try {
      const res = await api.post("/messages", { bookingId, text });
      socket.emit("sendMessage", res.data);
      setMessages((prev) => [...prev, res.data]);
      setText("");
    } catch (err) {
      console.error("Send message error:", err.response?.data || err.message);
    }
  };

  return (
    <div className={shared.page}>
      <Navbar links={navLinks} />

      <div className={chatStyles.chatContainer}>
        <div className={chatStyles.chatWindow}>
          {/* Header */}
          <div className={chatStyles.chatHeader}>
            <span className={chatStyles.statusDot} />
            <div style={{ overflow: "hidden" }}>
              <p className={chatStyles.chatHeaderTitle}>Booking Chat</p>
              <p className={chatStyles.chatHeaderSub}>{bookingId}</p>
            </div>
          </div>

          {/* Messages */}
          <div className={chatStyles.messages}>
            {messages.length === 0 ? (
              <div className={chatStyles.emptyMessages}>
                No messages yet — say hello!
              </div>
            ) : (
              messages.map((msg) => {
                const senderId =
                  typeof msg.sender === "object"
                    ? msg.sender._id
                    : msg.sender;
                const isMe = senderId === user?._id;
                return (
                  <div
                    key={msg._id}
                    className={`${chatStyles.message} ${
                      isMe ? chatStyles.msgMine : chatStyles.msgOther
                    }`}
                  >
                    {msg.text}
                  </div>
                );
              })
            )}
          </div>

          {/* Input */}
          <form className={chatStyles.inputRow} onSubmit={sendMessage}>
            <input
              className={chatStyles.chatInput}
              type="text"
              placeholder="Type a message…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button type="submit" className={chatStyles.sendBtn}>
              Send
            </button>
          </form>
        </div>
      </div>

      <footer className={shared.footer}>
        <span className={shared.footerTag}>© 2025 ServiceSphere</span>
      </footer>
    </div>
  );
}

export default Chat;
