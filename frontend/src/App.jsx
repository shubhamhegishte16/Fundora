import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignupFlow from "./components/SignupFlow";
import LoginFlow from "./components/LoginFlow";
import DonorPanel from "./components/DonorPanel";
import CreatorPanel from "./components/CreatorPanel";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Render a blank page at the root since the landing page will be built later */}
        <Route path="/" element={<div className="min-h-screen bg-bg-light" />} />
        
        {/* Render the signup flow only at /signup */}
        <Route path="/signup" element={<SignupFlow />} />

        {/* Render the login flow only at /login */}
        <Route path="/login" element={<LoginFlow />} />

        {/* Render the donor panel dashboard */}
        <Route path="/donor-panel" element={<DonorPanel />} />

        {/* Render the creator panel dashboard */}
        <Route path="/creator-panel" element={<CreatorPanel />} />
        
        {/* Fallback to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;