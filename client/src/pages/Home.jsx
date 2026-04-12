import { useContext, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Navbar from "../components/Header";

function Home() {
  const { t, i18n } = useTranslation();
  const { plan } = useContext(AppContext);
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const speechUtteranceRef = useRef(null);
  
  //cancel ongoing speech on unmount to prevent memory leaks and unwanted behavior
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getHomeSpeechText = () => {
    if (!plan) return "";
    const condition = plan.userSummary?.medical_condition && plan.userSummary.medical_condition !== "None"
      ? ` Your medical condition is ${plan.userSummary.medical_condition}.`
      : "";

    return `Here is your personalized plan summary. Your goal is ${plan.userSummary?.goal}. Your height is ${plan.userSummary?.height} centimeters and your weight is ${plan.userSummary?.weight} kilograms. Your BMI is ${plan.userSummary?.bmi}. You have a daily calorie target of ${plan.calories} calories. ${condition} ${plan.bmiAnalysis}`;
  };

  const startReading = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = getHomeSpeechText();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const language = i18n?.language || "en-US";
    utterance.lang = language;
    utterance.volume = 1;
    utterance.rate = 1;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) => v.lang.startsWith(language.split("-")[0])) || voices[0];
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      speechUtteranceRef.current = null;
    };
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error || event);
      setIsSpeaking(false);
      setIsPaused(false);
      speechUtteranceRef.current = null;
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const pauseReading = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resumeReading = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
    }
  };

  const stopReading = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    speechUtteranceRef.current = null;
  };

  if (!plan) {
    return (
      <div>
        <Navbar />
        <div style={styles.heroContainer}>
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>MyFit Fitness Planner</h1>
            <p style={styles.heroSubtitle}>
              Transform your health with AI-powered personalized fitness plans
            </p>
            <p style={styles.heroDescription}>
              Get a customized workout routine, nutrition plan, and real-time coaching
            </p>
            <button
              onClick={() => navigate("/profile")}
              style={styles.heroButton}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-3px)";
                e.target.style.boxShadow = "0 15px 35px rgba(37, 99, 235, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 8px 16px rgba(37, 99, 235, 0.3)";
              }}
            >
              Start Your Journey →
            </button>
            <div style={styles.heroFeatures}>
              <div style={styles.feature}>
                <span style={styles.featureIcon}>✓</span>
                <span>Personalized Plans</span>
              </div>
              <div style={styles.feature}>
                <span style={styles.featureIcon}>✓</span>
                <span>AI Coach Support</span>
              </div>
              <div style={styles.feature}>
                <span style={styles.featureIcon}>✓</span>
                <span>Progress Tracking</span>
              </div>
            </div>
          </div>
          <div style={styles.heroIllustration}>
            <div style={styles.illustrationCircle}>🏋️</div>
          </div>
        </div>
      </div>
    );
  }

  const cardData = [
    {
      id: "goal",
      title: "🎯 Your Goal",
      value: plan.userSummary?.goal,
      description: "Primary fitness objective",
      color: "#fbbf24",
      route: null,
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    },
    {
      id: "bmi",
      title: "📊 Your BMI",
      value: plan.userSummary?.bmi,
      description: "Body Mass Index",
      color: "#ec4899",
      route: null,
      gradient: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
    },
    {
      id: "calories",
      title: "🔥 Daily Calories",
      value: plan.calories,
      description: "Target caloric intake",
      color: "#ef4444",
      route: null,
      gradient: "linear-gradient(135deg, #f87171 0%, #dc2626 100%)",
    },
    {
      id: "workout",
      title: "💪 Workout Plan",
      value: `${plan.workout?.length || 0} Days`,
      description: "Weekly training schedule",
      color: "#3b82f6",
      route: "/recommendation",
      gradient: "linear-gradient(135deg, #60a5fa 0%, #1d4ed8 100%)",
    },
    {
      id: "diet",
      title: "🍎 Diet Plan",
      value: "3 Meals",
      description: "Daily nutrition guide",
      color: "#10b981",
      route: "/recommendation",
      gradient: "linear-gradient(135deg, #34d399 0%, #059669 100%)",
    },
    {
      id: "condition",
      title: "🩺 Medical Condition",
      value: plan.userSummary?.medical_condition || "None",
      description: "Condition-aware guidance",
      color: "#fb7185",
      route: "/recommendation",
      gradient: "linear-gradient(135deg, #fb7185 0%, #f43f5e 100%)",
    },
    {
      id: "coach",
      title: "💬 AI Coach",
      value: "24/7",
      description: "Get instant guidance",
      color: "#8b5cf6",
      route: "/ai",
      gradient: "linear-gradient(135deg, #a78bfa 0%, #6d28d9 100%)",
    },
  ];

  return (
    <div>
      <Navbar />
      <div style={styles.mainContainer}>
        {/* Welcome Header */}
        <div style={styles.headerSection}>
          <div style={styles.greetingContainer}>
            <h1 style={styles.welcomeTitle}>
              {t("home.welcomeTitle")}
            </h1>
            <p style={styles.welcomeSubtitle}>
              {t("home.welcomeSubtitle")}
            </p>
          </div>

          {/* Quick Stats Bar */}
          <div style={styles.quickStatsBar}>
            <div style={styles.quickStat}>
              <span style={styles.quickStatLabel}>{t("home.statsHeight")}</span>
              <span style={styles.quickStatValue}>{plan.userSummary?.height} cm</span>
            </div>
            <div style={styles.divider}></div>
            <div style={styles.quickStat}>
              <span style={styles.quickStatLabel}>{t("home.statsWeight")}</span>
              <span style={styles.quickStatValue}>{plan.userSummary?.weight} kg</span>
            </div>
            <div style={styles.divider}></div>
            <div style={styles.quickStat}>
              <span style={styles.quickStatLabel}>{t("home.statsAge")}</span>
              <span style={styles.quickStatValue}>{plan.userSummary?.age}</span>
            </div>
          </div>
        </div>

        {plan.userSummary?.medical_condition && plan.userSummary?.medical_condition !== "None" && (
          <div style={styles.conditionBanner}>
            <h3 style={styles.conditionTitle}>{t("home.conditionBannerTitle", { condition: plan.userSummary.medical_condition })}</h3>
            <p style={styles.conditionDescription}>
              {t("home.conditionBannerText")}
            </p>
          </div>
        )}

        {/* Main Cards Grid */}
        <div style={styles.speechControlsContainer}>
          <button style={styles.speechButton} onClick={startReading}>
            Start Reading
          </button>
          <button style={styles.speechButton} onClick={pauseReading} disabled={!isSpeaking || isPaused}>
            Pause
          </button>
          <button style={styles.speechButton} onClick={resumeReading} disabled={!isPaused}>
            Resume
          </button>
          <button style={styles.speechButton} onClick={stopReading} disabled={!isSpeaking && !isPaused}>
            Stop
          </button>
        </div>
        <div style={styles.cardsSection}>
          <h2 style={styles.sectionTitle}>Your Plan Overview</h2>
          <div style={styles.cardGrid}>
            {cardData.map((card) => (
              <OverviewCard
                key={card.id}
                card={card}
                onHover={() => setHoveredCard(card.id)}
                onHoverEnd={() => setHoveredCard(null)}
                isHovered={hoveredCard === card.id}
                navigate={navigate}
              />
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div style={styles.statsSection}>
          <div style={styles.statBox}>
            <div style={styles.statBoxHeader}>
              <h3 style={styles.statBoxTitle}>BMI Analysis</h3>
              <span style={styles.statBoxIcon}>📈</span>
            </div>
            <p style={styles.statBoxContent}>{plan.bmiAnalysis}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actionSection}>
          <button
            onClick={() => navigate("/recommendation")}
            style={styles.primaryActionButton}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-3px)";
              e.target.style.boxShadow = "0 15px 35px rgba(37, 99, 235, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 8px 16px rgba(37, 99, 235, 0.2)";
            }}
          >
            📋 {t("home.viewPlan")}
          </button>
          <button
            onClick={() => navigate("/ai")}
            style={styles.secondaryActionButton}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-3px)";
              e.target.style.boxShadow = "0 15px 35px rgba(139, 92, 246, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 8px 16px rgba(139, 92, 246, 0.2)";
            }}
          >
            💬 {t("home.chatCoach")}
          </button>
          <button
            onClick={() => navigate("/profile")}
            style={styles.tertiaryActionButton}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-3px)";
              e.target.style.boxShadow = "0 15px 35px rgba(107, 114, 128, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 8px 16px rgba(107, 114, 128, 0.1)";
            }}
          >
            ⚙️ {t("home.updateProfile")}
          </button>
        </div>

        {/* Motivational Section */}
        <div style={styles.motivationalSection}>
          <div style={styles.motivationalCard}>
            <h3 style={styles.motivationalTitle}>{t("home.proTipTitle")}</h3>
            <p style={styles.motivationalText}>
              {t("home.proTipText")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Overview Card Component
function OverviewCard({ card, onHover, onHoverEnd, isHovered, navigate }) {
  return (
    <div
      style={{
        ...styles.card,
        ...(isHovered && styles.cardHovered),
        background: card.gradient,
      }}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      onClick={() => card.route && navigate(card.route)}
    >
      <div style={styles.cardInner}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>{card.title}</h3>
          {card.route && <span style={styles.cardArrow}>→</span>}
        </div>
        <p style={styles.cardValue}>{card.value}</p>
        <p style={styles.cardDescription}>{card.description}</p>
        {card.route && <p style={styles.cardClickHint}>Click to explore</p>}
      </div>
    </div>
  );
}

// Styles Object
const styles = {
  // Hero Section (No Plan)
  heroContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "60px 40px",
    minHeight: "80vh",
    gap: "60px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },

  heroContent: {
    flex: 1,
    animation: "slideInLeft 0.8s ease-out",
  },

  heroTitle: {
    fontSize: "48px",
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: "20px",
    lineHeight: "1.2",
  },

  heroSubtitle: {
    fontSize: "24px",
    color: "#2563eb",
    fontWeight: "600",
    marginBottom: "15px",
  },

  heroDescription: {
    fontSize: "16px",
    color: "#64748b",
    marginBottom: "30px",
    lineHeight: "1.6",
  },

  heroButton: {
    padding: "16px 40px",
    fontSize: "18px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    boxShadow: "0 8px 16px rgba(37, 99, 235, 0.3)",
    transition: "all 0.3s ease",
    marginBottom: "40px",
  },

  heroFeatures: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  feature: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "16px",
    color: "#475569",
    fontWeight: "500",
  },

  featureIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px",
    height: "28px",
    background: "#10b981",
    color: "#ffffff",
    borderRadius: "50%",
    fontWeight: "700",
    fontSize: "14px",
  },

  heroIllustration: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    animation: "slideInRight 0.8s ease-out",
  },

  illustrationCircle: {
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "120px",
    boxShadow: "0 20px 60px rgba(37, 99, 235, 0.3)",
  },

  // Main Container
  mainContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
  },

  headerSection: {
    marginBottom: "50px",
    animation: "fadeIn 0.6s ease-out",
  },

  greetingContainer: {
    marginBottom: "25px",
    padding: "28px 30px",
    background: "rgba(255, 255, 255, 0.92)",
    borderRadius: "24px",
    boxShadow: "0 20px 50px rgba(59, 130, 246, 0.08)",
    border: "1px solid rgba(59, 130, 246, 0.12)",
  },

  welcomeTitle: {
    fontSize: "38px",
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: "12px",
    lineHeight: "1.05",
  },

  welcomeSubtitle: {
    fontSize: "17px",
    color: "#475569",
    margin: 0,
    maxWidth: "720px",
    lineHeight: "1.7",
  },

  quickStatsBar: {
    display: "flex",
    alignItems: "center",
    gap: "30px",
    background: "#ffffff",
    padding: "25px 30px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
  },

  quickStat: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    flex: 1,
  },

  quickStatLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  quickStatValue: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
  },

  divider: {
    width: "1px",
    height: "40px",
    background: "#e2e8f0",
  },

  conditionBanner: {
    background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
    border: "1px solid #fcd34d",
    padding: "22px 26px",
    borderRadius: "16px",
    marginBottom: "30px",
    boxShadow: "0 6px 20px rgba(245, 158, 11, 0.12)",
  },

  conditionTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#92400e",
    margin: 0,
  },

  conditionDescription: {
    fontSize: "15px",
    color: "#92400e",
    marginTop: "10px",
    lineHeight: "1.7",
  },

  // Cards Section
  cardsSection: {
    marginBottom: "50px",
    padding: "0 10px",
  },

  sectionTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "20px",
    paddingBottom: "10px",
    borderBottom: "3px solid #2563eb",
    display: "inline-block",
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "15px",
  },

  card: {
    position: "relative",
    overflow: "hidden",
    padding: "20px",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    color: "#ffffff",
    minHeight: "160px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  cardHovered: {
    transform: "translateY(-6px)",
    boxShadow: "0 15px 30px rgba(0, 0, 0, 0.12)",
  },

  cardInner: {
    position: "relative",
    zIndex: 2,
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "10px",
  },

  cardTitle: {
    fontSize: "16px",
    fontWeight: "700",
    margin: 0,
    opacity: 0.95,
  },

  cardArrow: {
    fontSize: "20px",
    opacity: 0.8,
    transition: "transform 0.3s ease",
  },

  cardValue: {
    fontSize: "28px",
    fontWeight: "800",
    margin: "10px 0",
    opacity: 1,
  },

  cardDescription: {
    fontSize: "13px",
    opacity: 0.9,
    margin: "8px 0 0 0",
    fontWeight: "500",
  },

  cardClickHint: {
    fontSize: "11px",
    opacity: 0.7,
    marginTop: "8px",
    fontStyle: "italic",
  },

  // Stats Section
  statsSection: {
    marginBottom: "50px",
  },

  statBox: {
    background: "#ffffff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
  },

  statBoxHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },

  statBoxTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },

  statBoxIcon: {
    fontSize: "28px",
  },

  statBoxContent: {
    color: "#475569",
    lineHeight: "1.7",
    margin: 0,
    fontSize: "15px",
  },

  // Action Section
  speechControlsContainer: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: "30px",
    padding: "0 10px",
  },

  speechButton: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    minWidth: "90px",
    fontSize: "13px",
    transition: "all 0.2s ease",
  },

  actionSection: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    marginBottom: "50px",
    flexWrap: "wrap",
    padding: "0 10px",
  },

  primaryActionButton: {
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    boxShadow: "0 8px 16px rgba(37, 99, 235, 0.2)",
    transition: "all 0.3s ease",
    minWidth: "120px",
  },

  secondaryActionButton: {
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #a78bfa 0%, #6d28d9 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    boxShadow: "0 8px 16px rgba(139, 92, 246, 0.2)",
    transition: "all 0.3s ease",
    minWidth: "120px",
  },

  tertiaryActionButton: {
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: "700",
    background: "#ffffff",
    color: "#2563eb",
    border: "2px solid #2563eb",
    borderRadius: "8px",
    cursor: "pointer",
    boxShadow: "0 8px 16px rgba(107, 114, 128, 0.1)",
    transition: "all 0.3s ease",
    minWidth: "120px",
  },

  // Motivational Section
  motivationalSection: {
    textAlign: "center",
    marginTop: "40px",
    marginBottom: "20px",
  },

  motivationalCard: {
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    padding: "20px",
    borderRadius: "12px",
    color: "#ffffff",
    boxShadow: "0 8px 16px rgba(245, 158, 11, 0.2)",
    margin: "0 10px",
  },

  motivationalTitle: {
    fontSize: "22px",
    fontWeight: "700",
    marginBottom: "10px",
    margin: 0,
  },

  motivationalText: {
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "10px 0 0 0",
    opacity: 0.95,
  },
};

// CSS Animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-40px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(40px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  button {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 28px;
    }

    .heroContainer {
      padding: 40px 20px;
      gap: 30px;
    }

    .illustrationCircle {
      width: 200px !important;
      height: 200px !important;
      font-size: 80px !important;
    }

    .cardGrid {
      grid-template-columns: 1fr;
    }

    .quickStatsBar {
      gap: 20px;
    }

    .actionSection {
      flex-direction: column;
    }

    .actionSection button {
      width: 100%;
    }
  }
`;
if (typeof document !== "undefined") {
  document.head.appendChild(styleSheet);
}

export default Home;