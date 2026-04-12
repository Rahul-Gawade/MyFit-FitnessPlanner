import { useContext, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Navbar from "../components/Header";
import jsPDF from "jspdf";

function Recommendation() {
  const { t, i18n } = useTranslation();
  const { plan } = useContext(AppContext);
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState("BMI");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const speechUtteranceRef = useRef(null);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getRecommendationSpeechText = () => {
    if (!plan) return "";
    let text = `Here is your personalized fitness plan. Your age is ${plan.userSummary?.age}, gender is ${plan.userSummary?.gender}, height is ${plan.userSummary?.height} centimeters, weight is ${plan.userSummary?.weight} kilograms, BMI is ${plan.userSummary?.bmi}, and your goal is ${plan.userSummary?.goal}.`;

    if (plan.userSummary?.medical_condition && plan.userSummary.medical_condition !== "None") {
      text += ` Your medical condition is ${plan.userSummary.medical_condition}.`;
    }

    if (selectedSection === "BMI") {
      text += ` ${plan.bmiAnalysis}`;
    } else if (selectedSection === "Calories") {
      text += ` Your recommended daily calories are ${plan.calories}.`;
    } else if (selectedSection === "Workout") {
      text += ` Your workout plan includes: ${plan.workout?.join(", ")}.`;
    } else if (selectedSection === "Diet") {
      text += ` Your diet plan includes breakfast: ${plan.diet?.breakfast}, lunch: ${plan.diet?.lunch}, and dinner: ${plan.diet?.dinner}.`;
    } else if (selectedSection === "HealthTips") {
      text += ` Health tips: ${plan.healthTips?.join(". ")}.`;
    } else if (selectedSection === "Condition") {
      text += ` Since you indicated ${plan.userSummary?.medical_condition}, the plan includes safer exercise choices and dietary suggestions tailored for you.`;
    }

    return text;
  };

  const startReading = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = getRecommendationSpeechText();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const language = i18n?.language || "en-US";
    utterance.lang = language;
    utterance.volume = 1;
    utterance.rate = 1;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) => v.lang.startsWith(language.split("-")[0])) || voices[0];
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      speechUtteranceRef.current = null;
    };
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error || event);
      setIsSpeaking(false);
      setIsPaused(false);
      speechUtteranceRef.current = null;
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const pauseReading = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resumeReading = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
    }
  };

  const stopReading = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    speechUtteranceRef.current = null;
  };

  const downloadPDF = () => {
    if (!plan) return;

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const leftMargin = 15;
      const maxWidth = 180;
      let y = 20;

      pdf.setFontSize(18);
      pdf.setTextColor("#1b1b1b");
      pdf.text("MyFit Personalized Plan", leftMargin, y);
      y += 10;

      pdf.setFontSize(12);
      pdf.setTextColor("#333333");
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, leftMargin, y);
      y += 12;

      const addSection = (title, content) => {
        pdf.setFontSize(14);
        pdf.setTextColor("#1d4ed8");
        pdf.text(title, leftMargin, y);
        y += 8;

        pdf.setFontSize(11);
        pdf.setTextColor("#222222");
        const lines = pdf.splitTextToSize(content, maxWidth);
        pdf.text(lines, leftMargin, y);
        y += lines.length * 6 + 8;

        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
      };

      addSection(
        "Profile Summary",
        `Age: ${plan.userSummary?.age}\nGender: ${plan.userSummary?.gender}\nHeight: ${plan.userSummary?.height} cm\nWeight: ${plan.userSummary?.weight} kg\nBMI: ${plan.userSummary?.bmi}\nGoal: ${plan.userSummary?.goal}\nMedical Condition: ${plan.userSummary?.medical_condition || "None"}`
      );

      addSection("BMI Analysis", plan.bmiAnalysis || "No BMI analysis available.");
      addSection("Calories", plan.calories || "No calorie recommendation available.");

      addSection(
        "Workout Plan",
        plan.workout?.length
          ? plan.workout.map((item, index) => `${index + 1}. ${item}`).join("\n")
          : "No workout plan available."
      );

      addSection(
        "Diet Plan",
        `Breakfast: ${plan.diet?.breakfast || "-"}\nLunch: ${plan.diet?.lunch || "-"}\nDinner: ${plan.diet?.dinner || "-"}`
      );

      if (plan.userSummary?.medical_condition && plan.userSummary.medical_condition !== "None") {
        addSection(
          "Condition Guidance",
          plan.healthTips?.length
            ? `Medical Condition: ${plan.userSummary.medical_condition}\nSuggested guidance: ${plan.healthTips.join(" \n")}`
            : `Medical Condition: ${plan.userSummary.medical_condition}`
        );
      } else {
        addSection(
          "Condition Guidance",
          "No specific medical condition guidance required."
        );
      }

      pdf.save(`MyFit_Plan_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("PDF download error:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  const detailSections = [
    { id: "BMI", title: t("recommendation.bmiAnalysis"), icon: "📈" },
    { id: "Calories", title: t("recommendation.recommendedCalories"), icon: "🔥" },
    { id: "Workout", title: t("recommendation.workoutPlan"), icon: "💪" },
    { id: "Diet", title: t("recommendation.dietPlan"), icon: "🍎" },
    { id: "HealthTips", title: t("recommendation.healthTips"), icon: "💡" },
  ];

  if (plan.userSummary?.medical_condition && plan.userSummary.medical_condition !== "None") {
    detailSections.splice(4, 0, {
      id: "Condition",
      title: "Condition Guidance",
      icon: "🩺",
    });
  }


  if (!plan) {
    return (
      <div>
        <Navbar />
        <div style={styles.emptyState}>
          <div style={styles.emptyStateCard}>
            <div style={styles.emptyIcon}>📋</div>
            <h2>{t("recommendation.noPlanTitle")}</h2>
            <p>{t("recommendation.noPlanText")}</p>
            <button 
              onClick={() => navigate("/profile")}
              style={styles.primaryButton}
              onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
              onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
            >
              {t("recommendation.getStarted")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={styles.mainContainer}>
        {/* Header Section */}
        <div style={styles.headerSection}>
          <h1 style={styles.mainTitle}>{t("recommendation.pageTitle")}</h1>
          <p style={styles.subtitle}>{t("recommendation.pageSubtitle")}</p>
        </div>

        <div style={styles.planContent}>

        {/* User Summary Cards */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>{t("recommendation.profileSummary")}</h2>
          <div style={styles.summaryGrid}>
            <StatCard 
              label={t("recommendation.age")} 
              value={plan.userSummary?.age} 
              icon="🎂"
            />
            <StatCard 
              label={t("recommendation.gender")} 
              value={plan.userSummary?.gender} 
              icon="👤"
            />
            <StatCard 
              label={t("recommendation.height")} 
              value={`${plan.userSummary?.height} cm`} 
              icon="📏"
            />
            <StatCard 
              label={t("recommendation.weight")} 
              value={`${plan.userSummary?.weight} kg`} 
              icon="⚖️"
            />
            <StatCard 
              label={t("recommendation.bmi")} 
              value={plan.userSummary?.bmi} 
              icon="📊"
              highlight
            />
            <StatCard 
              label={t("recommendation.medicalCondition")} 
              value={plan.userSummary?.medical_condition || "None"} 
              icon="🩺"
              highlight
            />
            <StatCard 
              label={t("recommendation.goal")} 
              value={plan.userSummary?.goal} 
              icon="🎯"
              highlight
            />
          </div>
        </div>

        {/* Plan Sections */}
        <div style={styles.speechControlsContainer}>
          <button style={styles.speechButton} onClick={startReading}>
            Start Reading
          </button>
          <button style={styles.speechButton} onClick={pauseReading} disabled={!isSpeaking || isPaused}>
            Pause
          </button>
          <button style={styles.speechButton} onClick={resumeReading} disabled={!isPaused}>
            Resume
          </button>
          <button style={styles.speechButton} onClick={stopReading} disabled={!isSpeaking && !isPaused}>
            Stop
          </button>
        </div>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>{t("recommendation.explorePlan")}</h2>
          <div style={styles.sectionCardGrid}>
            {detailSections.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedSection(item.id)}
                style={
                  selectedSection === item.id
                    ? { ...styles.sectionCard, ...styles.sectionCardActive }
                    : styles.sectionCard
                }
              >
                <div style={styles.sectionCardIcon}>{item.icon}</div>
                <div>
                  <h3 style={styles.sectionCardTitle}>{item.title}</h3>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Detail */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>{t("recommendation.detailView")}</h2>
          {selectedSection === "BMI" && (
            <div style={styles.analysisCard}>
              <div style={styles.analysisIcon}>📈</div>
              <p style={styles.analysisText}>{plan.bmiAnalysis}</p>
            </div>
          )}

          {selectedSection === "Calories" && (
            <div style={styles.calorieCard}>
              <div style={styles.calorieContent}>
                <p style={styles.calorieLabel}>{t("recommendation.recommendedCalories")}</p>
                <p style={styles.calorieValue}>{plan.calories}</p>
                <p style={styles.calorieSubtext}>{t("recommendation.kcalPerDay")}</p>
              </div>
              <div style={styles.calorieChart}>
                <div style={styles.calorieBar}>{Math.round(parseInt(plan.calories) / 25)}%</div>
              </div>
            </div>
          )}

          {selectedSection === "Workout" && (
            <div style={styles.workoutList}>
              {plan.workout?.map((w, i) => (
                <div key={i} style={styles.workoutItem}>
                  <span style={styles.workoutNumber}>{i + 1}</span>
                  <span style={styles.workoutText}>{w}</span>
                </div>
              ))}
            </div>
          )}

          {selectedSection === "Diet" && (
            <div style={styles.dietGrid}>
              <MealCard
                title="🌅 Breakfast"
                content={plan.diet?.breakfast}
                bgColor="#fef3c7"
                borderColor="#f59e0b"
              />
              <MealCard
                title="🍽️ Lunch"
                content={plan.diet?.lunch}
                bgColor="#dbeafe"
                borderColor="#3b82f6"
              />
              <MealCard
                title="🍽️ Dinner"
                content={plan.diet?.dinner}
                bgColor="#fce7f3"
                borderColor="#ec4899"
              />
            </div>
          )}

          {selectedSection === "HealthTips" && (
            <div style={styles.tipsGrid}>
              {plan.healthTips?.map((tip, i) => (
                <div key={i} style={styles.tipCard}>
                  <span style={styles.tipIcon}>💡</span>
                  <p style={styles.tipText}>{tip}</p>
                </div>
              ))}
            </div>
          )}

          {selectedSection === "Condition" && (
            <div style={styles.conditionAdviceCard}>
              <p style={styles.conditionAdviceText}>
                {t("recommendation.conditionContent", { condition: plan.userSummary.medical_condition })}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={styles.actionButtons}>
          <button
            onClick={downloadPDF}
            style={styles.downloadButton}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 10px 25px rgba(34, 197, 94, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 6px rgba(34, 197, 94, 0.2)";
            }}
          >
            📄 {t("recommendation.downloadPdf")}
          </button>
          <button
            onClick={() => navigate("/ai")}
            style={styles.primaryButton}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 10px 25px rgba(37, 99, 235, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 6px rgba(37, 99, 235, 0.2)";
            }}
          >
            💬 {t("recommendation.chatCoach")}
          </button>
          <button
            onClick={() => navigate("/profile")}
            style={styles.secondaryButton}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 10px 25px rgba(107, 114, 128, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 6px rgba(107, 114, 128, 0.1)";
            }}
          >
            📝 {t("recommendation.updateProfile")}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}

// StatCard Component
function StatCard({ label, value, icon, highlight }) {
  return (
    <div 
      style={{
        ...styles.statCard,
        ...(highlight && styles.statCardHighlight)
      }}
    >
      <div style={styles.statIcon}>{icon}</div>
      <p style={styles.statLabel}>{label}</p>
      <p style={styles.statValue}>{value}</p>
    </div>
  );
}

// MealCard Component
function MealCard({ title, content, bgColor, borderColor }) {
  return (
    <div 
      style={{
        ...styles.mealCard,
        backgroundColor: bgColor,
        borderLeft: `4px solid ${borderColor}`
      }}
    >
      <h3 style={{...styles.mealTitle, color: borderColor}}>{title}</h3>
      <p style={styles.mealContent}>{content}</p>
    </div>
  );
}

// Styles Object
const styles = {
  mainContainer: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "40px 20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: "linear-gradient(180deg, #ebf2ff 0%, #f8fbff 100%)",
    minHeight: "100vh",
  },

  headerSection: {
    textAlign: "center",
    marginBottom: "50px",
    animation: "slideDown 0.6s ease-out",
    background: "#eef4ff",
    padding: "28px 24px",
    borderRadius: "24px",
    boxShadow: "0 25px 60px rgba(59, 130, 246, 0.12)",
    border: "1px solid rgba(59, 130, 246, 0.16)",
  },

  mainTitle: {
    fontSize: "clamp(24px, 7vw, 36px)",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "10px",
  },

  subtitle: {
    fontSize: "16px",
    color: "#64748b",
    margin: 0,
  },

  section: {
    marginBottom: "40px",
    animation: "fadeIn 0.6s ease-out",
  },

  sectionTitle: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "20px",
    paddingBottom: "12px",
    borderBottom: "3px solid #2563eb",
    display: "inline-block",
  },

  sectionCardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
    padding: "0 10px",
  },

  sectionCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    width: "100%",
    padding: "20px",
    borderRadius: "18px",
    border: "1px solid rgba(59, 130, 246, 0.2)",
    background: "#f8fbff",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
    color: "#0f172a",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
  },
  sectionCardActive: {
    borderColor: "#2563eb",
    background: "#dbeafe",
    boxShadow: "0 18px 42px rgba(37, 99, 235, 0.16)",
  },

  sectionCardIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    background: "#e0f2fe",
  },

  sectionCardTitle: {
    fontSize: "16px",
    fontWeight: "700",
    margin: 0,
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
    padding: "0 10px",
  },

  statCard: {
    background: "#f8fbff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
    textAlign: "center",
    transition: "all 0.3s ease",
    cursor: "pointer",
    border: "1px solid rgba(59, 130, 246, 0.15)",
  },
  statCardHighlight: {
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#ffffff",
    boxShadow: "0 8px 16px rgba(37, 99, 235, 0.2)",
  },

  statIcon: {
    fontSize: "32px",
    marginBottom: "10px",
  },

  statLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#64748b",
    margin: "5px 0",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  statValue: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "5px 0 0 0",
  },

  statCardHighlight: {
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#ffffff",
  },

  analysisCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "20px",
    background: "#eef2ff",
    padding: "28px",
    borderRadius: "18px",
    boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
    border: "1px solid rgba(59, 130, 246, 0.16)",
  },

  analysisIcon: {
    fontSize: "40px",
    minWidth: "50px",
  },

  analysisText: {
    color: "#475569",
    lineHeight: "1.6",
    margin: 0,
    fontSize: "15px",
  },

  conditionAdviceCard: {
    background: "rgba(255, 247, 237, 0.95)",
    border: "1px solid rgba(251, 191, 64, 0.28)",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 18px 35px rgba(251, 191, 64, 0.12)",
  },

  conditionAdviceText: {
    color: "#92400e",
    fontSize: "15px",
    lineHeight: "1.75",
    margin: 0,
  },

  calorieCard: {
    display: "flex",
    alignItems: "center",
    gap: "30px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#ffffff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 8px 16px rgba(37, 99, 235, 0.2)",
  },

  calorieContent: {
    flex: 1,
  },

  calorieLabel: {
    fontSize: "14px",
    opacity: 0.9,
    margin: "0 0 10px 0",
    fontWeight: "500",
  },

  calorieValue: {
    fontSize: "48px",
    fontWeight: "700",
    margin: "0 0 5px 0",
  },

  calorieSubtext: {
    fontSize: "13px",
    opacity: 0.8,
    margin: 0,
  },

  calorieChart: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  calorieBar: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "700",
    background: "rgba(255, 255, 255, 0.2)",
    border: "3px solid rgba(255, 255, 255, 0.4)",
  },

  workoutList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  workoutItem: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    background: "#ffffff",
    padding: "15px 20px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
    transition: "all 0.3s ease",
    borderLeft: "4px solid #2563eb",
  },

  workoutNumber: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    background: "#2563eb",
    color: "#ffffff",
    borderRadius: "50%",
    fontWeight: "700",
    fontSize: "14px",
    flexShrink: 0,
  },

  workoutText: {
    color: "#1e293b",
    fontSize: "15px",
    fontWeight: "500",
  },

  dietGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },

  mealCard: {
    padding: "25px",
    borderRadius: "12px",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
  },

  mealTitle: {
    fontSize: "18px",
    fontWeight: "700",
    margin: "0 0 12px 0",
  },

  mealContent: {
    color: "#475569",
    lineHeight: "1.6",
    margin: 0,
    fontSize: "14px",
  },

  tipsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "15px",
  },

  tipCard: {
    display: "flex",
    gap: "15px",
    background: "#eff6ff",
    padding: "20px",
    borderRadius: "14px",
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.06)",
    transition: "all 0.3s ease",
    borderLeft: "4px solid #10b981",
  },

  speechControlsContainer: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: "24px",
  },

  speechButton: {
    padding: "12px 18px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    minWidth: "110px",
    transition: "all 0.2s ease",
  },


  tipIcon: {
    fontSize: "24px",
    minWidth: "30px",
    textAlign: "center",
  },

  tipText: {
    color: "#475569",
    margin: 0,
    fontSize: "14px",
    lineHeight: "1.5",
  },

  actionButtons: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
    marginTop: "50px",
    flexWrap: "wrap",
  },

  primaryButton: {
    padding: "14px 32px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 6px rgba(37, 99, 235, 0.2)",
  },

  secondaryButton: {
    padding: "14px 32px",
    background: "#ffffff",
    color: "#2563eb",
    border: "2px solid #2563eb",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 6px rgba(107, 114, 128, 0.1)",
  },

  downloadButton: {
    padding: "14px 32px",
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 6px rgba(34, 197, 94, 0.2)",
  },

  planContent: {
    background: "#f7fbff",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 25px 70px rgba(15, 23, 42, 0.08)",
    border: "1px solid rgba(59, 130, 246, 0.12)",
  },

  emptyState: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "70vh",
    backgroundColor: "#f8fafc",
  },

  emptyStateCard: {
    textAlign: "center",
    padding: "50px",
    background: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    maxWidth: "400px",
  },

  emptyIcon: {
    fontSize: "60px",
    marginBottom: "20px",
  },
};

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  button {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  button:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 28px;
    }

    .summaryGrid {
      grid-template-columns: repeat(2, 1fr);
    }

    .dietGrid {
      grid-template-columns: 1fr;
    }

    .calorieCard {
      flex-direction: column;
    }
  }
`;
if (typeof document !== "undefined") {
  document.head.appendChild(styleSheet);
}

export default Recommendation;