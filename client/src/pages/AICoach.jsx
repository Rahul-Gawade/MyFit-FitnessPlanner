import React, { useState, useContext, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppContext } from "../context/AppContext";
import Navbar from "../components/Header";

function AICoach() {
  const { t } = useTranslation();
  const { plan } = useContext(AppContext); // ✅ get dynamic data

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const chatEndRef = useRef(null);

  // ✅ Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { sender: "user", text: message };
    setChat((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("http://localhost:5000/ai-coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          bmi: plan?.userSummary?.bmi || 22,
          goal: plan?.userSummary?.goal || "fitness",
          medical_condition: plan?.userSummary?.medical_condition || "None",
        }),
      });

      const data = await res.json();

      const aiMsg = { sender: "ai", text: data.reply };

      setChat((prev) => [...prev, aiMsg]);

    } catch (err) {
      setChat((prev) => [
        ...prev,
        { sender: "ai", text: t("aiCoach.serverError") },
      ]);
    }

    setMessage("");
  };

  const styles = {
    container: {
      padding: "20px",
      maxWidth: "600px",
      margin: "auto",
      fontFamily: "sans-serif",
    },
    chatBox: {
      height: "350px",
      overflowY: "auto",
      borderRadius: "15px",
      padding: "15px",
      background: "#f9fafb",
      boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
      marginBottom: "10px",
    },
    message: (sender) => ({
      textAlign: sender === "user" ? "right" : "left",
      margin: "8px 0",
    }),
    bubble: (sender) => ({
      background: sender === "user" ? "#2563eb" : "#e5e7eb",
      color: sender === "user" ? "#fff" : "#000",
      padding: "10px 14px",
      borderRadius: "15px",
      display: "inline-block",
      maxWidth: "75%",
    }),
    inputBox: {
      display: "flex",
      gap: "10px",
    },
    input: {
      flex: 1,
      padding: "10px",
      borderRadius: "10px",
      border: "1px solid #ccc",
      outline: "none",
    },
    button: {
      padding: "10px 15px",
      borderRadius: "10px",
      border: "none",
      background: "#2563eb",
      color: "#fff",
      cursor: "pointer",
    },
  };

  return (
    <div>
      <Navbar />

      <div style={styles.container}>
        <h2>{t("aiCoach.title")}</h2>

        {/* Chat */}
        <div style={styles.chatBox}>
          {chat.map((msg, index) => (
            <div key={index} style={styles.message(msg.sender)}>
              <span style={styles.bubble(msg.sender)}>
                {msg.text}
              </span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div style={styles.inputBox}>
          <input
            type="text"
            value={message}
            placeholder={t("aiCoach.placeholder")}
            onChange={(e) => setMessage(e.target.value)}
            style={styles.input}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()} // ✅ Enter key
          />

          <button style={styles.button} onClick={sendMessage}>
            {t("aiCoach.send")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AICoach;