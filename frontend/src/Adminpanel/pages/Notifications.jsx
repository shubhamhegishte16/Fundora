import React, { useState } from "react";
import { Bell, CheckCheck, Trash2, Filter, Megaphone, Users, ShieldAlert, BadgeCheck, HandCoins, Clock, Settings } from "lucide-react";

const allNotifications = [
  { id: 1, type: "campaign", icon: Megaphone, title: "New campaign pending approval", desc: "\"Digital Library Project\" by Karan Mehta is awaiting review.", time: "2 min ago", unread: true, color: "bg-purple-100 text-purple-700" },
  { id: 2, type: "kyc", icon: BadgeCheck, title: "KYC submitted", desc: "Rohan Verma submitted identity documents for verification.", time: "15 min ago", unread: true, color: "bg-[#D8F3DC] text-[#2D6A4F]" },
  { id: 3, type: "fraud", icon: ShieldAlert, title: "Fraud flag raised", desc: "Campaign \"Medical Aid Nepal\" has been flagged for suspicious activity.", time: "1 hr ago", unread: true, color: "bg-red-100 text-red-600" },
  { id: 4, type: "user", icon: Users, title: "New user registered", desc: "Priya Singh created an account as a Campaign Creator.", time: "2 hr ago", unread: false, color: "bg-blue-100 text-blue-700" },
  { id: 5, type: "donation", icon: HandCoins, title: "Large donation received", desc: "₹10,000 anonymous donation on \"Elderly Care Home\" campaign.", time: "3 hr ago", unread: false, color: "bg-emerald-100 text-emerald-700" },
  { id: 6, type: "campaign", icon: Megaphone, title: "Campaign goal reached", desc: "\"Support Women Entrepreneurs\" reached 92% of its funding goal.", time: "5 hr ago", unread: false, color: "bg-purple-100 text-purple-700" },
  { id: 7, type: "kyc", icon: BadgeCheck, title: "KYC approved", desc: "GreenEarth NGO's KYC verification has been approved.", time: "1 day ago", unread: false, color: "bg-[#D8F3DC] text-[#2D6A4F]" },
  { id: 8, type: "fraud", icon: ShieldAlert, title: "Fraud alert resolved", desc: "\"Animal Rescue Fund\" fraud flag dismissed after review.", time: "2 days ago", unread: false, color: "bg-red-100 text-red-600" },
  { id: 9, type: "system", icon: Settings, title: "System maintenance scheduled", desc: "Platform will undergo maintenance on Aug 5, 2024 from 2–4 AM IST.", time: "2 days ago", unread: false, color: "bg-gray-100 text-gray-600" },
  { id: 10, type: "donation", icon: HandCoins, title: "Daily donation summary", desc: "Total donations today: ₹48,750 across 12 campaigns.", time: "3 days ago", unread: false, color: "bg-emerald-100 text-emerald-700" },
];

const typeLabels = {
  campaign: "Campaign",
  kyc: "KYC",
  fraud: "Fraud",
  user: "User",
  donation: "Donation",
  system: "System",
};

export default function Notifications() {
  const [filter, setFilter] = useState("All");
  const [notifications, setNotifications] = useState(allNotifications);

  const unread = notifications.filter((n) => n.unread).length;

  const markAllRead = () => setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  const markRead = (id) => setNotifications(notifications.map((n) => n.id === id ? { ...n, unread: false } : n));
  const remove = (id) => setNotifications(notifications.filter((n) => n.id !== id));

  const filtered = notifications.filter((n) => filter === "All" || n.type === filter.toLowerCase() || (filter === "Unread" && n.unread));

  const filterTabs = ["All", "Unread", "Campaign", "KYC", "Fraud", "Donation", "System"];

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332]">Notifications</h1>
          <p className="text-gray-500 text-sm mt-0.5">{unread} unread notification{unread !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={markAllRead}
            className="flex items-center gap-2 bg-[#F0F7F4] text-[#2D6A4F] px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#D8F3DC] transition-colors">
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: notifications.length, color: "text-[#1B4332]" },
          { label: "Unread", value: unread, color: "text-amber-600" },
          { label: "Today", value: notifications.filter((_, i) => i < 5).length, color: "text-[#2D6A4F]" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 flex gap-1 flex-wrap">
        {filterTabs.map((tab) => {
          const count = tab === "All" ? notifications.length : tab === "Unread" ? unread : notifications.filter((n) => n.type === tab.toLowerCase()).length;
          return (
            <button key={tab} onClick={() => setFilter(tab)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all
                ${filter === tab ? "bg-[#2D6A4F] text-white shadow-sm" : "text-gray-500 hover:bg-[#F0F7F4]"}`}>
              {tab}
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
                  ${filter === tab ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No notifications</p>
            <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div key={n.id}
              className={`bg-white rounded-2xl border shadow-sm transition-all hover:shadow-md
                ${n.unread ? "border-[#95D5B2] ring-1 ring-[#52B788]/20" : "border-gray-100"}`}>
              <div className="p-4 flex items-start gap-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.color}`}>
                  <n.icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {n.unread && <span className="w-2 h-2 rounded-full bg-[#2D6A4F] flex-shrink-0" />}
                        <p className={`text-sm font-semibold ${n.unread ? "text-gray-900" : "text-gray-700"}`}>{n.title}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.desc}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{n.time}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">{typeLabels[n.type]}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 flex-shrink-0">
                      {n.unread && (
                        <button onClick={() => markRead(n.id)}
                          className="p-1.5 rounded-lg text-[#2D6A4F] hover:bg-[#D8F3DC] transition-colors" title="Mark as read">
                          <CheckCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => remove(n.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}