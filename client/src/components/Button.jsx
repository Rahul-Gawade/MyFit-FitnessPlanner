import { useState } from "react";

const Button = ({ text, onClick }) => {
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "12px 24px",
        borderRadius: "12px",
        border: "none",
        background: hover ? "var(--food-primary-hover)" : "var(--food-primary)",
        color: "var(--button-text)",
        fontWeight: "600",
        cursor: "pointer",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hover ? "0 8px 15px rgba(255, 107, 107, 0.4)" : "0 4px 6px rgba(255, 107, 107, 0.2)",
        transition: "all 0.3s ease",
      }}
    >
      {text}
    </button>
  );
};

export default Button;