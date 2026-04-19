import { createContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [plan, setPlanState] = useState(null);
  const [medicationList, setMedicationList] = useState([]);
  const [symptomLogs, setSymptomLogs] = useState([]);
  const [aiCoachChat, setAiCoachChat] = useState([]);
  const [waterIntake, setWaterIntake] = useState(0);

  // ✅ Load saved state from Supabase/localStorage
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
      
      if (authUser) {
        // Fetch Medications
        const { data: meds } = await supabase
          .from("health_logs")
          .select("data")
          .eq("user_id", authUser.id)
          .eq("type", "medication")
          .order("created_at", { ascending: true });
        
        if (meds) setMedicationList(meds.map(m => m.data).filter(Boolean));

        // Fetch Symptoms
        const { data: symptoms } = await supabase
          .from("health_logs")
          .select("data")
          .eq("user_id", authUser.id)
          .eq("type", "symptom")
          .order("created_at", { ascending: false });
        
        if (symptoms) setSymptomLogs(symptoms.map(s => s.data).filter(Boolean));

        // Fetch Water Intake
        const today = new Date().toISOString().split('T')[0];
        const { data: water } = await supabase
          .from("health_logs")
          .select("data")
          .eq("user_id", authUser.id)
          .eq("type", "water")
          .gte("created_at", today);
        
        if (water && water.length > 0) {
          const total = water.reduce((acc, curr) => acc + (curr.data?.amount || 0), 0);
          setWaterIntake(total);
        }

        // Fetch Chat History
        const { data: chats } = await supabase
          .from("chat_logs")
          .select("data")
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: true });
        
        if (chats) setAiCoachChat(chats.map(c => c.data).filter(Boolean));
      } else {
        // Fallback to localStorage
        try {
          const savedMeds = localStorage.getItem("medicationList");
          if (savedMeds) setMedicationList(JSON.parse(savedMeds));
          const savedSymptoms = localStorage.getItem("symptomLogs");
          if (savedSymptoms) setSymptomLogs(JSON.parse(savedSymptoms));
        } catch (e) {
          console.error("Local storage error:", e);
        }
      }

      try {
        const saved = localStorage.getItem("plan");
        if (saved) setPlanState(JSON.parse(saved));
      } catch (error) {
        console.error("Error parsing plan:", error);
      }
    };

    fetchData();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const saveToSupabase = async (type, data) => {
    if (!user) return;

    if (type === "chat") {
      await supabase.from("chat_logs").insert({
        user_id: user.id,
        data: data,
        created_at: new Date()
      });
    } else {
      await supabase.from("health_logs").insert({
        user_id: user.id,
        type: type,
        data: data,
        created_at: new Date()
      });
    }
  };

  const removeFromSupabase = async (type, id) => {
    if (!user) return;

    await supabase.from("health_logs")
      .delete()
      .eq("user_id", user.id)
      .eq("type", type)
      .filter("data->>id", "eq", id);
  };

  const setPlan = (newPlan) => {
    setPlanState(newPlan);
    localStorage.setItem("plan", JSON.stringify(newPlan));
  };

  const addMedication = async (medication) => {
    const updated = [...medicationList, medication];
    setMedicationList(updated);
    localStorage.setItem("medicationList", JSON.stringify(updated));
    await saveToSupabase("medication", medication);
  };

  const removeMedication = async (id) => {
    const updated = medicationList.filter((item) => item.id !== id);
    setMedicationList(updated);
    localStorage.setItem("medicationList", JSON.stringify(updated));
    await removeFromSupabase("medication", id);
  };

  const addSymptomLog = async (log) => {
    const updated = [log, ...symptomLogs];
    setSymptomLogs(updated);
    localStorage.setItem("symptomLogs", JSON.stringify(updated));
    await saveToSupabase("symptom", log);
  };

  const removeSymptomLog = async (id) => {
    const updated = symptomLogs.filter((item) => item.id !== id);
    setSymptomLogs(updated);
    localStorage.setItem("symptomLogs", JSON.stringify(updated));
    await removeFromSupabase("symptom", id);
  };

  const addWater = async (amount) => {
    const newTotal = waterIntake + amount;
    setWaterIntake(newTotal);
    await saveToSupabase("water", { amount, unit: "ml" });
  };

  const addChatMessage = async (msg) => {
    setAiCoachChat((prev) => [...prev, msg]);
    await saveToSupabase("chat", msg);
  };

  const clearChat = async () => {
    setAiCoachChat([]);
    if (user) {
      await supabase.from("chat_logs").delete().eq("user_id", user.id);
    }
  };

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
        waterIntake,
        addWater,
        aiCoachChat,
        addChatMessage,
        clearChat,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};