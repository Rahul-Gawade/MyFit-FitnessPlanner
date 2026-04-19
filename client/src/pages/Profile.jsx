import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppContext } from "../context/AppContext";
import Header from "../components/Header";
import { API } from "../services/api";

import { supabase } from "../lib/supabase";

function Profile() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setPlan, medicationList, symptomLogs } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    goal: "",
    activity_level: "",
    diet_preference: "",
    medical_condition: "",
  });

  const [focused, setFocused] = useState("");

  // Load existing profile if present
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (data) {
          setForm(data);
          localStorage.setItem("profile", JSON.stringify(data));
        } else {
          // Fallback to localStorage if no DB record
          const saved = JSON.parse(localStorage.getItem("profile"));
          if (saved) setForm(saved);
        }
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calculateBMI = () => {
    const heightInMeters = form.height / 100;
    return (form.weight / (heightInMeters * heightInMeters)).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      // ✅ Save profile to Supabase
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          ...form,
          updated_at: new Date(),
        });

      if (upsertError) {
        console.error("Profile sync error:", upsertError);
      }

      // ✅ Save profile to localStorage as fallback
      localStorage.setItem("profile", JSON.stringify(form));

      const bmi = calculateBMI();

      const healthData = {
        medications: medicationList.map((med) => ({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          notes: med.notes,
        })),
        symptoms: symptomLogs.map((log) => ({
          symptom: log.symptom,
          severity: log.severity,
          notes: log.notes,
        })),
      };

      const response = await fetch(`${API}/generate-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          bmi,
          language: i18n.language || "en",
          healthData,
        }),
      });

      if (!response.ok) {
        alert(t("profile.generateError"));
        setLoading(false);
        return;
      }

      const data = await response.json();

      // ✅ Save plan to context (auto-saves to localStorage)
      setPlan(data.plan);

      // ✅ Navigate to recommendation
      navigate("/recommendation");
    } catch (error) {
      console.error("Error generating plan:", error);
      alert(t("profile.serverError"));
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, var(--bg-start), var(--bg-mid), var(--bg-end))",
      padding: "0 0 60px",
      fontFamily: "var(--font-sans)",
      display: "flex",
      flexDirection: "column"
    },

    card: {
      width: "95%",
      maxWidth: "500px",
      margin: "clamp(20px, 8vw, 40px) auto",
      padding: "clamp(20px, 5vw, 30px)",
      borderRadius: "24px",
      background: "var(--card-bg)",
      backdropFilter: "blur(12px)",
      boxShadow: "0 20px 40px rgba(255, 107, 107, 0.08)",
      border: "1px solid var(--card-border)",
    },

    title: {
      textAlign: "center",
      color: "var(--food-primary)",
      marginBottom: "25px",
      fontWeight: "800",
      fontSize: "clamp(1.5rem, 6vw, 1.75rem)",
    },

    input: {
      width: "100%",
      padding: "14px",
      margin: "10px 0",
      borderRadius: "12px",
      border: "1px solid rgba(0,0,0,0.1)",
      outline: "none",
      fontSize: "15px",
      boxSizing: "border-box",
      fontFamily: "var(--font-sans)",
      background: "#fff",
      transition: "all 0.3s ease",
    },

    inputFocus: {
      border: "1px solid var(--food-primary)",
      boxShadow: "0 0 0 3px rgba(255, 107, 107, 0.15)",
    },

    button: {
      width: "100%",
      padding: "14px",
      marginTop: "20px",
      borderRadius: "12px",
      border: "none",
      background: "var(--food-primary)",
      color: "var(--button-text)",
      fontWeight: "700",
      cursor: "pointer",
      fontSize: "16px",
      boxShadow: "0 8px 16px rgba(255, 107, 107, 0.2)",
      transition: "all 0.3s ease",
    },
  };

  return (
    <div style={styles.container}>
      <Header />

      <div style={styles.card}>
        <h2 style={styles.title}>{t("profile.title")}</h2>

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder={t("profile.name") || "Full Name"}
            value={form.name || ""}
            onChange={handleChange}
            required
            style={{
              ...styles.input,
              ...(focused === "name" ? styles.inputFocus : {}),
            }}
            onFocus={() => setFocused("name")}
            onBlur={() => setFocused("")}
          />

          <input
            name="email"
            placeholder={t("profile.email") || "Email Address"}
            value={form.email || ""}
            onChange={handleChange}
            required
            style={{
              ...styles.input,
              ...(focused === "email" ? styles.inputFocus : {}),
            }}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused("")}
          />

          <input
            name="age"
            placeholder={t("profile.age")}
            value={form.age}
            onChange={handleChange}
            required
            style={{
              ...styles.input,
              ...(focused === "age" ? styles.inputFocus : {}),
            }}
            onFocus={() => setFocused("age")}
            onBlur={() => setFocused("")}
          />

          <input
            name="gender"
            placeholder={t("profile.gender")}
            value={form.gender}
            onChange={handleChange}
            required
            style={{
              ...styles.input,
              ...(focused === "gender" ? styles.inputFocus : {}),
            }}
            onFocus={() => setFocused("gender")}
            onBlur={() => setFocused("")}
          />

          <input
            name="height"
            placeholder={t("profile.height")}
            value={form.height}
            onChange={handleChange}
            required
            style={{
              ...styles.input,
              ...(focused === "height" ? styles.inputFocus : {}),
            }}
            onFocus={() => setFocused("height")}
            onBlur={() => setFocused("")}
          />

          <input
            name="weight"
            placeholder={t("profile.weight")}
            value={form.weight}
            onChange={handleChange}
            required
            style={{
              ...styles.input,
              ...(focused === "weight" ? styles.inputFocus : {}),
            }}
            onFocus={() => setFocused("weight")}
            onBlur={() => setFocused("")}
          />

          <input
            name="goal"
            placeholder={t("profile.goal")}
            value={form.goal}
            onChange={handleChange}
            required
            style={{
              ...styles.input,
              ...(focused === "goal" ? styles.inputFocus : {}),
            }}
            onFocus={() => setFocused("goal")}
            onBlur={() => setFocused("")}
          />

          <input
            name="activity_level"
            placeholder={t("profile.activityLevel")}
            value={form.activity_level}
            onChange={handleChange}
            required
            style={{
              ...styles.input,
              ...(focused === "activity_level" ? styles.inputFocus : {}),
            }}
            onFocus={() => setFocused("activity_level")}
            onBlur={() => setFocused("")}
          />

          <input
            name="diet_preference"
            placeholder={t("profile.dietPreference")}
            value={form.diet_preference}
            onChange={handleChange}
            required
            style={{
              ...styles.input,
              ...(focused === "diet_preference" ? styles.inputFocus : {}),
            }}
            onFocus={() => setFocused("diet_preference")}
            onBlur={() => setFocused("")}
          />

          <input
            name="medical_condition"
            placeholder={t("profile.medicalCondition")}
            value={form.medical_condition}
            onChange={handleChange}
            style={{
              ...styles.input,
              ...(focused === "medical_condition" ? styles.inputFocus : {}),
            }}
            onFocus={() => setFocused("medical_condition")}
            onBlur={() => setFocused("")}
          />

          <button style={styles.button} disabled={loading}>
            {loading ? t("profile.saving") || "Saving..." : t("profile.submitButton")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;