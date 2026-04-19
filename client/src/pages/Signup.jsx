import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { supabase } from "../lib/supabase";

function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (data.password.length < 6) {
      setError(t("signup.passwordMin"));
      setLoading(false);
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.name,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // Create an initial entry in the profiles table for this new user
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: authData.user.id,
          name: data.name,
          email: data.email,
        }
      ]);

      if (profileError) {
        console.error("Profile Insert Error:", profileError);
        setError("User created, but profile failed to save: " + profileError.message);
        setLoading(false);
        return;
      }

      localStorage.setItem("isLoggedIn", "true");
      navigate("/home");
    }
    setLoading(false);
  };

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, var(--bg-start), var(--bg-mid), var(--bg-end))",
      padding: "0 20px",
      fontFamily: "var(--font-sans)",
    },
    card: {
      width: "380px",
      padding: "40px",
      borderRadius: "24px",
      background: "var(--card-bg)",
      backdropFilter: "blur(12px)",
      boxShadow: "0 20px 40px rgba(255, 107, 107, 0.08)",
      border: "1px solid var(--card-border)",
      textAlign: "center",
    },
    input: {
      width: "100%",
      padding: "14px",
      margin: "12px 0",
      borderRadius: "12px",
      border: "1px solid rgba(0,0,0,0.1)",
      outline: "none",
      transition: "border 0.3s ease",
      fontFamily: "var(--font-sans)",
      boxSizing: "border-box",
    },
    button: {
      width: "100%",
      padding: "14px",
      marginTop: "20px",
      borderRadius: "12px",
      border: "none",
      background: loading ? "#9ca3af" : "var(--food-primary)",
      color: "var(--button-text)",
      cursor: loading ? "not-allowed" : "pointer",
      fontWeight: "700",
      transition: "all 0.3s ease",
      boxShadow: "0 8px 16px rgba(255, 107, 107, 0.2)",
    },
    error: {
      color: "#ef4444",
      marginTop: "12px",
      fontWeight: "500",
    },
  };

  return (
    <div style={styles.container} className="animate-bg-shift">
      <div style={styles.card} className="animate-scale-in">
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

          <button style={styles.button} disabled={loading} className="hover-scale">
            {loading ? t("signup.signingUp") || "Signing Up..." : t("signup.signUpButton")}
          </button>
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