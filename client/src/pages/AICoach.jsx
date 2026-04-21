import React, { useState, useContext, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppContext } from "../context/AppContext";
import Navbar from "../components/Header";
import { API } from "../services/api";
import { Bot, Send, User, Trash2 } from "lucide-react";

function AICoach() {
  const { t, i18n } = useTranslation();
  const { plan, medicationList, symptomLogs, waterIntake, aiCoachChat: chat, addChatMessage, clearChat } = useContext(AppContext);

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // ✅ Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMsg = { sender: "user", text: message };
    addChatMessage(userMsg);
    setIsLoading(true);
    setMessage("");

    const savedProfile = JSON.parse(localStorage.getItem("profile") || "{}");

    try {
      const res = await fetch(`${API}/ai-coach`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          profile: {
            ...savedProfile,
            bmi: plan?.userSummary?.bmi || 22,
          },
          healthData: {
            medications: medicationList || [],
            symptoms: symptomLogs || [],
            waterIntake: waterIntake || 0,
          },
          language: i18n.language || "en",
        }),
      });

      if (!res.ok) {
        throw new Error(`Server Error: ${res.status}`);
      }

      const data = await res.json();
      const aiMsg = { sender: "ai", text: data.reply };
      addChatMessage(aiMsg);

    } catch (err) {
      console.error("AI Coach Fetch Error:", err);
      const errorMsg = err.message.includes("404") 
        ? "Error 404: Bot service not found. Check your PORT." 
        : t("aiCoach.serverError");
      addChatMessage({ sender: "ai", text: errorMsg });
    }

    setIsLoading(false);
    setMessage("");
  };

  const styles = {
    container: {
      padding: "20px 15px",
      maxWidth: "600px",
      margin: "0 auto",
      fontFamily: "var(--font-sans)",
      display: "flex",
      flexDirection: "column",
      height: "calc(100vh - 80px)", /* Full height minus header */
    },
    chatBox: {
      flex: 1,
      minHeight: "300px",
      overflowY: "auto",
      borderRadius: "20px",
      padding: "clamp(10px, 4vw, 20px)",
      background: "var(--card-bg)",
      backdropFilter: "blur(12px)",
      border: "1px solid var(--card-border)",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
      marginTop: "10px",
      marginBottom: "20px",
    },
    message: (sender) => ({
      textAlign: sender === "user" ? "right" : "left",
      margin: "12px 0",
    }),
    bubble: (sender) => ({
      background: sender === "user" ? "var(--food-primary)" : "var(--ai-bubble-bg)",
      color: sender === "user" ? "var(--button-text)" : "var(--text-primary)",
      padding: "12px 18px",
      borderRadius: sender === "user" ? "18px 18px 0 18px" : "18px 18px 18px 0",
      display: "inline-block",
      maxWidth: "75%",
      boxShadow: sender === "user" ? "0 4px 10px rgba(255, 107, 107, 0.2)" : "0 4px 10px rgba(0,0,0,0.05)",
      fontWeight: "500",
      lineHeight: "1.5",
    }),
    inputBox: {
      display: "flex",
      gap: "12px",
    },
    input: {
      flex: 1,
      padding: "14px",
      borderRadius: "14px",
      border: "1px solid rgba(0,0,0,0.1)",
      outline: "none",
      fontFamily: "var(--font-sans)",
      boxShadow: "0 4px 10px rgba(0,0,0,0.02)",
    },
    button: {
      padding: "14px 24px",
      borderRadius: "14px",
      border: "none",
      background: "var(--food-primary)",
      color: "var(--button-text)",
      cursor: "pointer",
      fontWeight: "700",
      boxShadow: "0 8px 16px rgba(255, 107, 107, 0.2)",
      transition: "all 0.3s ease",
    },
  };

  return (
    <div className="page-enter">
      <Navbar />

      <div style={styles.container}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', marginBottom: '20px', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bot color="var(--food-primary)" size={32} /> {t("aiCoach.title")}
          </span>
          {chat.length > 0 && (
            <button
              onClick={() => { if (window.confirm(t("aiCoach.clearConfirm"))) clearChat(); }}
              title="Clear chat"
              style={{ background: 'none', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e74c3c'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <Trash2 size={15} /> Clear
            </button>
          )}
        </h2>

        {/* Chat */}
        <div style={styles.chatBox} className="hide-scrollbar">
          {/* Empty state hint */}
          {chat.length === 0 && !isLoading && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
              <p style={{ fontWeight: '600', marginBottom: '8px', fontSize: '16px', color: 'var(--text-primary)' }}>{t("aiCoach.title")}</p>
              <p style={{ fontSize: '14px', lineHeight: '1.6' }}>{t("aiCoach.emptyHint")}</p>
              <p style={{ fontSize: '12px', marginTop: '12px', opacity: 0.7, fontStyle: 'italic' }}>{t("aiCoach.langSwitchHint")}</p>
            </div>
          )}
          {chat.map((msg, index) => (
            <div key={index} style={styles.message(msg.sender)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: msg.sender === "user" ? 'flex-end' : 'flex-start', gap: '10px' }}>
                {msg.sender === "ai" && <Bot color="var(--food-primary)" size={26} style={{ marginTop: '8px', flexShrink: 0 }} />}
                <span style={styles.bubble(msg.sender)}>
                  {msg.text}
                </span>
                {msg.sender === "user" && <User color="var(--text-secondary)" size={26} style={{ marginTop: '8px', flexShrink: 0 }} />}
              </div>
            </div>
          ))}
          {/* Typing indicator */}
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '12px' }}>
              <Bot color="var(--food-primary)" size={26} style={{ marginTop: '8px', flexShrink: 0 }} />
              <div className="typing-indicator">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div style={styles.inputBox}>
          <input
            type="text"
            value={message}
            placeholder={isLoading ? t("aiCoach.thinking") : t("aiCoach.placeholder")}
            onChange={(e) => setMessage(e.target.value)}
            style={{ ...styles.input, opacity: isLoading ? 0.7 : 1 }}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={isLoading}
          />

          <button
            style={{ ...styles.button, display: 'flex', alignItems: 'center', gap: '8px', opacity: isLoading ? 0.6 : 1 }}
            onClick={sendMessage}
            disabled={isLoading}
          >
            {isLoading ? '...' : <><span>{t("aiCoach.send")}</span> <Send size={18} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AICoach;