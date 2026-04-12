import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import FormComponent from "./FormComponent";
import PlanResultComponent from "./PlanResultComponent";
import ActionButtonsComponent from "./ActionButtonsComponent";

const Body = () => {
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    goal: "",
    activity_level: "",
    diet_preference: "",
    medical_condition: "",
  });

  const { i18n } = useTranslation();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const resultRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateBMI = () => {
    const heightInMeters = formData.height / 100;
    return (formData.weight / (heightInMeters * heightInMeters)).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const bmi = calculateBMI();

    try {
      const response = await axios.post(
        "http://localhost:5000/generate-plan",
        { ...formData, bmi, language: i18n.language || "en" },
        { headers: { "Content-Type": "application/json" } }
      );
      setPlan(response.data.plan);
    } catch (error) {
      console.error(error);
      alert("Error generating plan");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1 className="title">MyFit - AI Fitness Planner</h1>

      <FormComponent
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        loading={loading}
      />

      {loading && <p className="loading-text">Generating Plan...</p>}

      {plan && (
        <>
          <PlanResultComponent ref={resultRef} plan={plan} />
          <ActionButtonsComponent resultRef={resultRef} />
        </>
      )}
    </div>
  );
};

export default Body;
