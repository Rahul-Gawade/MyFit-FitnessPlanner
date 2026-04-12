import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [hovered, setHovered] = useState("");

  const isLoggedIn = localStorage.getItem("isLoggedIn");

  const styles = {
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "18px 40px",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      background: "rgba(255, 255, 255, 0.82)",
      backdropFilter: "blur(14px)",
      borderBottom: "1px solid rgba(56, 189, 248, 0.18)",
      boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)",
    },

    logo: {
      fontSize: "1.6rem",
      fontWeight: "bold",
      color: "#2563eb",
      cursor: "pointer",
    },

    nav: {
      display: "flex",
      gap: "25px",
    },

    navLink: (path) => ({
      textDecoration: "none",
      color:
        location.pathname === path || hovered === path
          ? "#2563eb"
          : "#374151",
      fontWeight: "500",
      transition: "0.3s",
    }),

    authButtons: {
      display: "flex",
      gap: "10px",
      alignItems: "center",
    },

    languageSelect: {
      padding: "8px 10px",
      borderRadius: "8px",
      border: "1px solid rgba(37, 99, 235, 0.25)",
      background: "rgba(255, 255, 255, 0.95)",
      color: "#1f2937",
      cursor: "pointer",
    },

    loginBtn: {
      padding: "8px 18px",
      borderRadius: "8px",
      border: "1px solid #2563eb",
      background: "transparent",
      color: "#2563eb",
      cursor: "pointer",
    },

    signupBtn: {
      padding: "8px 18px",
      borderRadius: "8px",
      border: "none",
      background: "#2563eb",
      color: "#fff",
      cursor: "pointer",
    },
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    localStorage.setItem("appLanguage", language);
  };

  return (
    <header style={styles.header}>
      {/* Logo */}
      <div style={styles.logo} onClick={() => navigate("/")}>
        MyFit
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        <Link
          to="/home"
          style={styles.navLink("/home")}
          onMouseEnter={() => setHovered("/home")}
          onMouseLeave={() => setHovered("")}
        >
          {t("header.home")}
        </Link>

        <Link
          to="/bmi"
          style={styles.navLink("/bmi")}
          onMouseEnter={() => setHovered("/bmi")}
          onMouseLeave={() => setHovered("")}
        >
          {t("header.bmi")}
        </Link>

        <Link
          to="/recommendation"
          style={styles.navLink("/recommendation")}
          onMouseEnter={() => setHovered("/recommendation")}
          onMouseLeave={() => setHovered("")}
        >
          {t("header.recommendation")}
        </Link>

        <Link
          to="/health"
          style={styles.navLink("/health")}
          onMouseEnter={() => setHovered("/health")}
          onMouseLeave={() => setHovered("")}
        >
          {t("header.healthTracker")}
        </Link>

        <Link
          to="/ai"
          style={styles.navLink("/ai")}
          onMouseEnter={() => setHovered("/ai")}
          onMouseLeave={() => setHovered("")}
        >
          {t("header.aiCoach")}
        </Link>

        {isLoggedIn && (
          <Link
            to="/profile"
            style={styles.navLink("/profile")}
            onMouseEnter={() => setHovered("/profile")}
            onMouseLeave={() => setHovered("")}
          >
            {t("header.profile")}
          </Link>
        )}
      </nav>

      {/* Auth Buttons */}
      <div style={styles.authButtons}>
        <select
          value={i18n.language}
          onChange={(e) => changeLanguage(e.target.value)}
          style={styles.languageSelect}
        >
          <option value="en">EN</option>
          <option value="hi">HI</option>
          <option value="mr">MR</option>
        </select>

        {!isLoggedIn ? (
          <>
            <button
              style={styles.loginBtn}
              onClick={() => navigate("/login")}
            >
              {t("header.login")}
            </button>

            <button
              style={styles.signupBtn}
              onClick={() => navigate("/signup")}
            >
              {t("header.signup")}
            </button>
          </>
        ) : (
          <button style={styles.signupBtn} onClick={handleLogout}>
            {t("header.logout")}
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;