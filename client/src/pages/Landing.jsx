import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo.png";          // ✅ correct path
import Button from "../components/Button";      // ✅ correct path

function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const styles = {
    container: {
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      background: "linear-gradient(135deg, var(--bg-start), var(--bg-mid), var(--bg-end))",
      padding: "20px",
      fontFamily: "var(--font-sans)",
    },

    image: {
      width: "140px",
      height: "140px",
      objectFit: "contain",
      marginBottom: "25px",
      borderRadius: "28px",
      boxShadow: "0 15px 35px rgba(255, 107, 107, 0.15)",
      background: "#fff",
      padding: "10px",
    },

    title: {
      fontSize: "3.2rem",
      fontWeight: "800",
      color: "var(--food-primary)",
      marginBottom: "15px",
      letterSpacing: "-1px",
    },

    text: {
      maxWidth: "550px",
      fontSize: "1.2rem",
      color: "var(--text-secondary)",
      lineHeight: "1.7",
      marginBottom: "35px",
      fontWeight: "500",
    },
  };

  return (
    <div style={styles.container} className="animate-bg-shift">
      
      {/* Logo */}
      <img src={logo} alt="fitness" style={styles.image} className="animate-float" />

      {/* App Name */}
      <h1 style={styles.title} className="animate-slide-up stagger-1">{t("landing.title")}</h1>

      {/* Description */}
      <p style={styles.text} className="animate-slide-up stagger-2">{t("landing.description")}</p>

      {/* Button */}
      <div className="animate-slide-up stagger-3">
        <Button
          text={t("landing.getStarted")}
          onClick={() => navigate("/login")}   // ✅ fixed route
        />
      </div>
    </div>
  );
}

export default Landing;