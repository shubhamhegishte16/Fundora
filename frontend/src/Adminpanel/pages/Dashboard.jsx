import React, { useEffect, useState } from "react";
import {
  Users, Megaphone, HandCoins, Clock,
  ArrowUpRight, ArrowDownRight, MoreHorizontal, Loader2
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import adminAxios from "../utils/adminAxios";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const inrCompact = (n) => {
  const v = Number(n || 0);
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  return `₹${v.toLocaleString("en-IN")}`;
};

const PIE_COLORS = ["#1B4332", "#2D6A4F", "#52B788", "#95D5B2", "#B7E4C7"];

const StatusPill = ({ status }) => {
  const s = { active: "bg-emerald-50 text-emerald-600", pending_review: "bg-amber-50 text-amber-600", Active: "bg-emerald-50 text-emerald-600", Pending: "bg-amber-50 text-amber-600" };
  const label = status === "pending_review" ? "Pending" : status?.charAt(0).toUpperCase() + status?.slice(1);
  return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${s[status] || "bg-gray-50 text-gray-500"}`}>{label}</span>;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
        <p className="font-medium text-gray-600 mb-0.5">{label}</p>
        <p className="text-[#2D6A4F] font-bold">₹{(payload[0].value / 100000).toFixed(1)}L</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [areaData, setAreaData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [statsRes, trendRes, catRes, campRes, donRes] = await Promise.all([
          adminAxios.get("/dashboard/stats"),
          adminAxios.get("/dashboard/donation-trend?months=6"),
          adminAxios.get("/dashboard/category-breakdown"),
          adminAxios.get("/dashboard/recent-campaigns?limit=4"),
          adminAxios.get("/dashboard/recent-donations?limit=3"),
        ]);
        if (cancelled) return;
        setStats(statsRes.data.stats);
        setAreaData(trendRes.data.trend || []);
        setCategoryData(catRes.data.breakdown || []);
        setRecentCampaigns(campRes.data.campaigns || []);
        setRecentDonations(donRes.data.donations || []);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || e.message || "Failed to load dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const statCards = stats ? [
    { label: "Total Users", value: stats.totalUsers.value.toLocaleString("en-IN"), change: `${stats.totalUsers.change}%`, up: stats.totalUsers.up, icon: Users },
    { label: "Active Campaigns", value: stats.activeCampaigns.value.toLocaleString("en-IN"), change: `${stats.activeCampaigns.change}%`, up: stats.activeCampaigns.up, icon: Megaphone },
    { label: "Total Donations", value: inrCompact(stats.totalDonations.value), change: `${stats.totalDonations.change}%`, up: stats.totalDonations.up, icon: HandCoins },
    { label: "Pending Reviews", value: String(stats.pendingReviews.value), change: `${stats.pendingReviews.campaigns} campaigns · ${stats.pendingReviews.kyc} KYC`, up: true, icon: Clock },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading dashboard...
      </div>
    );
  }

  if (error) {
    return <div className="p-5 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>;
  }

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">Good morning, Admin 👋</h1>
        <p className="text-gray-400 text-sm mt-0.5">Here's what's happening on the platform today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#F0F7F4] flex items-center justify-center">
                <s.icon className="w-4 h-4 text-[#2D6A4F]" />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${s.up ? "text-emerald-500" : "text-red-400"}`}>
                {s.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {s.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-[12px] text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-gray-700 text-[15px]">Donation Trend</h2>
              <p className="text-[12px] text-gray-400 mt-0.5">Monthly donation volume</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={areaData} margin={{ left: -10 }}>
              <defs>
                <linearGradient id="donGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#52B788" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#52B788" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#cbd5e1" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#cbd5e1" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="donations" stroke="#2D6A4F" strokeWidth={2} fill="url(#donGrad)" dot={{ fill: "#2D6A4F", r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: "#2D6A4F" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-700 text-[15px] mb-1">By Category</h2>
          <p className="text-[12px] text-gray-400 mb-3">Campaign distribution</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} dataKey="value" paddingAngle={2} strokeWidth={0}>
                {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`]} contentStyle={{ borderRadius: 10, fontSize: 12, border: "1px solid #f0f0f0" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {categoryData.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-[12px] text-gray-500">{c.name}</span>
                </div>
                <span className="text-[12px] font-semibold text-gray-700">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Campaigns */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-700 text-[15px]">Recent Campaigns</h2>
            <button className="text-[12px] text-[#2D6A4F] hover:underline font-medium">View all</button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentCampaigns.map((c) => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-gray-700 text-[13px] truncate">{c.name}</p>
                    <StatusPill status={c.status} />
                  </div>
                  <p className="text-[11px] text-gray-400">{c.creator} · {c.category}</p>
                </div>
                <div className="text-right flex-shrink-0 w-32">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#52B788] rounded-full" style={{ width: `${c.pct || 0}%` }} />
                    </div>
                    <span className="text-[11px] text-gray-400 w-6 text-right">{c.pct || 0}%</span>
                  </div>
                  <p className="text-[11px] text-gray-400">{inr(c.raised)} of {inr(c.goal)}</p>
                </div>
              </div>
            ))}
            {recentCampaigns.length === 0 && (
              <p className="px-5 py-6 text-center text-[12px] text-gray-400">No campaigns yet</p>
            )}
          </div>
        </div>

        {/* Recent Donations */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-700 text-[15px]">Recent Donations</h2>
            <button className="text-[12px] text-[#2D6A4F] hover:underline font-medium">View all</button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentDonations.map((d) => (
              <div key={d.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 ${d.avatar === "??" ? "bg-gray-300" : "bg-gradient-to-br from-[#2D6A4F] to-[#52B788]"}`}>
                  {d.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-gray-700 truncate">{d.donor}</p>
                  <p className="text-[11px] text-gray-400 truncate">{d.campaign}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[13px] font-bold text-[#2D6A4F]">{inr(d.amount)}</p>
                  <p className="text-[11px] text-gray-400">{d.time}</p>
                </div>
              </div>
            ))}
            {recentDonations.length === 0 && (
              <p className="px-5 py-6 text-center text-[12px] text-gray-400">No donations yet</p>
            )}
          </div>

          {/* Quick actions */}
          <div className="px-5 py-4 border-t border-gray-50 grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-1.5 py-2 bg-[#F0F7F4] text-[#2D6A4F] rounded-xl text-[12px] font-medium hover:bg-[#D8F3DC] transition-colors">
              Approve Campaign
            </button>
            <button className="flex items-center justify-center gap-1.5 py-2 bg-amber-50 text-amber-600 rounded-xl text-[12px] font-medium hover:bg-amber-100 transition-colors">
              Review KYC
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}