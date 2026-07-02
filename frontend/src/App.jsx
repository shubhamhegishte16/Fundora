import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import SignupFlow from "./components/SignupFlow";
import LoginFlow from "./components/LoginFlow";
import DonorPanel from "./donorpanel/Donordashboard";
import CreatorPanelApp from "./Creatorpanel/CreatorPanelApp";
import DonorProfile from "./donorpanel/DonorProfile";
import DonorReward from "./donorpanel/DonorRewardSection";
import CampaignDetail from "./donorpanel/CampaignDetail";



{/* Admin Imports*/}
import { AdminAuthProvider } from "./Adminpanel/context/AdminAuthContext";
import ProtectedAdminRoute from "./Adminpanel/components/ProtectedAdminRoute";
import AdminLayout from "./Adminpanel/layouts/AdminLayout";
import AdminLogin from "./Adminpanel/pages/AdminLogin";
import Dashboard from "./Adminpanel/pages/Dashboard";
import Analytics from "./Adminpanel/pages/Analytics";
import Managecampaigns from "./Adminpanel/pages/Managecampaigns";
import Manageusers from "./Adminpanel/pages/Manageusers";
import Kycverification from "./Adminpanel/pages/Kycverification";
import Donations from "./Adminpanel/pages/Donations";
import Fraudalert from "./Adminpanel/pages/Fraudalert";
import Notifications from "./Adminpanel/pages/Notifications";
import Reports from "./Adminpanel/pages/Reports";
import Settings from "./Adminpanel/pages/Settings";

const LandingPage = () => <div className="min-h-screen bg-bg-light" />;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupFlow />} />
        <Route path="/login" element={<LoginFlow />} />

        {/* Donor Routes */}
        <Route path="/donordashboard" element={<DonorPanel />} />
        <Route path="/donorprofile" element={<DonorProfile />} />
        <Route path="/donorreward" element={<DonorReward />} />

        <Route path="/CampDetail" element={<CampaignDetail />}/>

        {/* Redirects */}
        <Route
          path="/donor-panel"
          element={<Navigate to="/donordashboard" replace />}
        />
        <Route
          path="/donor-profile"
          element={<Navigate to="/donorprofile" replace />}
        />
        <Route
          path="/donor-reward"
          element={<Navigate to="/donorreward" replace />}
        />

        {/* Creator */}
        <Route path="/creator-panel" element={<CreatorPanelApp />} />

        {/* Admin Login */}
        <Route
          path="/admin/login"
          element={
            <AdminAuthProvider>
              <AdminLogin />
            </AdminAuthProvider>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminAuthProvider>
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            </AdminAuthProvider>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="campaigns" element={<Managecampaigns />} />
          <Route path="users" element={<Manageusers />} />
          <Route path="kyc" element={<Kycverification />} />
          <Route path="donations" element={<Donations />} />
          <Route path="fraud-alert" element={<Fraudalert />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;