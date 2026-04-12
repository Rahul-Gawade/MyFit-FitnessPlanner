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
      background: "linear-gradient(135deg, #eef2ff, #ffffff)",
      padding: "20px",
      fontFamily: "sans-serif",
    },

    image: {
      width: "120px",
      height: "120px",
      objectFit: "contain",
      marginBottom: "20px",
      borderRadius: "20px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    },

    title: {
      fontSize: "2.8rem",
      fontWeight: "bold",
      color: "#2563eb",
      marginBottom: "10px",
      letterSpacing: "1px",
    },

    text: {
      maxWidth: "500px",
      fontSize: "1.1rem",
      color: "#4b5563",
      lineHeight: "1.6",
      marginBottom: "30px",
    },
  };

  return (
    <div style={styles.container}>
      
      {/* Logo */}
      <img src={logo} alt="fitness" style={styles.image} />

      {/* App Name */}
      <h1 style={styles.title}>{t("landing.title")}</h1>

      {/* Description */}
      <p style={styles.text}>{t("landing.description")}</p>

      {/* Button */}
      <Button
        text={t("landing.getStarted")}
        onClick={() => navigate("/login")}   // ✅ fixed route
      />
    </div>
  );
}

export default Landing;