import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, ChevronDown, Menu, X, User, Settings as SettingsIcon, LogOut } from "lucide-react";

const notifications = [
  { id: 1, text: "New campaign pending approval", time: "2 min ago", unread: true },
  { id: 2, text: "KYC submitted by Rohan Verma", time: "15 min ago", unread: true },
  { id: 3, text: "Fraud flag on Medical Aid Nepal", time: "1 hr ago", unread: false },
];

export default function Header({ sidebarOpen, setSidebarOpen }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  const goTo = (path) => {
    setProfileOpen(false);
    navigate(path);
  };

  const handleSignOut = () => {
    setProfileOpen(false);
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setNotifOpen(false);
        setProfileOpen(false);
        setMobileSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <header className="h-[60px] bg-white border-b border-gray-100 flex items-center px-3 sm:px-5 gap-2 sm:gap-4 z-20 relative">
      {setSidebarOpen && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-400 hover:text-[#2D6A4F] transition-colors md:hidden flex-shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Search — full input on sm+, collapses to an icon-trigger on mobile */}
      <div className="relative flex-1 max-w-sm hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
        <input
          type="text"
          placeholder="Search anything..."
          className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[13px] text-gray-700 placeholder-gray-300 outline-none focus:ring-2 focus:ring-green-100 focus:border-green-200 transition"
        />
      </div>

      <div className="flex-1 sm:hidden" />

      <button
        onClick={() => setMobileSearchOpen((v) => !v)}
        className="sm:hidden w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-[#2D6A4F] transition-all flex-shrink-0"
      >
        <Search className="w-[18px] h-[18px]" />
      </button>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-[#2D6A4F] transition-all"
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-400 rounded-full" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-11 w-72 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                <p className="font-semibold text-gray-700 text-sm">Notifications</p>
                <button onClick={() => setNotifOpen(false)} className="text-gray-300 hover:text-gray-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {notifications.map((n) => (
                  <div key={n.id} className={`px-4 py-3 hover:bg-gray-50 cursor-pointer flex gap-3 ${n.unread ? "" : "opacity-60"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${n.unread ? "bg-green-500" : "bg-gray-200"}`} />
                    <div>
                      <p className="text-[13px] text-gray-700 leading-snug">{n.text}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-50">
                <button className="text-[12px] text-[#2D6A4F] font-medium hover:underline">View all</button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-100 mx-0.5 sm:mx-1" />

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 sm:gap-2.5 pl-0.5 sm:pl-1 pr-1 sm:pr-2 py-1 rounded-xl hover:bg-gray-50 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#52B788] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              AD
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[13px] font-semibold text-gray-700 leading-tight">Admin</p>
              <p className="text-[10px] text-gray-400">Super Admin</p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-300 ml-0.5 hidden sm:block transition-transform ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-11 w-64 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              {/* Header — mirrors the notification box's header treatment */}
              <div className="px-4 py-3.5 border-b border-gray-50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#52B788] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  AD
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-700 leading-tight truncate">Admin</p>
                  <p className="text-xs text-gray-400 truncate">admin@fundforward.in</p>
                </div>
              </div>

              <div className="py-1.5">
                <button
                  onClick={() => goTo("/admin/profile")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4 text-gray-400" /> My Profile
                </button>
                <button
                  onClick={() => goTo("/admin/settings")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <SettingsIcon className="w-4 h-4 text-gray-400" /> Settings
                </button>
              </div>

              <div className="border-t border-gray-50 py-1.5">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile search bar — slides in below the header */}
      {mobileSearchOpen && (
        <div className="absolute left-0 right-0 top-full sm:hidden bg-white border-b border-gray-100 p-3 shadow-md z-30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              type="text"
              autoFocus
              placeholder="Search anything..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[13px] text-gray-700 placeholder-gray-300 outline-none focus:ring-2 focus:ring-green-100 focus:border-green-200 transition"
            />
          </div>
        </div>
      )}
    </header>
  );
}