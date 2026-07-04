import React, { useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown, Users, HandCoins, Megaphone, Target, Loader2 } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import adminAxios from "../utils/adminAxios";

const PIE_COLORS = ["#1B4332", "#2D6A4F", "#52B788", "#95D5B2", "#B7E4C7", "#D8F3DC"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {typeof p.value === "number" && p.value > 1000 ? `₹${(p.value / 1000).toFixed(1)}k` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const fmtINR = (v) => {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}k`;
  return `₹${v}`;
};

export default function Analytics() {
  const [period, setPeriod] = useState("7M");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: res } = await adminAxios.get("/analytics/overview", { params: { period } });
      setData(res);
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError(err.response?.data?.message || "Failed to load analytics.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);

  if (loading && !data) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-gray-100">
        <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> Loading analytics...
      </div>
    );
  }

  const kpiSource = data?.kpis || {
    totalRevenue: { value: 0, change: 0 },
    newUsers: { value: 0, change: 0 },
    activeCampaigns: { value: 0, change: 0 },
    avgDonation: { value: 0, change: 0 },
  };

  const kpis = [
    { label: "Total Revenue", value: fmtINR(kpiSource.totalRevenue.value), change: kpiSource.totalRevenue.change, icon: HandCoins },
    { label: "New Users", value: kpiSource.newUsers.value.toLocaleString("en-IN"), change: kpiSource.newUsers.change, icon: Users },
    { label: "Active Campaigns", value: kpiSource.activeCampaigns.value.toLocaleString("en-IN"), change: kpiSource.activeCampaigns.change, icon: Megaphone },
    { label: "Avg. Donation", value: `₹${kpiSource.avgDonation.value.toLocaleString("en-IN")}`, change: kpiSource.avgDonation.change, icon: Target },
  ];

  const trend = data?.trend || [];
  const weekly = data?.weekly || [];
  const category = data?.category || [];
  const topCampaigns = data?.topCampaigns || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332]">Analytics</h1>
          <p className="text-gray-500 text-sm mt-0.5">Platform performance and insights</p>
        </div>
        <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {["7D", "30D", "7M", "1Y"].map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${period === p ? "bg-[#2D6A4F] text-white" : "text-gray-500 hover:bg-[#F0F7F4]"}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => {
          const up = k.change >= 0;
          return (
            <div key={k.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-500 font-medium">{k.label}</p>
                <div className="w-8 h-8 rounded-lg bg-[#D8F3DC] flex items-center justify-center">
                  <k.icon className="w-4 h-4 text-[#2D6A4F]" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#1B4332]">{k.value}</p>
              <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${up ? "text-green-600" : "text-red-500"}`}>
                {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {up ? "+" : ""}{k.change}% vs last period
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-gray-800">Donation & User Growth</h2>
            <p className="text-xs text-gray-400 mt-0.5">Trend over the selected period</p>
          </div>
        </div>
        {trend.length === 0 ? (
          <div className="h-[260px] flex items-center justify-center text-gray-400 text-sm">No data yet for this period</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#95D5B2" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#95D5B2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area yAxisId="left" type="monotone" dataKey="donations" name="Donations" stroke="#2D6A4F" strokeWidth={2.5} fill="url(#grad1)" dot={{ fill: "#2D6A4F", r: 4 }} />
              <Area yAxisId="right" type="monotone" dataKey="users" name="New Users" stroke="#95D5B2" strokeWidth={2} fill="url(#grad2)" dot={{ fill: "#95D5B2", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Weekly Bar Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-1">This Week</h2>
          <p className="text-xs text-gray-400 mb-4">Daily donation amounts</p>
          {weekly.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-gray-400 text-sm">No donations this week</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weekly} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(v) => [`₹${(v / 1000).toFixed(1)}k`, "Donations"]} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="amount" fill="#52B788" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Pie */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-1">Category Distribution</h2>
          <p className="text-xs text-gray-400 mb-2">By total funds raised</p>
          {category.length === 0 ? (
            <div className="h-[160px] flex items-center justify-center text-gray-400 text-sm">No funded campaigns yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={category} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {category.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}%`, "Share"]} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-1">
                {category.map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-gray-600">{c.name}</span>
                    </div>
                    <span className="font-semibold text-gray-700">{c.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Top Campaigns */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Top Performing Campaigns</h2>
          {topCampaigns.length === 0 ? (
            <div className="h-[160px] flex items-center justify-center text-gray-400 text-sm">No active campaigns yet</div>
          ) : (
            <div className="space-y-3">
              {topCampaigns.map((c, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-gray-700 truncate max-w-[160px]">{c.name}</span>
                    <span className="text-[#2D6A4F] font-bold">{c.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#2D6A4F] to-[#52B788] rounded-full transition-all"
                      style={{ width: `${c.pct}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">₹{c.raised.toLocaleString("en-IN")} of ₹{c.goal.toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}