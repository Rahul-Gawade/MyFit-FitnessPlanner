import React, { forwardRef } from "react";
import UserSummaryCard from "./UserSummaryCard";

const PlanResultComponent = forwardRef(({ plan }, ref) => {
  if (!plan) return null;

  return (
    <div className="card" ref={ref}>
      <UserSummaryCard userSummary={plan.userSummary} />

      <div className="result-section">
        <h2>BMI Analysis</h2>
        <p>{plan.bmiAnalysis}</p>
      </div>

      <div className="result-section">
        <h2>Daily Calories</h2>
        <p className="calories-highlight">{plan.calories}</p>
      </div>

      <div className="result-section">
        <h2>Workout Plan</h2>
        <ul className="workout-list">
          {plan.workout.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="result-section">
        <h2>Diet Plan</h2>
        <div className="diet-plan">
          <div className="meal">
            <h3>Breakfast</h3>
            <p>{plan.diet.breakfast}</p>
          </div>
          <div className="meal">
            <h3>Lunch</h3>
            <p>{plan.diet.lunch}</p>
          </div>
          <div className="meal">
            <h3>Dinner</h3>
            <p>{plan.diet.dinner}</p>
          </div>
        </div>
      </div>

      <div className="result-section">
        <h2>Health Tips</h2>
        <ul className="health-tips-list">
          {plan.healthTips.map((tip, idx) => (
            <li key={idx}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
});

PlanResultComponent.displayName = "PlanResultComponent";

export default PlanResultComponent;
