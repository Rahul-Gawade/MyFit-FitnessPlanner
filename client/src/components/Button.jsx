import { useState } from "react";

const Button = ({ text, onClick }) => {
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "12px 20px",
        borderRadius: "10px",
        border: "none",
        background: hover ? "#1e40af" : "#2563eb",
        color: "#fff",
        cursor: "pointer",
        transform: hover ? "scale(1.05)" : "scale(1)",
        transition: "0.3s",
      }}
    >
      {text}
    </button>
  );
};

export default Button;