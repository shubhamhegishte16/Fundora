import React, { useState } from "react";
import { Bell, Search, ChevronDown, Menu, X } from "lucide-react";

const notifications = [
  { id: 1, text: "New campaign pending approval", time: "2 min ago", unread: true },
  { id: 2, text: "KYC submitted by Rohan Verma", time: "15 min ago", unread: true },
  { id: 3, text: "Fraud flag on Medical Aid Nepal", time: "1 hr ago", unread: false },
];

export default function Header({ sidebarOpen, setSidebarOpen }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="h-15 bg-white border-b border-gray-100 flex items-center px-5 gap-4 z-20 h-[60px]">
      {setSidebarOpen && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-400 hover:text-[#2D6A4F] transition-colors md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
        <input
          type="text"
          placeholder="Search anything..."
          className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[13px] text-gray-700 placeholder-gray-300 outline-none focus:ring-2 focus:ring-green-100 focus:border-green-200 transition"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notification Bell */}
        <div className="relative">
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
            <div className="absolute right-0 top-11 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
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
        <div className="w-px h-6 bg-gray-100 mx-1" />

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-50 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#52B788] flex items-center justify-center text-white text-xs font-bold">
              AD
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[13px] font-semibold text-gray-700 leading-tight">Admin</p>
              <p className="text-[10px] text-gray-400">Super Admin</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-300 ml-0.5" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-11 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden py-1">
              {["My Profile", "Settings", "Activity Log", "Sign Out"].map((item) => (
                <button key={item} className={`w-full text-left px-4 py-2 text-[13px] transition-colors ${item === "Sign Out" ? "text-red-500 hover:bg-red-50" : "text-gray-600 hover:bg-gray-50"}`}>
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}