import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Users, Megaphone, BarChart3, ShieldAlert,
  FileText, BadgeCheck, Settings, LogOut, HandCoins, Bell,
  ChevronLeft, ChevronRight
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { label: "Users", icon: Users, path: "/admin/users" },
  { label: "Campaigns", icon: Megaphone, path: "/admin/campaigns" },
  { label: "Donations", icon: HandCoins, path: "/admin/donations" },
  { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { label: "Fraud Alerts", icon: ShieldAlert, path: "/admin/fraud-alert" },
  { label: "Reports", icon: FileText, path: "/admin/reports" },
  { label: "KYC", icon: BadgeCheck, path: "/admin/kyc" },
  { label: "Notifications", icon: Bell, path: "/admin/notifications" },
  { label: "Settings", icon: Settings, path: "/admin/settings" },
];

// Inline SVG illustration for the sidebar bottom accent
const SidebarIllustration = () => (
  <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full opacity-20">
    <ellipse cx="60" cy="72" rx="52" ry="8" fill="#95D5B2" />
    {/* Ground */}
    <rect x="55" y="30" width="4" height="42" rx="2" fill="#52B788" />
    {/* Main stem */}
    <path d="M57 50 Q40 40 30 20 Q50 22 57 45" fill="#52B788" />
    {/* Left leaf */}
    <path d="M57 38 Q75 28 85 10 Q65 14 57 35" fill="#74C69D" />
    {/* Right leaf */}
    <path d="M58 55 Q42 48 28 42 Q44 36 58 52" fill="#40916C" />
    {/* Small leaf right */}
    <path d="M58 44 Q72 38 80 28 Q66 30 58 42" fill="#52B788" />
    {/* Roots */}
    <path d="M57 68 Q50 65 44 68" stroke="#40916C" strokeWidth="2" strokeLinecap="round" />
    <path d="M60 68 Q60 66 60 70" stroke="#40916C" strokeWidth="2" strokeLinecap="round" />
    <path d="M63 68 Q70 65 76 68" stroke="#40916C" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default function Sidebar({ open, setOpen }) {
  return (
    <aside
      className={`relative flex flex-col transition-all duration-300 min-h-screen ${open ? "w-56" : "w-[68px]"}`}
      style={{ background: "linear-gradient(170deg, #1B4332 0%, #2D6A4F 100%)" }}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-6 ${!open && "justify-center"}`}>
        <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <path d="M12 22C12 22 4 16 4 9a8 8 0 0 1 16 0c0 7-8 13-8 13z" fill="white" fillOpacity="0.9" />
            <path d="M12 9 Q9 6 7 8 Q10 8 12 12" fill="#52B788" />
            <path d="M12 9 Q15 6 17 8 Q14 8 12 12" fill="#74C69D" />
          </svg>
        </div>
        {open && (
          <div>
            <p className="text-white font-bold text-base tracking-wide leading-none">Elpis</p>
            <p className="text-green-300/70 text-[9px] font-medium tracking-widest uppercase mt-0.5">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/10 mb-3" />

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5">
        {navItems.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group
              ${isActive
                ? "bg-white/18 text-white"
                : "text-white/55 hover:bg-white/8 hover:text-white/90"
              }
              ${!open && "justify-center"}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isActive ? "text-white" : "text-white/55 group-hover:text-white/80"}`} />
                {open && (
                  <span className={`text-[13px] font-medium truncate transition-colors ${isActive ? "text-white" : "text-white/70 group-hover:text-white/90"}`}>
                    {label}
                  </span>
                )}
                {open && isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-300 flex-shrink-0" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Illustration (only when open) */}
      {open && (
        <div className="px-4 pt-2 pb-1">
          <SidebarIllustration />
        </div>
      )}

      {/* Logout */}
      <div className="px-2 pb-4 border-t border-white/10 pt-3">
        <button
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-white/50 hover:bg-red-500/15 hover:text-red-300 transition-all ${!open && "justify-center"}`}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {open && <span className="text-[13px] font-medium">Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-white border border-gray-100 shadow flex items-center justify-center text-[#2D6A4F] hover:bg-green-50 transition-colors z-10"
      >
        {open ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
    </aside>
  );
}