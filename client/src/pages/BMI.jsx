import React, { useState, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Header";
import { AppContext } from "../context/AppContext";

function BMI() {
  const { t } = useTranslation();
  const { plan } = useContext(AppContext); // ✅ get AI data

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState("");
  const [color, setColor] = useState("");
  const [focused, setFocused] = useState("");

  // ✅ Auto-fill from AI plan if available
  useEffect(() => {
    if (plan?.userSummary) {
      setHeight(plan.userSummary.height || "");
      setWeight(plan.userSummary.weight || "");
    }
  }, [plan]);

  const calculateBmi = () => {
    if (!height || !weight) {
      setResult(t("bmi.enterBoth"));
      setColor("#ef4444");
      return;
    }

    if (height <= 0 || weight <= 0) {
      setResult(t("bmi.enterValid"));
      setColor("#ef4444");
      return;
    }

    const h = height / 100;
    const bmi = weight / (h * h);
    const rounded = bmi.toFixed(2);

    let category = "";
    let colorCode = "";

    if (bmi < 18.5) {
      category = "Underweight";
      colorCode = "#f59e0b";
    } else if (bmi < 24.9) {
      category = "Normal weight";
      colorCode = "#10b981";
    } else if (bmi < 29.9) {
      category = "Overweight";
      colorCode = "#f97316";
    } else {
      category = "Obese";
      colorCode = "#ef4444";
    }

    setResult(t("bmi.result", { value: rounded, category }));
    setColor(colorCode);
  };

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, var(--bg-start), var(--bg-mid), var(--bg-end))",
      padding: "0 0 60px",
      fontFamily: "var(--font-sans)",
      display: "flex",
      flexDirection: "column",
    },

    card: {
      width: "95%",
      maxWidth: "400px",
      margin: "clamp(20px, 8vw, 50px) auto",
      padding: "clamp(20px, 5vw, 30px)",
      borderRadius: "24px",
      background: "var(--card-bg)",
      backdropFilter: "blur(12px)",
      boxShadow: "0 20px 40px rgba(255, 107, 107, 0.08)",
      border: "1px solid var(--card-border)",
      textAlign: "center",
    },

    title: {
      fontSize: "clamp(1.5rem, 6vw, 2rem)",
      fontWeight: "800",
      color: "var(--food-primary)",
      marginBottom: "20px",
    },

    input: {
      width: "100%",
      padding: "14px",
      margin: "10px 0",
      borderRadius: "12px",
      border: "1px solid rgba(0,0,0,0.1)",
      outline: "none",
      fontFamily: "var(--font-sans)",
      boxSizing: "border-box",
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
      boxShadow: "0 8px 16px rgba(255, 107, 107, 0.2)",
      transition: "all 0.3s ease",
    },

    result: {
      marginTop: "25px",
      fontWeight: "700",
      fontSize: "1.1rem",
    },
  };

  return (
    <div style={styles.container}>
      <Navbar />

      <div style={styles.card}>
        <h2 style={styles.title}>{t("bmi.title")}</h2>

        <input
          type="number"
          placeholder={t("bmi.height")}
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          style={{
            ...styles.input,
            ...(focused === "height" ? styles.inputFocus : {}),
          }}
          onFocus={() => setFocused("height")}
          onBlur={() => setFocused("")}
        />

        <input
          type="number"
          placeholder={t("bmi.weight")}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          style={{
            ...styles.input,
            ...(focused === "weight" ? styles.inputFocus : {}),
          }}
          onFocus={() => setFocused("weight")}
          onBlur={() => setFocused("")}
        />

        <button
          style={styles.button}
          onClick={calculateBmi}
        >
          {t("bmi.calculate")}
        </button>

        {result && (
          <p style={{ ...styles.result, color }}>
            {result}
          </p>
        )}
      </div>
    </div>
  );
}

export default BMI;