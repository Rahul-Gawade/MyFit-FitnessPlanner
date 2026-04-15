import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppContext } from "../context/AppContext";
import Header from "../components/Header";

function Profile() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setPlan, medicationList, symptomLogs } = useContext(AppContext);

  const [form, setForm] = useState({
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
    const saved = JSON.parse(localStorage.getItem("profile"));
    if (saved) setForm(saved);
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

    // ✅ Save profile
    localStorage.setItem("profile", JSON.stringify(form));

    // ✅ Generate plan via API
    try {
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

      const response = await fetch("http://localhost:5000/generate-plan", {
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
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #eef2ff, #ffffff)",
      padding: "20px",
      fontFamily: "sans-serif",
    },

    card: {
      maxWidth: "500px",
      margin: "20px auto",
      padding: "20px",
      borderRadius: "16px",
      background: "#fff",
      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
      width: "100%",
    },

    title: {
      textAlign: "center",
      color: "#2563eb",
      marginBottom: "20px",
    },

    input: {
      width: "100%",
      padding: "12px",
      margin: "10px 0",
      borderRadius: "8px",
      border: "1px solid #ccc",
      outline: "none",
      fontSize: "14px",
      boxSizing: "border-box",
    },

    inputFocus: {
      border: "1px solid #2563eb",
      boxShadow: "0 0 0 2px rgba(37,99,235,0.2)",
    },

    button: {
      width: "100%",
      padding: "12px",
      marginTop: "15px",
      borderRadius: "10px",
      border: "none",
      background: "#2563eb",
      color: "#fff",
      fontWeight: "600",
      cursor: "pointer",
      fontSize: "14px",
    },
  };

  return (
    <div style={styles.container}>
      <Header />

      <div style={styles.card}>
        <h2 style={styles.title}>{t("profile.title")}</h2>

        <form onSubmit={handleSubmit}>
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

          <button style={styles.button}>
            {t("profile.submitButton")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;