import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import AICoach from "./pages/AICoach";
import Home from "./pages/Home";
import BMI from "./pages/BMI";
import Recommendation from "./pages/Recommendation";
import HealthTracker from "./pages/HealthTracker";
import Header from "./components/Header";
import Signup from "./pages/Signup";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ai" element={<AICoach />} />
        <Route path="/home" element={<Home />} />
        <Route path="/bmi" element={<BMI />} />
        <Route path="/recommendation" element={<Recommendation />} />
        <Route path="/health" element={<HealthTracker />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
   
    </>
  );
}

export default App;