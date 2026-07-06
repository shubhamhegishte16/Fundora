import React, { useState, useEffect, useCallback } from "react";
import { FileText, Download, TrendingUp, Users, HandCoins, Megaphone, ShieldAlert, RefreshCw, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import adminAxios from "../utils/adminAxios";

const ICONS = {
  donations: HandCoins,
  campaigns: Megaphone,
  users: Users,
  fraud: ShieldAlert,
  kyc: FileText,
  "fund-utilization": TrendingUp,
};

const COLORS = {
  donations: "text-[#2D6A4F] bg-[#D8F3DC]",
  campaigns: "text-purple-700 bg-purple-100",
  users: "text-blue-700 bg-blue-100",
  fraud: "text-red-600 bg-red-100",
  kyc: "text-amber-700 bg-amber-100",
  "fund-utilization": "text-teal-700 bg-teal-100",
};

const STATUS_STYLES = {
  Ready: "bg-green-100 text-green-700",
  "In Progress": "bg-amber-100 text-amber-700",
};

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingType, setDownloadingType] = useState(null);

  const [summary, setSummary] = useState({ totalRaised: 0, platformFee: 0, campaignsCompleted: 0, totalDonors: 0 });
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [reportCards, setReportCards] = useState([]);
  const [recentReports, setRecentReports] = useState([]);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await adminAxios.get("/reports/overview");
      setSummary(data.summary);
      setMonthlyRevenue(data.monthlyRevenue);
      setReportCards(data.reportCards);
      setRecentReports(data.recentReports);
    } catch (err) {
      console.error("Failed to load reports overview:", err);
      setError(err.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);

  const handleDownload = async (key) => {
    setDownloadingType(key);
    try {
      const res = await adminAxios.get(`/reports/download/${key}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      const disposition = res.headers["content-disposition"] || "";
      const match = disposition.match(/filename="(.+)"/);
      link.download = match ? match[1] : `${key}-report.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download report:", err);
      setError(err.response?.data?.message || "Failed to download report");
    } finally {
      setDownloadingType(null);
    }
  };

  const formatCurrency = (v) => {
    if (v >= 1e7) return `₹${(v / 1e7).toFixed(1)}Cr`;
    if (v >= 1e5) return `₹${(v / 1e5).toFixed(1)}L`;
    if (v >= 1e3) return `₹${(v / 1e3).toFixed(1)}k`;
    return `₹${v}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading reports...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332]">Reports</h1>
          <p className="text-gray-500 text-sm mt-0.5">Generate and download reports pulled live from every admin panel</p>
        </div>
        <button onClick={fetchOverview} className="flex items-center gap-2 text-sm text-[#2D6A4F] font-medium bg-[#D8F3DC] px-3 py-2 rounded-xl hover:bg-[#B7E4C7] transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{error}</div>}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Funds Raised", value: formatCurrency(summary.totalRaised), sub: "Across all campaigns" },
          { label: "Platform Fee Earned", value: formatCurrency(summary.platformFee), sub: "Based on current fee %" },
          { label: "Campaigns Completed", value: summary.campaignsCompleted, sub: "Successfully funded" },
          { label: "Total Donors", value: summary.totalDonors, sub: "Registered donors" },
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
        <div className="mb-5">
          <h2 className="font-semibold text-gray-800">Revenue vs Platform Fee</h2>
          <p className="text-xs text-gray-400 mt-0.5">Monthly donations received over the last 7 months</p>
        </div>
        {monthlyRevenue.every((m) => m.revenue === 0) ? (
          <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">No completed donations yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyRevenue} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip formatter={(v) => [formatCurrency(v)]} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="revenue" name="Revenue" fill="#2D6A4F" radius={[6, 6, 0, 0]} maxBarSize={36} />
              <Bar dataKey="expenses" name="Platform Fee" fill="#95D5B2" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        )}
        <div className="flex items-center gap-6 mt-3 justify-center">
          <div className="flex items-center gap-2 text-xs text-gray-500"><span className="w-3 h-3 rounded bg-[#2D6A4F]" /> Revenue</div>
          <div className="flex items-center gap-2 text-xs text-gray-500"><span className="w-3 h-3 rounded bg-[#95D5B2]" /> Platform Fee</div>
        </div>
      </div>

      {/* Report Types — one per admin panel page */}
      <div>
        <h2 className="font-semibold text-gray-800 mb-3">Download Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {reportCards.map((r) => {
            const Icon = ICONS[r.key] || FileText;
            return (
              <div key={r.key} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-[#B7E4C7] transition-all group">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${COLORS[r.key] || "text-gray-700 bg-gray-100"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm leading-tight">{r.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{r.desc}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-3 pt-3 border-t border-gray-100">
                  <span>Source: {r.sourcePage}</span>
                  <span>{r.count} records</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <span>Last activity: {r.lastGenerated}</span>
                </div>
                <button onClick={() => handleDownload(r.key)} disabled={downloadingType === r.key}
                  className="w-full flex items-center justify-center gap-1.5 bg-[#2D6A4F] text-white py-2 rounded-xl text-xs font-semibold hover:bg-[#1B4332] transition-colors disabled:opacity-60">
                  {downloadingType === r.key ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  {downloadingType === r.key ? "Preparing CSV..." : "Download CSV"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity across pages */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Recent Activity</h2>
          <p className="text-xs text-gray-400">Latest items from Donations, Campaigns and Fraud pages</p>
        </div>
        <div className="divide-y divide-gray-50">
          {recentReports.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-gray-400">No recent activity yet</div>
          )}
          {recentReports.map((r, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#F9FFFE] transition-colors">
              <div className="w-9 h-9 rounded-xl bg-[#D8F3DC] flex items-center justify-center flex-shrink-0">
                <FileText className="w-[18px] h-[18px] text-[#2D6A4F]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{r.name}</p>
                <p className="text-xs text-gray-400">{r.type} · {r.date}</p>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_STYLES[r.status] || "bg-gray-100 text-gray-500"}`}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
