import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignupFlow from "./components/SignupFlow";
import DonorPanel from "./components/DonorPanel";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Render a blank page at the root since the landing page will be built later */}
        <Route path="/" element={<div className="min-h-screen bg-bg-light" />} />
        
        {/* Render the signup flow only at /signup */}
        <Route path="/signup" element={<SignupFlow />} />

        {/* Render the donor panel dashboard */}
        <Route path="/donor-panel" element={<DonorPanel />} />
        
        {/* Fallback to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;