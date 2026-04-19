import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo.png";
import { Moon, Sun, CircleUser, Menu, X } from "lucide-react";

function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [hovered, setHovered] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const languages = [
    { code: "en", label: "EN" },
    { code: "hi", label: "HI" },
    { code: "mr", label: "MR" }
  ];

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

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

    dropdownBtn: {
      padding: "8px 14px",
      borderRadius: "10px",
      border: "1px solid var(--card-border)",
      background: "var(--card-bg)",
      color: "var(--text-primary)",
      fontWeight: "700",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "4px",
      minWidth: "65px",
      justifyContent: "center",
      transition: "all 0.3s ease",
    },

    dropdownMenu: {
      position: "absolute",
      top: "110%",
      right: 0,
      background: "var(--card-bg)",
      backdropFilter: "blur(20px)",
      borderRadius: "12px",
      border: "1px solid var(--card-border)",
      boxShadow: "var(--shadow-hover)",
      padding: "6px",
      display: langDropdownOpen ? "flex" : "none",
      flexDirection: "column",
      gap: "4px",
      zIndex: 2000,
      minWidth: "80px",
    },

    dropdownItem: {
      padding: "8px 12px",
      borderRadius: "8px",
      cursor: "pointer",
      color: "var(--text-primary)",
      fontWeight: "600",
      transition: "background 0.2s ease",
      textAlign: "center",
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
          onClick={toggleTheme}
          title="Toggle Theme"
          className="theme-toggle"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Premium Custom Language Dropdown */}
        <div style={styles.customDropdown} className="language-select-header">
          <button
            style={styles.dropdownBtn}
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="hover-glow"
          >
            {currentLang.label} ▾
          </button>
          <div style={styles.dropdownMenu} className="animate-scale-in">
            {languages.map((lang) => (
              <div
                key={lang.code}
                style={{
                  ...styles.dropdownItem,
                  background: i18n.language === lang.code ? "rgba(255, 107, 107, 0.1)" : "transparent",
                  color: i18n.language === lang.code ? "var(--food-primary)" : "var(--text-primary)",
                }}
                onClick={() => {
                  changeLanguage(lang.code);
                  setLangDropdownOpen(false);
                }}
                className="hover-lift"
              >
                {lang.label}
              </div>
            ))}
          </div>
        </div>

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