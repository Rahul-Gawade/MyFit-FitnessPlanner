import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const escapeForJson = (value) => {
  if (value === undefined || value === null) return "";
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
};

app.post("/generate-plan", async (req, res) => {
  try {
    const {
      age,
      gender,
      height,
      weight,
      bmi,
      goal,
      activity_level,
      diet_preference,
      medical_condition,
      language,
      healthData,
    } = req.body;

    // Validate required fields
    if (!age || !gender || !height || !weight || !bmi || !goal) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const userLanguage = language || "en";
    const languageLabel = userLanguage === "mr" ? "Marathi" : userLanguage === "hi" ? "Hindi" : "English";

    const medicationText = healthData?.medications?.length
      ? `Current medications:\n${healthData.medications
          .map((med) =>
            `- ${med.name} (${med.dosage}, ${med.frequency})${med.notes ? `: ${med.notes}` : ""}`)
          .join("\n")}`
      : "No current medications.";

    const symptomText = healthData?.symptoms?.length
      ? `Recent symptoms:\n${healthData.symptoms
          .map((symptom) =>
            `- ${symptom.symptom} (Severity: ${symptom.severity}/5)${symptom.notes ? `: ${symptom.notes}` : ""}`)
          .join("\n")}`
      : "No recent symptoms.";

    const prompt = `You are a professional fitness trainer and diet expert.

Return ONLY valid JSON in this exact format:

{
  "userSummary": {
    "age": "${escapeForJson(age)}",
    "gender": "${escapeForJson(gender)}",
    "height": "${escapeForJson(height)}",
    "weight": "${escapeForJson(weight)}",
    "bmi": "${escapeForJson(bmi)}",
    "goal": "${escapeForJson(goal)}",
    "medical_condition": "${escapeForJson(medical_condition || "None") }"
  },
  "bmiAnalysis": "Professional analysis of BMI and health status",
  "calories": "Recommended daily calorie intake with range",
  "workout": ["Exercise day 1", "Exercise day 2", "Exercise day 3", "Exercise day 4"],
  "diet": {
    "breakfast": "Specific breakfast meal recommendation",
    "lunch": "Specific lunch meal recommendation",
    "dinner": "Specific dinner meal recommendation"
  },
  "healthTips": ["Health tip 1", "Health tip 2", "Health tip 3"]
}

User Details:
Age: ${age}
Gender: ${gender}
Height: ${height} cm
Weight: ${weight} kg
BMI: ${bmi}
Goal: ${goal}
Activity Level: ${activity_level || "Not specified"}
Diet Preference: ${diet_preference || "Not specified"}
Medical Condition: ${medical_condition || "None"}

${medicationText}
${symptomText}

Important: Return all results in ${languageLabel} language. If ${languageLabel} is not English, use that language for every field in the JSON output, including bmiAnalysis, calories, workout, diet, and healthTips.

Create a personalized fitness plan based on these details. Adjust workouts, diet, and health tips according to medications and symptoms. If the user has any current symptoms or medications, ensure the plan is safe, gentle, and condition-aware. Keep recommendations professional, practical, and personalized.`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    console.log("AI response:", content);

    // Clean JSON response (remove code blocks if present)
    const cleaned = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const plan = JSON.parse(cleaned);

    res.json({ plan });
  } catch (error) {
    console.error("Plan generation error:", error.message);
    res.status(500).json({ 
      error: "Failed to generate plan",
      details: error.message 
    });
  }
});

app.post("/ai-coach", async (req, res) => {
  try {
    const { message, bmi, goal, medical_condition, healthData, profile, language } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const userLanguage = language || "en";
    const languageLabel = userLanguage === "mr" ? "Marathi" : userLanguage === "hi" ? "Hindi" : "English";

    const medicationText = healthData?.medications?.length
      ? `Current medications:\n${healthData.medications
          .map((med) =>
            `- ${med.name} (${med.dosage}, ${med.frequency})${med.notes ? `: ${med.notes}` : ""}`)
          .join("\n")}`
      : "No current medications.";

    const symptomText = healthData?.symptoms?.length
      ? `Recent symptoms:\n${healthData.symptoms
          .map((symptom) =>
            `- ${symptom.symptom} (Severity: ${symptom.severity}/5)${symptom.notes ? `: ${symptom.notes}` : ""}`)
          .join("\n")}`
      : "No recent symptoms.";

    const waterText = `Daily water intake: ${healthData?.waterIntake || 0} ml (Goal: 3000 ml)`;

    const profileContext = profile 
      ? `- Age: ${profile.age || "Unknown"}
- Gender: ${profile.gender || "Unknown"}
- Height: ${profile.height || "Unknown"}
- Weight: ${profile.weight || "Unknown"}
- BMI: ${profile.bmi || bmi || "Unknown"}
- Fitness Goal: ${profile.goal || goal || "General fitness"}
- Activity Level: ${profile.activity_level || "Unknown"}
- Diet Preference: ${profile.diet_preference || "Unknown"}
- Medical Condition: ${profile.medical_condition || medical_condition || "None"}`
      : `- BMI: ${bmi || "Unknown"}
- Fitness Goal: ${goal || "General fitness"}
- Medical Condition: ${medical_condition || "None"}`;

    const prompt = `You are a friendly AI fitness coach.
IMPORTANT: You MUST respond entirely in the ${languageLabel} language.

User Context:
${profileContext}

${medicationText}
${symptomText}
${waterText}

User Question:
${message}

Guidelines:
- Give short, clear, practical advice (2-3 sentences max)
- Be conversational and encouraging in ${languageLabel}
- Suggest workouts, diet tips, or motivation if relevant
- Adjust guidance for any medical condition if present
- Avoid long paragraphs`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const reply = response.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("AI Coach error:", error.message);
    res.status(500).json({ 
      error: "AI Coach failed",
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on " + PORT));