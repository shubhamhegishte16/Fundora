import React, { useState } from "react";
import { User, Lock, Bell, Shield, Globe, CreditCard, Save, Eye, EyeOff, Upload, Check } from "lucide-react";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "platform", label: "Platform", icon: Globe },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "permissions", label: "Permissions", icon: Shield },
];

const Toggle = ({ enabled, onChange }) => (
  <button onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${enabled ? "bg-[#2D6A4F]" : "bg-gray-200"}`}>
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
  </button>
);

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [notifSettings, setNotifSettings] = useState({
    emailCampaign: true, emailDonation: true, emailKYC: true, emailFraud: true,
    inAppAll: true, inAppSound: false, digestEmail: false,
  });
  const [platformSettings, setPlatformSettings] = useState({
    maintenanceMode: false, newRegistrations: true, campaignCreation: true,
    anonymousDonations: true, autoApprove: false, kycRequired: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <h2 className="font-semibold text-gray-800 text-lg">Profile Settings</h2>
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#52B788] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                AD
              </div>
              <div>
                <button className="flex items-center gap-2 bg-[#F0F7F4] text-[#2D6A4F] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#D8F3DC] transition-colors">
                  <Upload className="w-4 h-4" /> Change Avatar
                </button>
                <p className="text-xs text-gray-400 mt-1.5">JPG, PNG or GIF. Max 2MB</p>
              </div>
            </div>
            {/* Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "First Name", value: "Admin", type: "text" },
                { label: "Last Name", value: "User", type: "text" },
                { label: "Email Address", value: "admin@fundforward.in", type: "email" },
                { label: "Phone Number", value: "+91 98765 43210", type: "tel" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
                  <input defaultValue={f.value} type={f.type}
                    className="w-full px-4 py-2.5 bg-[#F0F7F4] rounded-xl text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#52B788]/40 transition" />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Bio</label>
                <textarea rows={3} defaultValue="Platform administrator for FundForward."
                  className="w-full px-4 py-2.5 bg-[#F0F7F4] rounded-xl text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#52B788]/40 transition resize-none" />
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <h2 className="font-semibold text-gray-800 text-lg">Security Settings</h2>
            <div className="space-y-4">
              {[
                { label: "Current Password", placeholder: "Enter current password" },
                { label: "New Password", placeholder: "Enter new password" },
                { label: "Confirm New Password", placeholder: "Confirm new password" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} placeholder={f.placeholder}
                      className="w-full px-4 py-2.5 bg-[#F0F7F4] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#52B788]/40 pr-10 transition" />
                    <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#F0F7F4] rounded-2xl p-4 space-y-3">
              <p className="text-sm font-semibold text-[#1B4332]">Two-Factor Authentication</p>
              <p className="text-xs text-gray-500">Add an extra layer of security to your admin account.</p>
              <button className="bg-[#2D6A4F] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1B4332] transition-colors">
                Enable 2FA
              </button>
            </div>

            <div className="border border-gray-100 rounded-2xl p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-800">Active Sessions</p>
              {[
                { device: "Chrome on MacOS", location: "Mumbai, India", time: "Current session" },
                { device: "Safari on iPhone", location: "Mumbai, India", time: "2 hr ago" },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between gap-3 py-2.5 border-t border-gray-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{s.device}</p>
                    <p className="text-xs text-gray-400 truncate">{s.location} · {s.time}</p>
                  </div>
                  {i !== 0 && <button className="text-xs text-red-500 hover:underline font-medium flex-shrink-0">Revoke</button>}
                  {i === 0 && <span className="text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-medium flex-shrink-0">Active</span>}
                </div>
              ))}
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <h2 className="font-semibold text-gray-800 text-lg">Notification Preferences</h2>
            <div className="space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Notifications</p>
              {[
                { key: "emailCampaign", label: "New Campaign Submissions", desc: "Get notified when a new campaign is submitted for review" },
                { key: "emailDonation", label: "Large Donations", desc: "Email when a donation exceeds ₹5,000" },
                { key: "emailKYC", label: "KYC Submissions", desc: "Notify when a user submits KYC documents" },
                { key: "emailFraud", label: "Fraud Alerts", desc: "Immediate email for critical fraud flags" },
              ].map((n) => (
                <div key={n.key} className="flex items-center justify-between gap-4 p-4 bg-[#F0F7F4] rounded-2xl">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">{n.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.desc}</p>
                  </div>
                  <Toggle enabled={notifSettings[n.key]} onChange={(v) => setNotifSettings({ ...notifSettings, [n.key]: v })} />
                </div>
              ))}
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider pt-2">In-App</p>
              {[
                { key: "inAppAll", label: "All In-App Notifications", desc: "Show notifications in the notification bell" },
                { key: "inAppSound", label: "Notification Sound", desc: "Play sound for new notifications" },
                { key: "digestEmail", label: "Daily Digest Email", desc: "Receive a daily summary at 9:00 AM" },
              ].map((n) => (
                <div key={n.key} className="flex items-center justify-between gap-4 p-4 bg-[#F0F7F4] rounded-2xl">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">{n.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.desc}</p>
                  </div>
                  <Toggle enabled={notifSettings[n.key]} onChange={(v) => setNotifSettings({ ...notifSettings, [n.key]: v })} />
                </div>
              ))}
            </div>
          </div>
        );

      case "platform":
        return (
          <div className="space-y-6">
            <h2 className="font-semibold text-gray-800 text-lg">Platform Settings</h2>
            <div className="space-y-3">
              {[
                { key: "maintenanceMode", label: "Maintenance Mode", desc: "Puts the platform in maintenance mode. Users cannot access the site.", danger: true },
                { key: "newRegistrations", label: "Allow New Registrations", desc: "Enable or disable new user signups" },
                { key: "campaignCreation", label: "Allow Campaign Creation", desc: "Let creators start new campaigns" },
                { key: "anonymousDonations", label: "Allow Anonymous Donations", desc: "Donors can choose to donate anonymously" },
                { key: "autoApprove", label: "Auto-Approve Campaigns", desc: "Skip manual review and approve campaigns automatically", danger: true },
                { key: "kycRequired", label: "Require KYC for Creators", desc: "Campaign creators must complete KYC before publishing" },
              ].map((s) => (
                <div key={s.key} className={`flex items-center justify-between gap-4 p-4 rounded-2xl border ${s.danger ? "bg-red-50 border-red-100" : "bg-[#F0F7F4] border-transparent"}`}>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${s.danger ? "text-red-800" : "text-gray-800"}`}>{s.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                  </div>
                  <Toggle enabled={platformSettings[s.key]} onChange={(v) => setPlatformSettings({ ...platformSettings, [s.key]: v })} />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {[
                { label: "Platform Fee (%)", value: "5" },
                { label: "Min Donation (₹)", value: "100" },
                { label: "Max Campaign Duration (days)", value: "120" },
                { label: "Min Funding Goal (₹)", value: "10000" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
                  <input defaultValue={f.value} type="number"
                    className="w-full px-4 py-2.5 bg-[#F0F7F4] rounded-xl text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#52B788]/40 transition" />
                </div>
              ))}
            </div>
          </div>
        );

      case "payment":
        return (
          <div className="space-y-6">
            <h2 className="font-semibold text-gray-800 text-lg">Payment Gateway Settings</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-sm font-semibold text-amber-800">Mock Payment Mode Active</p>
              <p className="text-xs text-amber-600 mt-0.5">This is a demo environment. No real transactions are processed.</p>
            </div>
            {[
              { label: "Razorpay API Key", value: "rzp_test_xxxxxxxxxx", type: "password" },
              { label: "Razorpay Secret", value: "rzp_secret_xxxxxxxxxx", type: "password" },
              { label: "Webhook URL", value: "https://api.fundforward.in/webhooks/payment", type: "text" },
              { label: "Refund Handling Email", value: "payments@fundforward.in", type: "email" },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
                <input defaultValue={f.value} type={f.type}
                  className="w-full px-4 py-2.5 bg-[#F0F7F4] rounded-xl text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#52B788]/40 transition" />
              </div>
            ))}
          </div>
        );

      case "permissions":
        return (
          <div className="space-y-6">
            <h2 className="font-semibold text-gray-800 text-lg">Role Permissions</h2>
            {[
              { role: "Admin", color: "bg-[#D8F3DC] text-[#2D6A4F]", perms: ["Manage Users", "Approve Campaigns", "View Analytics", "Handle Fraud", "Manage Settings", "Export Reports"] },
              { role: "Campaign Creator", color: "bg-purple-100 text-purple-700", perms: ["Create Campaigns", "Post Updates", "View Own Analytics", "KYC Verification"] },
              { role: "Donor", color: "bg-blue-100 text-blue-700", perms: ["Browse Campaigns", "Make Donations", "View History", "Download Receipts"] },
            ].map((r) => (
              <div key={r.role} className="border border-gray-100 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${r.color}`}>{r.role}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.perms.map((p) => (
                    <span key={p} className="flex items-center gap-1.5 bg-[#F0F7F4] text-gray-700 text-xs font-medium px-3 py-1.5 rounded-xl">
                      <Check className="w-3 h-3 text-[#2D6A4F]" /> {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1B4332]">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage platform configuration and admin preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-5">
        {/* Tabs — horizontal scroll strip on mobile, vertical list from md up */}
        <div className="md:w-48 md:flex-shrink-0">
          <div className="flex md:flex-col gap-1.5 md:gap-1 overflow-x-auto md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0 pb-1 md:pb-0 scrollbar-hide">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 md:gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 md:w-full md:whitespace-normal
                  ${activeTab === t.id ? "bg-[#2D6A4F] text-white shadow-sm" : "text-gray-600 bg-gray-50 md:bg-transparent hover:bg-[#F0F7F4]"}`}>
                <t.icon className="w-4 h-4 flex-shrink-0" /> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          {renderContent()}

          <div className="mt-8 pt-5 border-t border-gray-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button className="text-sm text-gray-500 hover:text-gray-700">Reset to defaults</button>
            <button onClick={handleSave}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${saved ? "bg-green-500 text-white" : "bg-[#2D6A4F] text-white hover:bg-[#1B4332]"}`}>
              {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}