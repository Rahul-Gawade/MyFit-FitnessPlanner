import { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [plan, setPlanState] = useState(null);
  const [medicationList, setMedicationList] = useState([]);
  const [symptomLogs, setSymptomLogs] = useState([]);

  // ✅ Load saved state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("plan");
      if (saved) {
        setPlanState(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error parsing plan:", error);
      localStorage.removeItem("plan");
    }

    try {
      const savedMeds = localStorage.getItem("medicationList");
      if (savedMeds) {
        setMedicationList(JSON.parse(savedMeds));
      }
    } catch (error) {
      console.error("Error parsing medication list:", error);
      localStorage.removeItem("medicationList");
    }

    try {
      const savedSymptoms = localStorage.getItem("symptomLogs");
      if (savedSymptoms) {
        setSymptomLogs(JSON.parse(savedSymptoms));
      }
    } catch (error) {
      console.error("Error parsing symptom logs:", error);
      localStorage.removeItem("symptomLogs");
    }
  }, []);

  const saveState = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  // ✅ Custom setter (auto-save to localStorage)
  const setPlan = (newPlan) => {
    setPlanState(newPlan);
    saveState("plan", newPlan);
  };

  const addMedication = (medication) => {
    const updated = [...medicationList, medication];
    setMedicationList(updated);
    saveState("medicationList", updated);
  };

  const removeMedication = (id) => {
    const updated = medicationList.filter((item) => item.id !== id);
    setMedicationList(updated);
    saveState("medicationList", updated);
  };

  const addSymptomLog = (log) => {
    const updated = [log, ...symptomLogs];
    setSymptomLogs(updated);
    saveState("symptomLogs", updated);
  };

  const removeSymptomLog = (id) => {
    const updated = symptomLogs.filter((item) => item.id !== id);
    setSymptomLogs(updated);
    saveState("symptomLogs", updated);
  };

  // ✅ Optional: clear plan (useful for logout/reset)
  const clearPlan = () => {
    setPlanState(null);
    localStorage.removeItem("plan");
  };

  return (
    <AppContext.Provider
      value={{
        plan,
        setPlan,
        clearPlan,
        medicationList,
        addMedication,
        removeMedication,
        symptomLogs,
        addSymptomLog,
        removeSymptomLog,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};