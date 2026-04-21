import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo.png";
import { Moon, Sun, CircleUser, Menu, X } from "lucide-react";

function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [hovered, setHovered] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = localStorage.getItem("isLoggedIn");

  const styles = {
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 20px",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      background: "var(--card-bg)",
      backdropFilter: "blur(14px)",
      borderBottom: "1px solid var(--card-border)",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
    },
    logoImg: {
      width: "40px",
      height: "40px",
      objectFit: "contain",
      borderRadius: "8px",
    },

    logoContainer: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      cursor: "pointer",
      zIndex: 1001,
    },

    logoText: {
      fontSize: "1.5rem",
      fontWeight: "800",
      color: "var(--food-primary)",
      letterSpacing: "-0.5px",
    },

    nav: {
      display: "flex",
      gap: "25px",
    },

    navLink: (path) => ({
      textDecoration: "none",
      color:
        location.pathname === path || hovered === path
          ? "var(--food-primary)"
          : "var(--text-secondary)",
      fontWeight: "600",
      transition: "0.3s",
      padding: "5px 0",
      borderBottom: location.pathname === path ? "2px solid var(--food-primary)" : "2px solid transparent",
    }),

    authButtons: {
      display: "flex",
      gap: "12px",
      alignItems: "center",
    },

    customDropdown: {
      position: "relative",
      display: "inline-block",
    },

    customDropdown: {
      position: "relative",
    },

    loginBtn: {
      padding: "8px 20px",
      borderRadius: "10px",
      border: "2px solid var(--food-primary)",
      background: "transparent",
      color: "var(--food-primary)",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },

    signupBtn: {
      padding: "8px 20px",
      borderRadius: "10px",
      border: "none",
      background: "var(--food-primary)",
      color: "var(--button-text)",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
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

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <header style={styles.header}>
      {/* Logo */}
      <div style={styles.logoContainer} className="hover-scale" onClick={() => navigate("/")}>
        <img src={logo} alt="MyFit Logo" style={styles.logoImg} />
        <span className="logo-text-header" style={styles.logoText}>MyFit</span>
      </div>

      {/* Navigation */}
      <nav style={styles.nav} className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <Link
          to="/home"
          style={styles.navLink("/home")}
          onMouseEnter={() => setHovered("/home")}
          onMouseLeave={() => setHovered("")}
          onClick={() => setMobileMenuOpen(false)}
        >
          {t("header.home")}
        </Link>

        <Link
          to="/bmi"
          style={styles.navLink("/bmi")}
          onMouseEnter={() => setHovered("/bmi")}
          onMouseLeave={() => setHovered("")}
          onClick={() => setMobileMenuOpen(false)}
        >
          {t("header.bmi")}
        </Link>

        <Link
          to="/recommendation"
          style={styles.navLink("/recommendation")}
          onMouseEnter={() => setHovered("/recommendation")}
          onMouseLeave={() => setHovered("")}
          onClick={() => setMobileMenuOpen(false)}
        >
          {t("header.recommendation")}
        </Link>

        <Link
          to="/health"
          style={styles.navLink("/health")}
          onMouseEnter={() => setHovered("/health")}
          onMouseLeave={() => setHovered("")}
          onClick={() => setMobileMenuOpen(false)}
        >
          {t("header.healthTracker")}
        </Link>

        <Link
          to="/ai"
          style={styles.navLink("/ai")}
          onMouseEnter={() => setHovered("/ai")}
          onMouseLeave={() => setHovered("")}
          onClick={() => setMobileMenuOpen(false)}
        >
          {t("header.aiCoach")}
        </Link>

        {isLoggedIn && (
          <Link
            to="/profile"
            style={styles.navLink("/profile")}
            onMouseEnter={() => setHovered("/profile")}
            onMouseLeave={() => setHovered("")}
            onClick={() => setMobileMenuOpen(false)}
          > <CircleUser size={26} color="var(--food-primary)" />
          </Link>
        )}
      </nav>

      {/* Auth Buttons */}
      <div className="header-actions">
        <button
          style={styles.themeToggle}
          onClick={toggleTheme}
          className="hover-glow"
          title={theme === "light" ? "Dark Mode" : "Light Mode"}
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <div style={styles.authGroup}>
          {!isLoggedIn ? (
            <div className="auth-group">
              <button
                style={styles.loginBtn}
                onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}
              >
                {t("header.login")}
              </button>

              <button
                style={styles.signupBtn}
                onClick={() => { navigate("/signup"); setMobileMenuOpen(false); }}
              >
                {t("header.signup")}
              </button>
            </div>
          ) : (
            <button style={styles.signupBtn} onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
              {t("header.logout")}
            </button>
          )}
        </div>

        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}

export default Header;