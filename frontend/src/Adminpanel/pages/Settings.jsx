import React, { useState, useEffect, useCallback } from "react";
import { User, Lock, Bell, Shield, Globe, CreditCard, Save, Eye, EyeOff, Check, Loader2 } from "lucide-react";
import adminAxios from "../utils/adminAxios";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "platform", label: "Platform", icon: Globe },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "permissions", label: "Permissions", icon: Shield },
];

const Toggle = ({ enabled, onChange }) => (
  <button type="button" onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${enabled ? "bg-[#2D6A4F]" : "bg-gray-200"}`}>
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
  </button>
);

const Field = ({ label, value, onChange, type = "text", disabled = false }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
    <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} type={type} disabled={disabled}
      className={`w-full px-4 py-2.5 rounded-xl text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#52B788]/40 transition ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#F0F7F4]"}`} />
  </div>
);

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Profile (Admin doc)
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", bio: "" });

  // Security (password change form — not persisted until submit)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });

  // Platform settings (PlatformSettings doc)
  const [platform, setPlatform] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [profileRes, platformRes] = await Promise.all([
        adminAxios.get("/settings/profile"),
        adminAxios.get("/settings/platform"),
      ]);
      const a = profileRes.data.admin;
      setProfile({ name: a.name || "", email: a.email || "", phone: a.phone || "", bio: a.bio || "" });
      setPlatform(platformRes.data.settings);
    } catch (err) {
      console.error("Failed to load settings:", err);
      setError(err.response?.data?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await adminAxios.put("/settings/profile", {
        name: profile.name, phone: profile.phone, bio: profile.bio,
      });
      flashSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMsg({ type: "", text: "" });
    setSaving(true);
    try {
      await adminAxios.put("/settings/password", passwordForm);
      setPasswordMsg({ type: "success", text: "Password updated successfully" });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordMsg({ type: "error", text: err.response?.data?.message || "Failed to update password" });
    } finally {
      setSaving(false);
    }
  };

  const patchPlatform = (section, key, value) => {
    setPlatform((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  };

  const handleSavePlatformSection = async (section) => {
    setSaving(true);
    try {
      const body = section === "maintenanceMode"
        ? { maintenanceMode: platform.maintenanceMode }
        : { [section]: platform[section] };
      const { data } = await adminAxios.put("/settings/platform", body);
      setPlatform(data.settings);
      flashSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading settings...
        </div>
      );
    }

    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <h2 className="font-semibold text-gray-800 text-lg">Profile Settings</h2>
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#52B788] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {profile.name ? profile.name.slice(0, 2).toUpperCase() : "AD"}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{profile.name || "Admin"}</p>
                <p className="text-xs text-gray-400 mt-0.5">{profile.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Name" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} />
              <Field label="Email Address" value={profile.email} disabled />
              <Field label="Phone Number" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} />
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Bio</label>
                <textarea rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#F0F7F4] rounded-xl text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#52B788]/40 transition resize-none" />
              </div>
            </div>
            <button onClick={handleSaveProfile} disabled={saving}
              className="flex items-center gap-2 bg-[#2D6A4F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1B4332] transition-colors disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Profile
            </button>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <h2 className="font-semibold text-gray-800 text-lg">Security Settings</h2>
            {passwordMsg.text && (
              <div className={`text-sm rounded-xl px-4 py-2.5 ${passwordMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                {passwordMsg.text}
              </div>
            )}
            <div className="space-y-4">
              {[
                { key: "currentPassword", label: "Current Password", placeholder: "Enter current password" },
                { key: "newPassword", label: "New Password", placeholder: "Enter new password" },
                { key: "confirmPassword", label: "Confirm New Password", placeholder: "Confirm new password" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} placeholder={f.placeholder}
                      value={passwordForm[f.key]}
                      onChange={(e) => setPasswordForm({ ...passwordForm, [f.key]: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#F0F7F4] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#52B788]/40 pr-10 transition" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleChangePassword} disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword}
              className="flex items-center gap-2 bg-[#2D6A4F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1B4332] transition-colors disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />} Update Password
            </button>
          </div>
        );

      case "notifications": {
        const n = platform?.notifications || {};
        return (
          <div className="space-y-6">
            <h2 className="font-semibold text-gray-800 text-lg">Notification Preferences</h2>
            <div className="space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Notifications</p>
              {[
                { key: "emailOnNewCampaign", label: "New Campaign Submissions", desc: "Get notified when a new campaign is submitted for review" },
                { key: "emailOnLargeDonation", label: "Large Donations", desc: `Email when a donation exceeds ₹${(n.largeDonationThreshold ?? 50000).toLocaleString("en-IN")}` },
                { key: "emailOnKycSubmission", label: "KYC Submissions", desc: "Notify when a creator submits KYC documents" },
                { key: "emailOnFraudAlert", label: "Fraud Alerts", desc: "Immediate email for critical fraud flags" },
              ].map((f) => (
                <div key={f.key} className="flex items-center justify-between gap-4 p-4 bg-[#F0F7F4] rounded-2xl">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">{f.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                  </div>
                  <Toggle enabled={!!n[f.key]} onChange={(v) => patchPlatform("notifications", f.key, v)} />
                </div>
              ))}
              <div className="max-w-xs">
                <Field label="Large Donation Threshold (₹)" type="number" value={n.largeDonationThreshold}
                  onChange={(v) => patchPlatform("notifications", "largeDonationThreshold", Number(v))} />
              </div>
            </div>
            <button onClick={() => handleSavePlatformSection("notifications")} disabled={saving}
              className="flex items-center gap-2 bg-[#2D6A4F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1B4332] transition-colors disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Preferences
            </button>
          </div>
        );
      }

      case "platform": {
        const g = platform?.general || {};
        const c = platform?.campaigns || {};
        return (
          <div className="space-y-6">
            <h2 className="font-semibold text-gray-800 text-lg">Platform Settings</h2>

            <div className={`flex items-center justify-between gap-4 p-4 rounded-2xl border ${platform?.maintenanceMode ? "bg-red-50 border-red-100" : "bg-[#F0F7F4] border-transparent"}`}>
              <div className="min-w-0">
                <p className={`text-sm font-medium ${platform?.maintenanceMode ? "text-red-800" : "text-gray-800"}`}>Maintenance Mode</p>
                <p className="text-xs text-gray-500 mt-0.5">Puts the platform in maintenance mode. Users cannot access the site.</p>
              </div>
              <Toggle enabled={!!platform?.maintenanceMode} onChange={(v) => setPlatform((p) => ({ ...p, maintenanceMode: v }))} />
            </div>

            <div className="flex items-center justify-between gap-4 p-4 bg-[#F0F7F4] rounded-2xl">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800">Require Admin Approval for Campaigns</p>
                <p className="text-xs text-gray-500 mt-0.5">Campaigns must be reviewed before going live</p>
              </div>
              <Toggle enabled={!!c.requireAdminApproval} onChange={(v) => patchPlatform("campaigns", "requireAdminApproval", v)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Field label="Platform Name" value={g.platformName} onChange={(v) => patchPlatform("general", "platformName", v)} />
              <Field label="Support Email" value={g.supportEmail} onChange={(v) => patchPlatform("general", "supportEmail", v)} />
              <Field label="Currency" value={g.currency} onChange={(v) => patchPlatform("general", "currency", v)} />
              <Field label="Timezone" value={g.timezone} onChange={(v) => patchPlatform("general", "timezone", v)} />
              <Field label="Max Campaign Duration (days)" type="number" value={c.maxDurationDays} onChange={(v) => patchPlatform("campaigns", "maxDurationDays", Number(v))} />
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => handleSavePlatformSection("general")} disabled={saving}
                className="flex items-center gap-2 bg-[#2D6A4F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1B4332] transition-colors disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save General
              </button>
              <button onClick={() => handleSavePlatformSection("campaigns")} disabled={saving}
                className="flex items-center gap-2 bg-[#F0F7F4] text-[#2D6A4F] px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#D8F3DC] transition-colors disabled:opacity-60">
                Save Campaign Rules
              </button>
              <button onClick={() => handleSavePlatformSection("maintenanceMode")} disabled={saving}
                className="flex items-center gap-2 bg-red-50 text-red-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-60">
                Save Maintenance Mode
              </button>
            </div>
          </div>
        );
      }

      case "payment": {
        const p = platform?.payments || {};
        return (
          <div className="space-y-6">
            <h2 className="font-semibold text-gray-800 text-lg">Payment Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Platform Fee (%)" type="number" value={p.platformFeePercent} onChange={(v) => patchPlatform("payments", "platformFeePercent", Number(v))} />
              <Field label="Minimum Donation (₹)" type="number" value={p.minDonationAmount} onChange={(v) => patchPlatform("payments", "minDonationAmount", Number(v))} />
              <Field label="Payout Schedule (days)" type="number" value={p.payoutScheduleDays} onChange={(v) => patchPlatform("payments", "payoutScheduleDays", Number(v))} />
              <Field label="Gateway Provider" value={p.gatewayProvider} onChange={(v) => patchPlatform("payments", "gatewayProvider", v)} />
            </div>
            <button onClick={() => handleSavePlatformSection("payments")} disabled={saving}
              className="flex items-center gap-2 bg-[#2D6A4F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1B4332] transition-colors disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Payment Settings
            </button>
          </div>
        );
      }

      case "permissions":
        return (
          <div className="space-y-6">
            <h2 className="font-semibold text-gray-800 text-lg">Role Permissions</h2>
            <p className="text-xs text-gray-400 -mt-3">Reference only — roles are fixed at the account level.</p>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332]">Settings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage platform configuration and admin preferences</p>
        </div>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-xl">
            <Check className="w-4 h-4" /> Saved!
          </span>
        )}
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{error}</div>}

      <div className="flex flex-col md:flex-row gap-4 md:gap-5">
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

        <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
