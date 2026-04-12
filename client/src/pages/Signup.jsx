import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ get existing user (ONLY this is parsed)
    const existingUser = JSON.parse(localStorage.getItem("user") || "null");
``

    // ❌ if user exists
    if (existingUser && existingUser.email === data.email) {
      setError(t("signup.userExists"));
      return;
    }

    // ❌ validation
    if (data.password.length < 6) {
      setError(t("signup.passwordMin"));
      return;
    }

    // ✅ save user
    localStorage.setItem("user", JSON.stringify(data));

    // ✅ login flag (STRING ONLY)
    localStorage.setItem("isLoggedIn", "true");

    setError("");
    navigate("/profile");
  };

  const styles = {
    container: {
      minHeight: "100vh",
      paddingTop: "80px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #eef2ff, #ffffff)",
    },
    card: {
      width: "350px",
      padding: "30px",
      borderRadius: "16px",
      background: "#fff",
      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
      textAlign: "center",
    },
    input: {
      width: "100%",
      padding: "12px",
      margin: "10px 0",
      borderRadius: "8px",
      border: "1px solid #ccc",
    },
    button: {
      width: "100%",
      padding: "12px",
      marginTop: "15px",
      borderRadius: "10px",
      border: "none",
      background: "#2563eb",
      color: "#fff",
      cursor: "pointer",
    },
    error: {
      color: "red",
      marginTop: "10px",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>{t("signup.title")}</h2>

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder={t("signup.name")}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <input
            name="email"
            placeholder={t("signup.email")}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <input
            type="password"
            name="password"
            placeholder={t("signup.password")}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <button style={styles.button}>{t("signup.signUpButton")}</button>
        </form>

        {error && <p style={styles.error}>{error}</p>}

        <p>
          {t("signup.loginPrompt")} <Link to="/login">{t("signup.loginLink")}</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;