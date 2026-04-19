import { useContext, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Target, Activity, Flame, Dumbbell, Apple, Stethoscope, MessageSquare, Check, TrendingUp, ClipboardList, Settings, Droplets, Plus } from "lucide-react";
import { AppContext } from "../context/AppContext";
import Navbar from "../components/Header";

function Home() {
  const { t, i18n } = useTranslation();
  const { plan, waterIntake, addWater } = useContext(AppContext);
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const speechUtteranceRef = useRef(null);
  
  // cancel ongoing speech on unmount
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

  const handleAddWater = (amount) => {
    addWater(amount);
  };

  const waterGoal = 3000;
  const waterProgress = Math.min((waterIntake / waterGoal) * 100, 100);

  if (!plan) {
    return (
      <div>
        <Navbar />
        <div style={styles.heroContainer} className="animate-bg-shift">
          <div style={styles.heroContent} className="animate-slide-up stagger-1">
            <h1 style={styles.heroTitle}>MyFit Fitness Planner</h1>
            <p style={styles.heroSubtitle}>
              {t("common.heroSubtitle") || "Transform your health with AI-powered personalized fitness plans"}
            </p>
            <p style={styles.heroDescription}>
              {t("common.heroDescription") || "Get a customized workout routine, nutrition plan, and real-time coaching"}
            </p>
            <button
              onClick={() => navigate("/profile")}
              style={styles.heroButton}
            >
              Start Your Journey →
            </button>
            <div style={styles.heroFeatures}>
              <div style={styles.feature}>
                <span style={styles.featureIcon}><Check size={16} /></span>
                <span>Personalized Plans</span>
              </div>
              <div style={styles.feature}>
                <span style={styles.featureIcon}><Check size={16} /></span>
                <span>AI Coach Support</span>
              </div>
              <div style={styles.feature}>
                <span style={styles.featureIcon}><Check size={16} /></span>
                <span>Progress Tracking</span>
              </div>
            </div>
          </div>
          <div style={styles.heroIllustration} className="animate-scale-in stagger-3">
            <div style={styles.illustrationCircle} className="animate-float">
              <Dumbbell size={100} color="#ffffff" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const cardData = [
    {
      id: "goal",
      title: "Your Goal",
      icon: <Target size={22} />,
      value: plan.userSummary?.goal,
      description: "Primary fitness objective",
      color: "#ff6b6b",
      route: null,
      gradient: "linear-gradient(135deg, #ff9f43 0%, #ff6b6b 100%)",
    },
    {
      id: "bmi",
      title: "Your BMI",
      icon: <Activity size={22} />,
      value: plan.userSummary?.bmi,
      description: "Body Mass Index",
      color: "#1dd1a1",
      route: null,
      gradient: "linear-gradient(135deg, #1dd1a1 0%, #10ac84 100%)",
    },
    {
      id: "calories",
      title: "Daily Calories",
      icon: <Flame size={22} />,
      value: plan.calories,
      description: "Target caloric intake",
      color: "#ee5253",
      route: null,
      gradient: "linear-gradient(135deg, #ff6b6b 0%, #ee5253 100%)",
    },
    {
      id: "workout",
      title: "Workout Plan",
      icon: <Dumbbell size={22} />,
      value: Array.isArray(plan.workout) 
        ? `${plan.workout.length} Days` 
        : typeof plan.workout === 'string' 
          ? `${plan.workout.split('\n').filter(l => l.trim()).length} Days` 
          : "---",
      description: "Weekly training schedule",
      color: "#feca57",
      route: "/recommendation",
      gradient: "linear-gradient(135deg, #feca57 0%, #ff9f43 100%)",
    },
    {
      id: "diet",
      title: "Diet Plan",
      icon: <Apple size={22} />,
      value: "3 Meals",
      description: "Daily nutrition guide",
      color: "#10ac84",
      route: "/recommendation",
      gradient: "linear-gradient(135deg, #48dbfb 0%, #0abde3 100%)",
    },
    {
      id: "condition",
      title: "Medical Condition",
      icon: <Stethoscope size={22} />,
      value: plan.userSummary?.medical_condition || "None",
      description: "Condition-aware guidance",
      color: "#f368e0",
      route: "/recommendation",
      gradient: "linear-gradient(135deg, #ff9ff3 0%, #f368e0 100%)",
    },
    {
      id: "coach",
      title: "AI Coach",
      icon: <MessageSquare size={22} />,
      value: "24/7",
      description: "Get instant guidance",
      color: "#5f27cd",
      route: "/ai",
      gradient: "linear-gradient(135deg, #5f27cd 0%, #341f97 100%)",
    },
  ];

  return (
    <div>
      <Navbar />
      <div style={styles.mainContainer}>
        {/* Welcome Header */}
        <div style={styles.headerSection}>
          <div style={styles.greetingContainer}>
            <h1 style={styles.welcomeTitle}>{t("home.welcomeTitle")}</h1>
            <p style={styles.welcomeSubtitle}>{t("home.welcomeSubtitle")}</p>
          </div>

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
            <p style={styles.conditionDescription}>{t("home.conditionBannerText")}</p>
          </div>
        )}

        {/* Daily Wellness Section */}
        <div style={styles.wellnessSection}>
          <h2 style={styles.sectionTitle}>Daily Wellness</h2>
          <div style={styles.wellnessGrid}>
            <div style={styles.waterCard}>
              <div style={styles.waterInfo}>
                <div style={styles.waterIconBox}><Droplets size={28} color="#3b82f6" /></div>
                <div>
                  <h3 style={styles.wellnessCardTitle}>Hydration</h3>
                  <p style={styles.wellnessCardValue}>{waterIntake} / {waterGoal} ml</p>
                </div>
              </div>
              <div style={styles.progressContainer}>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: `${waterProgress}%` }} />
                </div>
              </div>
              <div style={styles.waterActions}>
                {[250, 500].map(amount => (
                  <button key={amount} onClick={() => handleAddWater(amount)} style={styles.addWaterBtn}>
                    <Plus size={14} /> {amount}ml
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.quickLogCard} onClick={() => navigate("/health")}>
               <div style={{...styles.waterIconBox, backgroundColor: '#fee2e2'}}><Activity size={28} color="#ef4444" /></div>
                <div>
                  <h3 style={styles.wellnessCardTitle}>Quick Log</h3>
                  <p style={styles.wellnessCardValue}>Health Tracker</p>
                </div>
            </div>
          </div>
        </div>

        {/* Speech Controls */}
        <div style={styles.speechControlsContainer}>
          <button style={styles.speechButton} onClick={startReading}>Start Reading</button>
          <button style={styles.speechButton} onClick={pauseReading} disabled={!isSpeaking || isPaused}>Pause</button>
          <button style={styles.speechButton} onClick={resumeReading} disabled={!isPaused}>Resume</button>
          <button style={styles.speechButton} onClick={stopReading} disabled={!isSpeaking && !isPaused}>Stop</button>
        </div>

        {/* Plan Overview */}
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
              <TrendingUp size={24} color="var(--food-primary)" />
            </div>
            <p style={styles.statBoxContent}>{plan.bmiAnalysis}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actionSection}>
          <button onClick={() => navigate("/recommendation")} style={styles.primaryActionButton}>
            <ClipboardList size={18} style={{ marginRight: '8px' }} /> {t("home.viewPlan")}
          </button>
          <button onClick={() => navigate("/ai")} style={styles.secondaryActionButton}>
            <MessageSquare size={18} style={{ marginRight: '8px' }} /> {t("home.chatCoach")}
          </button>
        </div>
      </div>
    </div>
  );
}

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
          <h3 style={styles.cardTitle}>
            <span style={{ marginRight: '8px', verticalAlign: 'middle' }}>{card.icon}</span>
            <span style={{ verticalAlign: 'middle' }}>{card.title}</span>
          </h3>
          {card.route && <span style={styles.cardArrow}>→</span>}
        </div>
        <p style={styles.cardValue}>{card.value}</p>
        <p style={styles.cardDescription}>{card.description}</p>
      </div>
    </div>
  );
}

const styles = {
  heroContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "clamp(40px, 10vw, 80px) 20px",
    minHeight: "clamp(60vh, 80vh, 90vh)",
    flexWrap: "wrap",
    gap: "40px"
  },
  heroContent: {
    flex: "1 1 min(100%, 500px)",
  },
  heroTitle: {
    fontSize: "clamp(2.2rem, 8vw, 3.5rem)",
    fontWeight: "800",
    color: "var(--food-primary)",
    marginBottom: "15px",
    lineHeight: "1.1"
  },
  heroSubtitle: {
    fontSize: "clamp(1.1rem, 4vw, 1.5rem)",
    fontWeight: "600",
    color: "var(--text-primary)",
    marginBottom: "20px"
  },
  heroDescription: {
    fontSize: "clamp(0.95rem, 3vw, 1.1rem)",
    color: "var(--text-secondary)",
    lineHeight: "1.6",
    marginBottom: "35px",
    maxWidth: "480px"
  },
  heroButton: {
    padding: "16px 32px",
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "var(--button-text)",
    background: "var(--food-primary)",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(255, 107, 107, 0.3)",
    transition: "all 0.3s ease",
    marginBottom: "40px",
    width: "fit-content"
  },
  heroFeatures: {
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },
  feature: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "clamp(0.9rem, 2.5vw, 1.05rem)",
    fontWeight: "500",
    color: "var(--text-primary)"
  },
  featureIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "rgba(255, 107, 107, 0.1)",
    color: "var(--food-primary)"
  },
  heroIllustration: {
    flex: "1 1 min(100%, 400px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  illustrationCircle: {
    width: "clamp(200px, 40vw, 300px)",
    height: "clamp(200px, 40vw, 300px)",
    borderRadius: "50%",
    background: "linear-gradient(135deg, var(--food-primary) 0%, var(--food-secondary) 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 20px 50px rgba(255, 107, 107, 0.2)"
  },
  mainContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "clamp(20px, 5vw, 40px) 20px",
    fontFamily: "var(--font-sans)",
  },
  headerSection: { 
    marginBottom: "40px",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  greetingContainer: {
    padding: "clamp(16px, 4vw, 24px)",
    background: "var(--card-bg)",
    borderRadius: "20px",
    border: "1px solid var(--card-border)",
  },
  welcomeTitle: { fontSize: "clamp(1.5rem, 6vw, 2rem)", fontWeight: "800", marginBottom: "10px" },
  welcomeSubtitle: { color: "var(--text-secondary)", fontSize: "clamp(0.9rem, 2.5vw, 1rem)" },
  quickStatsBar: {
    display: "flex",
    gap: "10px",
    padding: "clamp(12px, 3vw, 20px)",
    background: "var(--card-bg)",
    borderRadius: "16px",
    border: "1px solid var(--card-border)",
    flexWrap: "wrap"
  },
  quickStat: { 
    flex: "1 1 100px",
    textAlign: "center"
  },
  quickStatLabel: { fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)" },
  quickStatValue: { fontSize: "18px", fontWeight: "700" },
  divider: { width: "1px", background: "var(--card-border)" },
  conditionBanner: {
    padding: "20px",
    background: "rgba(245, 158, 11, 0.1)",
    borderLeft: "4px solid #f59e0b",
    borderRadius: "8px",
    marginBottom: "30px"
  },
  conditionTitle: { color: "#d97706", margin: 0, fontSize: "18px" },
  conditionDescription: { color: "#92400e", fontSize: "14px", marginTop: "5px" },
  wellnessSection: { marginBottom: "40px" },
  sectionTitle: { fontSize: "22px", fontWeight: "700", marginBottom: "20px", borderBottom: "3px solid var(--food-primary)", display: "inline-block" },
  wellnessGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: "20px" },
  waterCard: {
    padding: "clamp(16px, 4vw, 24px)",
    background: "var(--card-bg)",
    borderRadius: "20px",
    border: "1px solid var(--card-border)",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
  },
  waterInfo: { display: "flex", gap: "15px", alignItems: "center", marginBottom: "20px" },
  waterIconBox: { width: "50px", height: "50px", borderRadius: "12px", background: "rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" },
  wellnessCardTitle: { margin: 0, fontSize: "clamp(1rem, 3vw, 1.125rem)", fontWeight: "700" },
  wellnessCardValue: { margin: "5px 0 0", color: "var(--text-secondary)", fontSize: "clamp(0.8rem, 2vw, 0.9rem)" },
  progressContainer: { height: "12px", background: "#e5e7eb", borderRadius: "6px", marginBottom: "20px", overflow: "hidden" },
  progressBar: { height: "100%", width: "100%" },
  progressFill: { height: "100%", background: "linear-gradient(90deg, #3b82f6, #60a5fa)", transition: "width 0.5s ease" },
  waterActions: { display: "flex", gap: "10px", flexWrap: "wrap" },
  addWaterBtn: { flex: "1 1 80px", padding: "10px", borderRadius: "10px", border: "1px solid #3b82f6", background: "transparent", color: "#3b82f6", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" },
  quickLogCard: { padding: "clamp(16px, 4vw, 24px)", background: "var(--card-bg)", borderRadius: "20px", border: "1px solid var(--card-border)", display: "flex", gap: "15px", alignItems: "center", cursor: "pointer" },
  cardsSection: { marginBottom: "40px" },
  cardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: "20px" },
  card: { padding: "clamp(16px, 4vw, 24px)", borderRadius: "20px", color: "#fff", cursor: "pointer", minHeight: "160px", transition: "all 0.3s ease" },
  cardHovered: { transform: "translateY(-5px)", boxShadow: "0 10px 25px rgba(0,0,0,0.15)" },
  cardHeader: { display: "flex", justifyContent: "space-between", marginBottom: "15px" },
  cardTitle: { fontSize: "clamp(1rem, 3vw, 1.125rem)", fontWeight: "700", margin: 0 },
  cardValue: { fontSize: "clamp(1.5rem, 5vw, 1.75rem)", fontWeight: "800", margin: "10px 0" },
  cardDescription: { fontSize: "clamp(0.75rem, 2vw, 0.825rem)", opacity: 0.9 },
  statsSection: { marginBottom: "40px" },
  statBox: { padding: "clamp(16px, 4vw, 24px)", background: "var(--card-bg)", borderRadius: "20px", border: "1px solid var(--card-border)" },
  statBoxHeader: { display: "flex", justifyContent: "space-between", marginBottom: "15px" },
  statBoxTitle: { fontSize: "clamp(1rem, 3vw, 1.125rem)", fontWeight: "700" },
  statBoxContent: { color: "var(--text-secondary)", lineHeight: "1.6", fontSize: "clamp(0.9rem, 2.5vw, 1rem)" },
  actionSection: { display: "flex", gap: "15px", flexWrap: "wrap" },
  primaryActionButton: { flex: "1 1 200px", padding: "14px 28px", borderRadius: "12px", background: "var(--food-primary)", color: "#fff", border: "none", fontWeight: "700", cursor: "pointer" },
  secondaryActionButton: { flex: "1 1 200px", padding: "14px 28px", borderRadius: "12px", background: "var(--food-secondary)", color: "#fff", border: "none", fontWeight: "700", cursor: "pointer" },
  speechControlsContainer: { display: "flex", gap: "10px", marginBottom: "30px", flexWrap: "wrap" },
  speechButton: { flex: "1 1 100px", padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--card-border)", background: "var(--card-bg)", cursor: "pointer" },
};

export default Home;