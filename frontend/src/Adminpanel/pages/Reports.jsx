import React, { useState } from "react";
import { FileText, Download, Calendar, TrendingUp, Users, HandCoins, Megaphone, Eye, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const monthlyRevenue = [
  { month: "Jan", revenue: 280000, expenses: 42000 },
  { month: "Feb", revenue: 320000, expenses: 38000 },
  { month: "Mar", revenue: 410000, expenses: 55000 },
  { month: "Apr", revenue: 390000, expenses: 48000 },
  { month: "May", revenue: 520000, expenses: 61000 },
  { month: "Jun", revenue: 480000, expenses: 52000 },
  { month: "Jul", revenue: 610000, expenses: 70000 },
];

const reportTypes = [
  { id: 1, title: "Monthly Donation Report", desc: "Total donations, donor counts, and trends for the selected month", icon: HandCoins, color: "text-[#2D6A4F] bg-[#D8F3DC]", lastGen: "Today, 9:00 AM", size: "2.4 MB" },
  { id: 2, title: "Campaign Performance Report", desc: "Campaign success rates, completion percentages, and creator stats", icon: Megaphone, color: "text-purple-700 bg-purple-100", lastGen: "Yesterday, 4:30 PM", size: "1.8 MB" },
  { id: 3, title: "User Activity Report", desc: "New signups, active users, donor behavior and engagement metrics", icon: Users, color: "text-blue-700 bg-blue-100", lastGen: "2 days ago", size: "3.1 MB" },
  { id: 4, title: "Fraud & Risk Report", desc: "Flagged campaigns, suspicious activity, trust score distribution", icon: TrendingUp, color: "text-red-600 bg-red-100", lastGen: "3 days ago", size: "0.9 MB" },
  { id: 5, title: "KYC Compliance Report", desc: "Verification status, pending KYC, and document audit trails", icon: FileText, color: "text-amber-700 bg-amber-100", lastGen: "1 week ago", size: "1.2 MB" },
  { id: 6, title: "Fund Utilization Report", desc: "How funds were distributed across categories and regions", icon: TrendingUp, color: "text-teal-700 bg-teal-100", lastGen: "1 week ago", size: "2.0 MB" },
];

const recentReports = [
  { name: "July 2024 Donation Report", type: "Monthly", date: "01 Aug 2024", status: "Ready" },
  { name: "Q2 Campaign Performance", type: "Quarterly", date: "01 Jul 2024", status: "Ready" },
  { name: "June 2024 User Activity", type: "Monthly", date: "01 Jul 2024", status: "Ready" },
  { name: "KYC Audit - June", type: "Compliance", date: "28 Jun 2024", status: "Ready" },
  { name: "Fraud Risk Summary - Week 26", type: "Risk", date: "25 Jun 2024", status: "Archived" },
];

export default function Reports() {
  const [generating, setGenerating] = useState(null);
  const [dateRange, setDateRange] = useState("This Month");

  const handleGenerate = (id) => {
    setGenerating(id);
    setTimeout(() => setGenerating(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332]">Reports</h1>
          <p className="text-gray-500 text-sm mt-0.5">Generate and download platform reports</p>
        </div>
        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 outline-none shadow-sm">
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Quarter</option>
          <option>This Year</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Funds Raised", value: "₹48.3L", sub: "Across all campaigns" },
          { label: "Platform Fee", value: "₹2.4L", sub: "5% of total raised" },
          { label: "Campaigns Completed", value: "124", sub: "Successfully funded" },
          { label: "Reports Generated", value: "38", sub: "This month" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-[#1B4332] mt-1">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-gray-800">Revenue vs Expenses</h2>
            <p className="text-xs text-gray-400 mt-0.5">Monthly financial overview</p>
          </div>
          <button className="flex items-center gap-2 text-sm text-[#2D6A4F] font-medium bg-[#D8F3DC] px-3 py-1.5 rounded-xl hover:bg-[#B7E4C7] transition-colors">
            <Download className="w-4 h-4" /> Export Chart
          </button>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyRevenue} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
            <Tooltip formatter={(v) => [`₹${(v / 1000).toFixed(1)}k`]} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Bar dataKey="revenue" name="Revenue" fill="#2D6A4F" radius={[6, 6, 0, 0]} maxBarSize={36} />
            <Bar dataKey="expenses" name="Expenses" fill="#95D5B2" radius={[6, 6, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-6 mt-3 justify-center">
          <div className="flex items-center gap-2 text-xs text-gray-500"><span className="w-3 h-3 rounded bg-[#2D6A4F]" /> Revenue</div>
          <div className="flex items-center gap-2 text-xs text-gray-500"><span className="w-3 h-3 rounded bg-[#95D5B2]" /> Expenses</div>
        </div>
      </div>

      {/* Report Types */}
      <div>
        <h2 className="font-semibold text-gray-800 mb-3">Generate Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {reportTypes.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-[#B7E4C7] transition-all group">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${r.color}`}>
                  <r.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm leading-tight">{r.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{r.desc}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-3 pt-3 border-t border-gray-100">
                <span>Last: {r.lastGen}</span>
                <span>{r.size}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleGenerate(r.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#2D6A4F] text-white py-2 rounded-xl text-xs font-semibold hover:bg-[#1B4332] transition-colors">
                  {generating === r.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  {generating === r.id ? "Generating..." : "Generate"}
                </button>
                <button className="flex items-center gap-1.5 bg-[#F0F7F4] text-[#2D6A4F] px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#D8F3DC] transition-colors">
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Recent Reports</h2>
          <button className="text-xs text-[#2D6A4F] font-medium hover:underline">View All</button>
        </div>
        <div className="divide-y divide-gray-50">
          {recentReports.map((r, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#F9FFFE] transition-colors">
              <div className="w-9 h-9 rounded-xl bg-[#D8F3DC] flex items-center justify-center flex-shrink-0">
                <FileText className="w-4.5 h-4.5 w-[18px] h-[18px] text-[#2D6A4F]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{r.name}</p>
                <p className="text-xs text-gray-400">{r.type} · {r.date}</p>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex-shrink-0 ${r.status === "Ready" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {r.status}
              </span>
              <div className="flex gap-2">
                <button className="text-gray-400 hover:text-[#2D6A4F] p-1.5 rounded-lg hover:bg-[#F0F7F4] transition-colors"><Eye className="w-4 h-4" /></button>
                <button className="text-gray-400 hover:text-[#2D6A4F] p-1.5 rounded-lg hover:bg-[#F0F7F4] transition-colors"><Download className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}