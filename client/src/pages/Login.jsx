import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    // ✅ safe parse (prevents crash)
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");

    if (!savedUser) {
      setError(t("login.noAccount"));
      setLoading(false);
      return;
    }

    // ✅ trim input (important)
    const email = data.email.trim();
    const password = data.password.trim();

    if (!email || !password) {
      setError(t("login.fillAll"));
      setLoading(false);
      return;
    }

    if (
      savedUser.email !== email ||
      savedUser.password !== password
    ) {
      setError(t("login.invalidCredentials"));
      setLoading(false);
      return;
    }

    // ✅ login success
    localStorage.setItem("isLoggedIn", "true");

    setLoading(false);
    navigate("/home");
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
      background: loading ? "#9ca3af" : "#2563eb",
      color: "#fff",
      cursor: loading ? "not-allowed" : "pointer",
    },
    error: {
      color: "red",
      marginTop: "10px",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>{t("login.title")}</h2>

        <form onSubmit={handleSubmit}>
          <input
            name="email"
            placeholder={t("login.email")}
            value={data.email}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <input
            type="password"
            name="password"
            placeholder={t("login.password")}
            value={data.password}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <button style={styles.button} disabled={loading}>
            {loading ? t("login.loggingIn") : t("login.loginButton")}
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}

        <p>
          {t("login.signupPrompt")} <Link to="/signup">{t("login.signupLink")}</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;