import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignupFlow from "./components/SignupFlow";
import LoginFlow from "./components/LoginFlow";
import DonorPanel from "./components/DonorPanel";
import CreatorPanel from "./components/CreatorPanel";
import DonorProfile from "./components/DonorProfile";
import DonorReward from "./components/DonorRewardSection";

// Blank Landing Page for now
const LandingPage = () => <div className="min-h-screen bg-bg-light" />;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Render the landing page at root */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Render the signup flow only at /signup */}
        <Route path="/signup" element={<SignupFlow />} />

        {/* Render the login flow only at /login */}
        <Route path="/login" element={<LoginFlow />} />

        {/* Render the donor panel dashboard */}
        <Route path="/donordashboard" element={<DonorPanel />} />

        {/* Render the donor profile */}
        <Route path="/donorprofile" element={<DonorProfile />} />

        <Route path="/donorreward" element={<DonorReward/>}/>

        {/* Redirect old hyphenated routes to the new paths */}
        <Route path="/donor-panel" element={<Navigate to="/donordashboard" replace />} />
        <Route path="/donor-profile" element={<Navigate to="/donorprofile" replace />} />
        <Route path="/donor-reward" element={<Navigate to="/donorreward" replace />} />

        {/* Render the creator panel dashboard */}
        <Route path="/creator-panel" element={<CreatorPanel />} />
        
        {/* Fallback to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;