import { useContext, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Navbar from "../components/Header";
import jsPDF from "jspdf";
import { TrendingUp, Flame, Dumbbell, Apple, Lightbulb, Stethoscope, FileDown, MessageSquare, Settings, User, Ruler, Scale, Target, Activity, CalendarDays, Sunrise, Sun, Moon, ClipboardList, RefreshCcw, Check, Loader2, X } from "lucide-react";

function Recommendation() {
  const { t, i18n } = useTranslation();
  const { plan, setPlan } = useContext(AppContext);
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState("BMI");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const speechUtteranceRef = useRef(null);
  const [planLang, setPlanLang] = useState("en");

  // Smart Swap States
  const [swappingType, setSwappingType] = useState(null); // 'breakfast', 'lunch', 'dinner'
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapAlternatives, setSwapAlternatives] = useState([]);
  const [selectedSwap, setSelectedSwap] = useState("");
  const [swapError, setSwapError] = useState("");

  // Helper function to extract calorie number from AI response
  const extractCalorieNumber = (caloriesText) => {
    if (!caloriesText || typeof caloriesText !== 'string') return 2000; // fallback
    
    // Extract first number from string (handles formats like "2000-2500", "2000 calories", etc.)
    const match = caloriesText.match(/\d+/);
    const number = match ? parseInt(match[0], 10) : 2000;
    
    // Ensure reasonable range
    return isNaN(number) ? 2000 : Math.max(1200, Math.min(4000, number));
  };

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSmartSwap = async (type, currentMeal) => {
    setSwappingType(type);
    setIsSwapping(true);
    setSwapError("");
    setSwapAlternatives([]);
    setSelectedSwap("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/smart-swap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealType: type,
          currentMeal,
          userSummary: plan.userSummary,
          language: i18n.language
        }),
      });

      if (!response.ok) throw new Error("Swap failed");
      const data = await response.json();
      setSwapAlternatives(data.alternatives || []);
    } catch (err) {
      console.error("Swap error:", err);
      setSwapError(t("recommendation.swapError"));
    } finally {
      setIsSwapping(false);
    }
  };

  const applySwap = () => {
    if (!selectedSwap || !swappingType) return;

    const updatedPlan = {
      ...plan,
      diet: {
        ...plan.diet,
        [swappingType]: selectedSwap
      }
    };

    setPlan(updatedPlan);
    setSwappingType(null); // Close the modal
    setSelectedSwap("");
  };

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
        pdf.setTextColor("#ff6b6b");
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
          t("recommendation.conditionGuidance") || "Condition Guidance",
          plan.healthTips?.length
            ? `${t("recommendation.medicalCondition")}: ${plan.userSummary.medical_condition}\nSuggested guidance: ${plan.healthTips.join(" \n")}`
            : `${t("recommendation.medicalCondition")}: ${plan.userSummary.medical_condition}`
        );
      } else {
        addSection(
          t("recommendation.conditionGuidance") || "Condition Guidance",
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
    { id: "BMI", title: t("recommendation.bmiAnalysis"), icon: <TrendingUp size={24} /> },
    { id: "Calories", title: t("recommendation.recommendedCalories"), icon: <Flame size={24} /> },
    { id: "Workout", title: t("recommendation.workoutPlan"), icon: <Dumbbell size={24} /> },
    { id: "Diet", title: t("recommendation.dietPlan"), icon: <Apple size={24} /> },
    { id: "HealthTips", title: t("recommendation.healthTips"), icon: <Lightbulb size={24} /> },
  ];

  if (plan?.userSummary?.medical_condition && plan.userSummary.medical_condition !== "None") {
    detailSections.splice(4, 0, {
      id: "Condition",
      title: t("recommendation.conditionGuidance") || "Condition Guidance",
      icon: <Stethoscope size={24} />,
    });
  }


  if (!plan) {
    return (
      <div>
        <Navbar />
        <div style={styles.emptyState} className="animate-bg-shift">
          <div style={styles.emptyStateCard} className="animate-scale-in">
            <div style={styles.emptyIcon}><ClipboardList size={48} color="var(--food-primary)" /></div>
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
      <div style={styles.mainContainer} className="animate-bg-shift">
        {/* Header Section */}
        <div style={styles.headerSection} className="animate-slide-up stagger-1">
          <h1 style={styles.mainTitle}>{t("recommendation.pageTitle")}</h1>
          <p style={styles.subtitle}>{t("recommendation.pageSubtitle")}</p>
        </div>

        <div style={styles.planContent} className="animate-slide-up stagger-2 plan-content-responsive">

        {/* User Summary Cards */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>{t("recommendation.profileSummary")}</h2>
          <div style={styles.summaryGrid} className="summary-grid-responsive">
            <StatCard 
              label={t("recommendation.age")} 
              value={plan.userSummary?.age} 
              icon={<CalendarDays size={20} />}
            />
            <StatCard 
              label={t("recommendation.gender")} 
              value={plan.userSummary?.gender} 
              icon={<User size={20} />}
            />
            <StatCard 
              label={t("recommendation.height")} 
              value={`${plan.userSummary?.height} cm`} 
              icon={<Ruler size={20} />}
            />
            <StatCard 
              label={t("recommendation.weight")} 
              value={`${plan.userSummary?.weight} kg`} 
              icon={<Scale size={20} />}
            />
            <StatCard 
              label={t("recommendation.bmi")} 
              value={plan.userSummary?.bmi} 
              icon={<Activity size={20} />}
              highlight
            />
            <StatCard 
              label={t("recommendation.medicalCondition")} 
              value={plan.userSummary?.medical_condition || "None"} 
              icon={<Stethoscope size={20} />}
              highlight
            />
            <StatCard 
              label={t("recommendation.goal")} 
              value={plan.userSummary?.goal} 
              icon={<Target size={20} />}
              highlight
            />
          </div>
        </div>

        {/* Plan Sections */}
        <div style={styles.speechControlsContainer}>
          <button style={styles.speechButton} onClick={startReading}>
            {t("recommendation.speechStart")}
          </button>
          <button style={styles.speechButton} onClick={pauseReading} disabled={!isSpeaking || isPaused}>
            {t("recommendation.speechPause")}
          </button>
          <button style={styles.speechButton} onClick={resumeReading} disabled={!isPaused}>
            {t("recommendation.speechResume")}
          </button>
          <button style={styles.speechButton} onClick={stopReading} disabled={!isSpeaking && !isPaused}>
            {t("recommendation.speechStop")}
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
        <div style={styles.section} className="animate-slide-up stagger-3">
          <h2 style={styles.sectionTitle}>{t("recommendation.detailView")}</h2>
          {selectedSection === "BMI" && (
            <div style={styles.analysisCard}>
              <div style={styles.analysisIcon}><TrendingUp size={36} color="var(--food-primary)" /></div>
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
                <div style={styles.calorieBar}>{Math.round(extractCalorieNumber(plan.calories) / 25)}%</div>
              </div>
            </div>
          )}

          {selectedSection === "Workout" && (
            <div style={styles.workoutList}>
              {Array.isArray(plan.workout) ? (
                plan.workout.map((w, i) => (
                  <div key={i} style={styles.workoutItem}>
                    <span style={styles.workoutNumber}>{i + 1}</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ ...styles.workoutText, fontWeight: '700' }}>
                        {typeof w === 'object' ? w.day : w}
                      </span>
                      {typeof w === 'object' && w.exercises && (
                        <span style={{ ...styles.workoutText, fontSize: '13px', opacity: 0.8 }}>
                          {Array.isArray(w.exercises) ? w.exercises.join(", ") : w.exercises}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : typeof plan.workout === "string" ? (
                plan.workout.split("\n").filter(line => line.trim()).map((w, i) => (
                  <div key={i} style={styles.workoutItem}>
                    <span style={styles.workoutNumber}>{i + 1}</span>
                    <span style={styles.workoutText}>{w.replace(/^\d+\.\s*/, "")}</span>
                  </div>
                ))
              ) : (
                <div style={styles.emptyText}>{t("recommendation.noWorkoutData")}</div>
              )}
            </div>
          )}

          {selectedSection === "Diet" && (
            <div style={styles.dietGrid}>
              <MealCard
                title={<span style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Sunrise size={20} /> {t("recommendation.breakfast")}</span>}
                content={plan.diet?.breakfast}
                type="breakfast"
                onSwap={handleSmartSwap}
                bgColor="#fef3c7"
                borderColor="#f59e0b"
              />
              <MealCard
                title={<span style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Sun size={20} /> {t("recommendation.lunch")}</span>}
                content={plan.diet?.lunch}
                type="lunch"
                onSwap={handleSmartSwap}
                bgColor="#ffedd5"
                borderColor="#f97316"
              />
              <MealCard
                title={<span style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Moon size={20} /> {t("recommendation.dinner")}</span>}
                content={plan.diet?.dinner}
                type="dinner"
                onSwap={handleSmartSwap}
                bgColor="#fce7f3"
                borderColor="#ec4899"
              />
            </div>
          )}

          {selectedSection === "HealthTips" && (
            <div style={styles.tipsGrid}>
              {Array.isArray(plan.healthTips) ? (
                plan.healthTips.map((tip, i) => (
                  <div key={i} style={styles.tipCard}>
                    <span style={styles.tipIcon}><Lightbulb size={24} color="#10b981" /></span>
                    <p style={styles.tipText}>{tip}</p>
                  </div>
                ))
              ) : typeof plan.healthTips === "string" ? (
                plan.healthTips.split("\n").filter(line => line.trim()).map((tip, i) => (
                  <div key={i} style={styles.tipCard}>
                    <span style={styles.tipIcon}><Lightbulb size={24} color="#10b981" /></span>
                    <p style={styles.tipText}>{tip.replace(/^\d+\.\s*/, "")}</p>
                  </div>
                ))
              ) : (
                <div style={styles.emptyText}>{t("recommendation.noTipsData")}</div>
              )}
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
        <div style={styles.actionButtons} className="animate-slide-up stagger-4">
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
            <FileDown size={18} style={{ marginRight: '8px' }} /> {t("recommendation.downloadPdf")}
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
            <MessageSquare size={18} style={{ marginRight: '8px' }} /> {t("recommendation.chatCoach")}
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
            <Settings size={18} style={{ marginRight: '8px' }} /> {t("recommendation.updateProfile")}
          </button>
        {/* Smart Swap Modal */}
        {swappingType && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent} className="animate-scale-in">
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>{t("recommendation.smartSwap")}</h3>
                <button style={styles.closeBtn} onClick={() => setSwappingType(null)}><X size={20} /></button>
              </div>

              {isSwapping ? (
                <div style={styles.loadingState}>
                  <Loader2 size={32} className="animate-spin" color="var(--food-primary)" />
                  <p>{t("recommendation.swapping")}</p>
                </div>
              ) : swapError ? (
                <p style={styles.errorText}>{swapError}</p>
              ) : (
                <>
                  <p style={styles.modalSubtitle}>{t("recommendation.pickAlternative")}:</p>
                  <div style={styles.alternativesList} className="hide-scrollbar">
                    {swapAlternatives.map((alt, i) => (
                      <div 
                        key={i} 
                        style={{
                          ...styles.alternativeItem,
                          backgroundColor: selectedSwap === alt ? 'rgba(255, 107, 107, 0.1)' : 'transparent',
                          borderColor: selectedSwap === alt ? 'var(--food-primary)' : 'var(--card-border)'
                        }}
                        onClick={() => setSelectedSwap(alt)}
                      >
                        <span style={{flex: 1}}>{alt}</span>
                        {selectedSwap === alt && <Check size={18} color="var(--food-primary)" />}
                      </div>
                    ))}
                  </div>
                  <button 
                    style={{...styles.applyBtn, opacity: selectedSwap ? 1 : 0.5, cursor: selectedSwap ? 'pointer' : 'not-allowed'}}
                    disabled={!selectedSwap}
                    onClick={applySwap}
                  >
                    {t("recommendation.applySwap")}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
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
function MealCard({ title, content, type, onSwap, borderColor, bgColor }) {
  const { t } = useTranslation();
  return (
    <div 
      style={{
        ...styles.mealCard,
        backgroundColor: bgColor,
        borderLeft: `4px solid ${borderColor}`
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{...styles.mealTitle, color: borderColor}}>{title}</h3>
        <button 
          onClick={() => onSwap(type, content)}
          style={styles.swapBtn}
          title={t("recommendation.smartSwap")}
        >
          <RefreshCcw size={16} />
        </button>
      </div>
      <p style={styles.mealContent}>{content}</p>
    </div>
  );
}

// Styles Object
const styles = {
  langMismatchBanner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    background: "rgba(245, 158, 11, 0.1)",
    borderLeft: "4px solid #f59e0b",
    borderRadius: "12px",
    marginBottom: "20px",
    gap: "12px",
    flexWrap: "wrap",
  },
  langMismatchText: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#d97706",
    flex: 1,
  },
  langMismatchBtn: {
    padding: "8px 18px",
    borderRadius: "10px",
    border: "none",
    background: "#f59e0b",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },
  mainContainer: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "clamp(20px, 5vw, 40px) 20px",
    fontFamily: "var(--font-sans)",
    minHeight: "100vh",
  },

  headerSection: {
    textAlign: "center",
    marginBottom: "50px",
    background: "var(--card-bg)",
    backdropFilter: "blur(12px)",
    padding: "28px 24px",
    borderRadius: "24px",
    boxShadow: "0 25px 60px rgba(255, 107, 107, 0.08)",
    border: "1px solid var(--card-border)",
  },

  mainTitle: {
    fontSize: "clamp(24px, 7vw, 36px)",
    fontWeight: "700",
    color: "var(--text-primary)",
    marginBottom: "10px",
  },

  subtitle: {
    fontSize: "16px",
    color: "var(--text-secondary)",
    margin: 0,
  },

  section: {
    marginBottom: "40px",
  },

  sectionTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "var(--text-primary)",
    marginBottom: "20px",
    paddingBottom: "12px",
    borderBottom: "3px solid var(--food-primary)",
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
    border: "1px solid var(--card-border)",
    background: "var(--card-bg)",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
    color: "var(--text-primary)",
    boxShadow: "0 10px 30px rgba(255, 107, 107, 0.04)",
  },
  sectionCardActive: {
    borderColor: "var(--food-primary)",
    background: "rgba(255, 107, 107, 0.05)",
    boxShadow: "0 18px 42px rgba(255, 107, 107, 0.12)",
  },

  sectionCardIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    background: "rgba(255, 107, 107, 0.1)",
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
    background: "var(--card-bg)",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(255, 107, 107, 0.04)",
    textAlign: "center",
    transition: "all 0.3s ease",
    cursor: "pointer",
    border: "1px solid var(--card-border)",
  },
  statCardHighlight: {
    background: "linear-gradient(135deg, var(--food-primary) 0%, #ff9f43 100%)",
    color: "#ffffff",
    boxShadow: "0 8px 16px rgba(255, 107, 107, 0.2)",
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



  analysisCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "20px",
    background: "var(--card-bg)",
    backdropFilter: "blur(12px)",
    padding: "28px",
    borderRadius: "18px",
    boxShadow: "0 20px 45px rgba(255, 107, 107, 0.08)",
    border: "1px solid var(--card-border)",
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
    gap: "clamp(20px, 5vw, 30px)",
    background: "linear-gradient(135deg, var(--food-primary) 0%, #ff9f43 100%)",
    color: "#ffffff",
    padding: "clamp(20px, 4vw, 30px)",
    borderRadius: "16px",
    boxShadow: "0 8px 16px rgba(255, 107, 107, 0.2)",
    flexWrap: "wrap",
  },

  calorieContent: {
    flex: 1,
    minWidth: "200px",
  },

  calorieLabel: {
    fontSize: "clamp(12px, 2.5vw, 14px)",
    opacity: 0.9,
    margin: "0 0 10px 0",
    fontWeight: "500",
  },

  calorieValue: {
    fontSize: "clamp(16px, 8vw, 24px)",
    fontWeight: "500",
    margin: "0 0 5px 0",
    lineHeight: "1.1",
  },

  calorieSubtext: {
    fontSize: "clamp(11px, 2vw, 13px)",
    opacity: 0.8,
    margin: 0,
  },

  calorieChart: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "120px",
  },

  calorieBar: {
    width: "clamp(80px, 15vw, 120px)",
    height: "clamp(80px, 15vw, 120px)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "clamp(16px, 3vw, 24px)",
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
    padding: "16px 20px",
    background: "var(--card-bg)",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(255, 107, 107, 0.05)",
    transition: "all 0.3s ease",
    borderLeft: "4px solid var(--food-primary)",
    border: "1px solid var(--card-border)",
  },

  workoutNumber: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    background: "var(--food-primary)",
    color: "#ffffff",
    borderRadius: "50%",
    fontWeight: "700",
    fontSize: "14px",
    flexShrink: 0,
  },

  workoutText: {
    color: "var(--text-primary)",
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
    background: "var(--card-bg)",
    border: "1px solid var(--card-border)",
  },

  mealTitle: {
    fontSize: "18px",
    fontWeight: "700",
    margin: "0 0 12px 0",
    color: "var(--text-primary)",
  },

  mealContent: {
    color: "var(--text-secondary)",
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
    background: "var(--card-bg)",
    backdropFilter: "blur(4px)",
    padding: "20px",
    borderRadius: "14px",
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.06)",
    transition: "all 0.3s ease",
    borderLeft: "4px solid #10b981",
    border: "1px solid var(--card-border)",
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
    borderRadius: "14px",
    border: "1px solid var(--card-border)",
    background: "var(--card-bg)",
    color: "var(--food-primary)",
    fontWeight: "600",
    cursor: "pointer",
    minWidth: "110px",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 6px rgba(255, 107, 107, 0.05)",
  },


  tipIcon: {
    fontSize: "24px",
    minWidth: "30px",
    textAlign: "center",
  },

  tipText: {
    color: "var(--text-secondary)",
    margin: 0,
    fontSize: "14.5px",
    lineHeight: "1.6",
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
    background: "var(--food-primary)",
    color: "var(--button-text)",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "700",
    transition: "all 0.3s ease",
    boxShadow: "0 8px 16px rgba(255, 107, 107, 0.2)",
  },

  secondaryButton: {
    padding: "14px 32px",
    background: "var(--card-bg)",
    color: "var(--food-primary)",
    border: "2px solid var(--food-primary)",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "700",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 6px rgba(255, 107, 107, 0.1)",
  },

  downloadButton: {
    padding: "14px 32px",
    background: "var(--food-secondary)",
    color: "var(--button-text)",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "700",
    transition: "all 0.3s ease",
    boxShadow: "0 8px 16px rgba(76, 209, 55, 0.3)",
  },

  planContent: {
    background: "var(--card-bg)",
    backdropFilter: "blur(12px)",
    borderRadius: "24px",
    padding: "clamp(16px, 4vw, 32px)",
    boxShadow: "0 25px 70px rgba(255, 107, 107, 0.08)",
    border: "1px solid var(--card-border)",
  },

  emptyState: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "70vh",
    background: "linear-gradient(135deg, var(--bg-start), var(--bg-mid), var(--bg-end))",
  },

  emptyStateCard: {
    textAlign: "center",
    padding: "50px",
    background: "var(--card-bg)",
    backdropFilter: "blur(12px)",
    borderRadius: "24px",
    boxShadow: "0 20px 40px rgba(255, 107, 107, 0.08)",
    border: "1px solid var(--card-border)",
    maxWidth: "400px",
  },

  emptyIcon: {
    fontSize: "60px",
    marginBottom: "20px",
  },
  // Smart Swap Styles
  swapBtn: {
    padding: "6px",
    borderRadius: "8px",
    border: "none",
    background: "rgba(255, 255, 255, 0.6)",
    color: "var(--text-secondary)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s ease",
    marginLeft: "10px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
    padding: "20px",
  },
  modalContent: {
    background: "var(--card-bg)",
    borderRadius: "24px",
    padding: "24px",
    width: "100%",
    maxWidth: "450px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    border: "1px solid var(--card-border)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "var(--text-primary)",
    margin: 0,
  },
  modalSubtitle: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    marginBottom: "12px",
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "var(--text-secondary)",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
  },
  loadingState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    padding: "40px 0",
    color: "var(--text-secondary)",
  },
  alternativesList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxHeight: "300px",
    overflowY: "auto",
    marginBottom: "20px",
    paddingRight: "5px",
  },
  alternativeItem: {
    padding: "16px",
    borderRadius: "12px",
    border: "2px solid var(--card-border)",
    cursor: "pointer",
    fontSize: "14.5px",
    lineHeight: "1.5",
    color: "var(--text-primary)",
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s ease",
  },
  applyBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "var(--food-primary)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "16px",
    boxShadow: "0 8px 16px rgba(255, 107, 107, 0.2)",
  },
  errorText: {
    color: "#ef4444",
    textAlign: "center",
    padding: "20px 0",
    fontWeight: "500",
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
    .plan-content-responsive {
      padding: 16px !important;
    }

    .summary-grid-responsive {
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)) !important;
    }

    .calorie-card-responsive {
      flex-direction: column;
      text-align: center;
    }
  }
`;
if (typeof document !== "undefined") {
  document.head.appendChild(styleSheet);
}

export default Recommendation;