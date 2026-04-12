import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./context/AppContext";  // ✅ import

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AppProvider>   {/* ✅ ADD THIS */}
      <App />
    </AppProvider>
  </BrowserRouter>
);