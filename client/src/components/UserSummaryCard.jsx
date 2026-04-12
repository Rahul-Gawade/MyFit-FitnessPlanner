import React from "react";

const UserSummaryCard = ({ userSummary }) => {
  return (
    <div className="summary-card">
      <h2>User Summary</h2>
      <div className="summary-grid">
        <p><strong>Age:</strong> {userSummary.age}</p>
        <p><strong>Gender:</strong> {userSummary.gender}</p>
        <p><strong>Height:</strong> {userSummary.height} cm</p>
        <p><strong>Weight:</strong> {userSummary.weight} kg</p>
        <p><strong>BMI:</strong> {userSummary.bmi}</p>
        <p><strong>Goal:</strong> {userSummary.goal}</p>
      </div>
    </div>
  );
};

export default UserSummaryCard;
