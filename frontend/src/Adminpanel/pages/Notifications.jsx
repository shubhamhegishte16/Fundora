import React, { useState, useEffect, useCallback } from "react";
import { Bell, CheckCheck, Trash2, Megaphone, Users, ShieldAlert, BadgeCheck, HandCoins, Clock, Settings, Loader2 } from "lucide-react";
import adminAxios from "../utils/adminAxios";

const TYPE_META = {
  campaign: { icon: Megaphone, color: "bg-purple-100 text-purple-700" },
  kyc: { icon: BadgeCheck, color: "bg-[#D8F3DC] text-[#2D6A4F]" },
  fraud: { icon: ShieldAlert, color: "bg-red-100 text-red-600" },
  user: { icon: Users, color: "bg-blue-100 text-blue-700" },
  donation: { icon: HandCoins, color: "bg-emerald-100 text-emerald-700" },
  system: { icon: Settings, color: "bg-gray-100 text-gray-600" },
};

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
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, today: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await adminAxios.get("/notifications", { params: { filter } });
      setNotifications(data.notifications || []);
      setStats(data.stats || { total: 0, unread: 0, today: 0 });
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError(err.response?.data?.message || "Failed to load notifications.");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await adminAxios.patch("/notifications/read-all");
      await fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all read:", err);
      alert(err.response?.data?.message || "Failed to mark all as read.");
    }
  };

  const markRead = async (id) => {
    setActingId(id);
    try {
      await adminAxios.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
      setStats((prev) => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
    } catch (err) {
      console.error("Failed to mark notification read:", err);
      alert(err.response?.data?.message || "Failed to mark notification as read.");
    } finally {
      setActingId(null);
    }
  };

  const remove = async (id) => {
    setActingId(id);
    try {
      await adminAxios.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setStats((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    } catch (err) {
      console.error("Failed to delete notification:", err);
      alert(err.response?.data?.message || "Failed to delete notification.");
    } finally {
      setActingId(null);
    }
  };

  const filterTabs = ["All", "Unread", "Campaign", "KYC", "Fraud", "Donation", "System"];

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332]">Notifications</h1>
          <p className="text-gray-500 text-sm mt-0.5">{stats.unread} unread notification{stats.unread !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={markAllRead}
            className="flex items-center gap-2 bg-[#F0F7F4] text-[#2D6A4F] px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#D8F3DC] transition-colors">
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-[#1B4332]" },
          { label: "Unread", value: stats.unread, color: "text-amber-600" },
          { label: "Today", value: stats.today, color: "text-[#2D6A4F]" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 flex gap-1 flex-wrap">
        {filterTabs.map((tab) => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all
              ${filter === tab ? "bg-[#2D6A4F] text-white shadow-sm" : "text-gray-500 hover:bg-[#F0F7F4]"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {loading ? (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-gray-100">
            <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No notifications</p>
            <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((n) => {
            const meta = TYPE_META[n.type] || TYPE_META.system;
            const Icon = meta.icon;
            return (
              <div key={n.id}
                className={`bg-white rounded-2xl border shadow-sm transition-all hover:shadow-md
                  ${n.unread ? "border-[#95D5B2] ring-1 ring-[#52B788]/20" : "border-gray-100"}`}>
                <div className="p-4 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

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

                      <div className="flex gap-1.5 flex-shrink-0">
                        {n.unread && (
                          <button onClick={() => markRead(n.id)} disabled={actingId === n.id}
                            className="p-1.5 rounded-lg text-[#2D6A4F] hover:bg-[#D8F3DC] transition-colors disabled:opacity-50" title="Mark as read">
                            <CheckCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => remove(n.id)} disabled={actingId === n.id}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}