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
      background: "linear-gradient(135deg, #eef2ff, #ffffff)",
      padding: "20px",
      fontFamily: "sans-serif",
    },

    card: {
      maxWidth: "400px",
      margin: "50px auto",
      padding: "30px",
      borderRadius: "16px",
      background: "#fff",
      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
      textAlign: "center",
    },

    title: {
      fontSize: "1.8rem",
      fontWeight: "bold",
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
    },

    result: {
      marginTop: "20px",
      fontWeight: "600",
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