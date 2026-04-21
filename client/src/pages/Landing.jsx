import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo.png";
import { Zap, Brain, Globe, HeartPulse, Dumbbell, Apple, ChevronDown, Star } from "lucide-react";

function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [count, setCount] = useState({ users: 0, plans: 0, languages: 0 });

  // Animated counters
  useEffect(() => {
    const targets = { users: 5000, plans: 12000, languages: 3 };
    const duration = 1800;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      setCount({
        users: Math.round(targets.users * ease),
        plans: Math.round(targets.plans * ease),
        languages: Math.round(targets.languages * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, []);

  const features = [
    { icon: <Brain size={22} />, title: t("landing.feature1Title"), desc: t("landing.feature1Desc"), color: "#a78bfa" },
    { icon: <HeartPulse size={22} />, title: t("landing.feature2Title"), desc: t("landing.feature2Desc"), color: "#f87171" },
    { icon: <Dumbbell size={22} />, title: t("landing.feature3Title"), desc: t("landing.feature3Desc"), color: "#fb923c" },
    { icon: <Apple size={22} />, title: t("landing.feature4Title"), desc: t("landing.feature4Desc"), color: "#4ade80" },
    { icon: <Globe size={22} />, title: t("landing.feature5Title"), desc: t("landing.feature5Desc"), color: "#38bdf8" },
    { icon: <Zap size={22} />, title: t("landing.feature6Title"), desc: t("landing.feature6Desc"), color: "#fbbf24" },
  ];

  return (
    <div style={styles.page} className="page-enter">
      {/* Background Orbs */}
      <div style={styles.orb1} className="hero-glow-orb" />
      <div style={styles.orb2} className="hero-glow-orb" />
      <div style={styles.orb3} className="hero-glow-orb" />

      {/* Nav */}
      <nav style={styles.nav}>
        <div style={styles.navLogo}>
          <img src={logo} alt="MyFit" style={styles.navLogoImg} />
          <span style={styles.navLogoText}>MyFit</span>
        </div>
        <div style={styles.navButtons}>
          <button style={styles.navLoginBtn} onClick={() => navigate("/login")}>Login</button>
          <button style={styles.navSignupBtn} onClick={() => navigate("/signup")}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroBadge} className="animate-slide-up stagger-1">
          <Star size={14} fill="#fbbf24" color="#fbbf24" />
          <span>{t("landing.badge")}</span>
        </div>

        <h1 style={styles.heroTitle} className="animate-slide-up stagger-2">
          {t("landing.heroTitle1")}<br />
          <span style={styles.heroGradientText}>{t("landing.heroTitleHighlight")}</span><br />
          {t("landing.heroTitle2")}
        </h1>

        <p style={styles.heroSubtitle} className="animate-slide-up stagger-3">
          {t("landing.heroSubtitle")}
        </p>

        <div style={styles.heroActions} className="animate-slide-up stagger-4">
          <button
            style={styles.primaryCTA}
            onClick={() => navigate("/signup")}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(255,107,107,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(255,107,107,0.3)"; }}
          >
            {t("landing.primaryCTA")}
          </button>
          <button
            style={styles.secondaryCTA}
            onClick={() => navigate("/login")}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,107,107,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            {t("landing.secondaryCTA")}
          </button>
        </div>

        {/* Stats Pills */}
        <div style={styles.statsPills} className="animate-slide-up stagger-5">
          <div style={styles.pill}>
            <span style={styles.pillNumber}>{count.users.toLocaleString()}+</span>
            <span style={styles.pillLabel}>{t("landing.statUsers")}</span>
          </div>
          <div style={styles.pillDivider} />
          <div style={styles.pill}>
            <span style={styles.pillNumber}>{count.plans.toLocaleString()}+</span>
            <span style={styles.pillLabel}>{t("landing.statPlans")}</span>
          </div>
          <div style={styles.pillDivider} />
          <div style={styles.pill}>
            <span style={styles.pillNumber}>{count.languages}</span>
            <span style={styles.pillLabel}>{t("landing.statLanguages")}</span>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section style={styles.featuresSection}>
        <h2 style={styles.featuresTitle}>{t("landing.featuresTitle")}</h2>
        <div style={styles.featuresGrid}>
          {features.map((f, i) => (
            <div
              key={i}
              style={styles.featureCard}
              className={`animate-slide-up stagger-${Math.min(i + 1, 5)}`}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = `0 20px 40px ${f.color}22`; e.currentTarget.style.borderColor = f.color + "55"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"; e.currentTarget.style.borderColor = "var(--card-border)"; }}
            >
              <div style={{ ...styles.featureIcon, background: f.color + "18", color: f.color }}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Scroll hint */}
      <div style={styles.scrollHint} className="scroll-hint">
        <ChevronDown size={24} color="var(--text-secondary)" />
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, var(--bg-start) 0%, var(--bg-mid) 60%, var(--bg-end) 100%)",
    fontFamily: "var(--font-sans)",
    position: "relative",
    overflowX: "hidden",
    maxWidth: "100%",
    width: "100%",
  },
  // Ambient orbs
  orb1: {
    position: "fixed", width: "500px", height: "500px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,107,107,0.12) 0%, transparent 70%)",
    top: "-200px", right: "-100px", pointerEvents: "none",
    willChange: "transform", backfaceVisibility: "hidden",
  },
  orb2: {
    position: "fixed", width: "400px", height: "400px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(76,209,55,0.08) 0%, transparent 70%)",
    bottom: "100px", left: "-150px", pointerEvents: "none",
    willChange: "transform", backfaceVisibility: "hidden",
  },
  orb3: {
    position: "fixed", width: "300px", height: "300px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(251,188,36,0.08) 0%, transparent 70%)",
    top: "40%", left: "40%", pointerEvents: "none",
    willChange: "transform", backfaceVisibility: "hidden",
  },
  // Nav
  nav: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 32px", position: "sticky", top: 0, zIndex: 100,
    background: "var(--card-bg)", backdropFilter: "blur(16px)",
    borderBottom: "1px solid var(--card-border)",
  },
  navLogo: { display: "flex", alignItems: "center", gap: "10px" },
  navLogoImg: { width: "36px", height: "36px", borderRadius: "8px" },
  navLogoText: { fontWeight: "800", fontSize: "1.3rem", color: "var(--food-primary)" },
  navButtons: { display: "flex", gap: "12px" },
  navLoginBtn: {
    padding: "8px 20px", borderRadius: "10px", border: "2px solid var(--food-primary)",
    background: "transparent", color: "var(--food-primary)", fontWeight: "600",
    cursor: "pointer", transition: "all 0.2s",
  },
  navSignupBtn: {
    padding: "8px 20px", borderRadius: "10px", border: "none",
    background: "var(--food-primary)", color: "#fff", fontWeight: "700",
    cursor: "pointer", boxShadow: "0 4px 12px rgba(255,107,107,0.3)", transition: "all 0.2s",
  },
  // Hero
  hero: {
    maxWidth: "780px", margin: "0 auto", padding: "80px 24px 60px",
    textAlign: "center", position: "relative",
  },
  heroBadge: {
    display: "inline-flex", alignItems: "center", gap: "6px",
    padding: "6px 16px", borderRadius: "100px",
    background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)",
    color: "#d97706", fontWeight: "600", fontSize: "13px", marginBottom: "24px",
  },
  heroTitle: {
    fontSize: "clamp(2.2rem, 7vw, 4rem)", fontWeight: "900", lineHeight: "1.1",
    color: "var(--text-primary)", marginBottom: "24px", letterSpacing: "-1.5px",
  },
  heroGradientText: {
    background: "linear-gradient(135deg, #ff6b6b 0%, #ff9f43 50%, #ffd32a 100%)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroSubtitle: {
    fontSize: "clamp(1rem, 2.5vw, 1.2rem)", color: "var(--text-secondary)",
    lineHeight: "1.7", maxWidth: "580px", margin: "0 auto 36px", fontWeight: "500",
  },
  heroActions: { display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap", marginBottom: "48px" },
  primaryCTA: {
    padding: "16px 32px", borderRadius: "14px", border: "none",
    background: "linear-gradient(135deg, #ff6b6b 0%, #ff9f43 100%)",
    color: "#fff", fontWeight: "800", fontSize: "1.05rem",
    cursor: "pointer", boxShadow: "0 8px 24px rgba(255,107,107,0.3)",
    transition: "all 0.3s ease",
  },
  secondaryCTA: {
    padding: "16px 28px", borderRadius: "14px", border: "2px solid var(--card-border)",
    background: "transparent", color: "var(--text-primary)", fontWeight: "600",
    fontSize: "1rem", cursor: "pointer", transition: "all 0.2s",
  },
  // Stats pills
  statsPills: {
    display: "flex", alignItems: "center", gap: "0",
    background: "var(--card-bg)", border: "1px solid var(--card-border)",
    borderRadius: "20px", padding: "16px 20px",
    backdropFilter: "blur(12px)", boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
    flexWrap: "wrap", justifyContent: "center",
    maxWidth: "100%", margin: "0 auto",
  },
  pill: { textAlign: "center", padding: "8px 16px" },
  pillNumber: { display: "block", fontSize: "1.4rem", fontWeight: "800", color: "var(--food-primary)" },
  pillLabel: { display: "block", fontSize: "11px", color: "var(--text-secondary)", fontWeight: "600", marginTop: "2px" },
  pillDivider: { width: "1px", height: "30px", background: "var(--card-border)", margin: "0 10px" },
  // Features
  featuresSection: {
    maxWidth: "1100px", margin: "0 auto", padding: "20px 24px 80px",
  },
  featuresTitle: {
    textAlign: "center", fontSize: "clamp(1.4rem, 4vw, 2rem)",
    fontWeight: "800", color: "var(--text-primary)", marginBottom: "40px",
  },
  featuresGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "16px",
  },
  featureCard: {
    padding: "24px 20px", background: "var(--card-bg)", borderRadius: "20px",
    border: "1px solid var(--card-border)", backdropFilter: "blur(12px)",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)", transition: "all 0.3s ease",
    textAlign: "center",
    willChange: "transform, box-shadow",
  },
  featureIcon: {
    width: "48px", height: "48px", borderRadius: "14px",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 14px",
  },
  featureTitle: { fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" },
  featureDesc: { fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" },
  // Scroll hint
  scrollHint: {
    display: "flex", justifyContent: "center", paddingBottom: "24px",
  },
};

export default Landing;