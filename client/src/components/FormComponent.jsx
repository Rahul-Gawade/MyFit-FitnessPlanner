import React from "react";

const FormComponent = ({ formData, handleChange, handleSubmit, loading }) => {
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="age"
        placeholder="Age"
        value={formData.age}
        onChange={handleChange}
        required
      />
      <input
        name="gender"
        placeholder="Gender"
        value={formData.gender}
        onChange={handleChange}
        required
      />
      <input
        name="height"
        placeholder="Height (cm)"
        value={formData.height}
        onChange={handleChange}
        required
      />
      <input
        name="weight"
        placeholder="Weight (kg)"
        value={formData.weight}
        onChange={handleChange}
        required
      />
      <input
        name="goal"
        placeholder="Goal"
        value={formData.goal}
        onChange={handleChange}
        required
      />
      <input
        name="activity_level"
        placeholder="Activity Level"
        value={formData.activity_level}
        onChange={handleChange}
        required
      />
      <input
        name="diet_preference"
        placeholder="Diet Preference"
        value={formData.diet_preference}
        onChange={handleChange}
        required
      />
      <input
        name="medical_condition"
        placeholder="Medical Condition"
        value={formData.medical_condition}
        onChange={handleChange}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Generating Plan..." : "Generate Plan"}
      </button>
    </form>
  );
};

export default FormComponent;
