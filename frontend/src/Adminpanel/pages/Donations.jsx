import React, { useState, useEffect, useCallback } from "react";
import { Search, Download, HandCoins, TrendingUp, Users, ChevronLeft, ChevronRight, Eye, Receipt, X, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import adminAxios from "../utils/adminAxios";

const MethodBadge = ({ method }) => {
  const map = { UPI: "bg-indigo-100 text-indigo-700", "Net Banking": "bg-blue-100 text-blue-700", Card: "bg-purple-100 text-purple-700", NEFT: "bg-teal-100 text-teal-700" };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[method] || "bg-gray-100 text-gray-500"}`}>{method}</span>;
};

const StatusBadge = ({ status }) => {
  const map = { Completed: "bg-green-100 text-green-700", Pending: "bg-amber-100 text-amber-700", Failed: "bg-red-100 text-red-600", Refunded: "bg-gray-200 text-gray-600" };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-500"}`}>{status}</span>;
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const initials = (name) => {
  if (!name || name === "Anonymous") return "??";
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
};

export default function Donations() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);

  const [donations, setDonations] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, pages: 1 });
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refundTarget, setRefundTarget] = useState(null);
  const [refundReason, setRefundReason] = useState("");
  const [refunding, setRefunding] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchSummary = useCallback(async () => {
    try {
      const { data } = await adminAxios.get("/donations/summary");
      setSummary(data.summary);
      setChartData(data.chart || []);
    } catch (err) {
      console.error("Failed to load donation summary:", err);
    }
  }, []);

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await adminAxios.get("/donations", {
        params: { search: debouncedSearch || undefined, method: methodFilter, status: statusFilter, page, limit: 8 },
      });
      setDonations(data.donations || []);
      setPagination(data.pagination || { page: 1, limit: 8, total: 0, pages: 1 });
    } catch (err) {
      console.error("Failed to load donations:", err);
      setError(err.response?.data?.message || "Failed to load donations.");
      setDonations([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, methodFilter, statusFilter, page]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);
  useEffect(() => { fetchDonations(); }, [fetchDonations]);

  const handleExportCsv = () => {
    const header = ["Transaction ID", "Donor", "Email", "Campaign", "Amount", "Date", "Method", "Status"];
    const rows = donations.map((d) => [d.id, d.donor, d.email, d.campaign, d.amount, fmtDate(d.date), d.method, d.status]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `donations-page-${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openRefund = (d) => { setRefundTarget(d); setRefundReason(""); };

  const submitRefund = async () => {
    if (!refundTarget) return;
    setRefunding(true);
    try {
      await adminAxios.patch(`/donations/${refundTarget.id}/refund`, { reason: refundReason });
      setRefundTarget(null);
      fetchDonations();
      fetchSummary();
    } catch (err) {
      console.error("Refund failed:", err);
      alert(err.response?.data?.message || "Refund failed.");
    } finally {
      setRefunding(false);
    }
  };

  const total = summary?.totalAmount || 0;
  const anonCount = summary?.anonymousCount ?? donations.filter((d) => d.anonymous).length;
  const totalDonors = summary?.totalCount ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332]">Donations</h1>
          <p className="text-gray-500 text-sm mt-0.5">Monitor all donation transactions</p>
        </div>
        <button onClick={handleExportCsv} className="flex items-center gap-2 bg-[#2D6A4F] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1B4332] transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Collected", value: `₹${(total / 1000).toFixed(1)}k`, sub: "All time", icon: HandCoins, color: "from-[#2D6A4F] to-[#52B788]" },
          { label: "Completed", value: summary?.completedCount ?? "—", sub: "Successful transactions", icon: TrendingUp, color: "from-emerald-500 to-teal-400" },
          { label: "Total Transactions", value: totalDonors, sub: "All time", icon: Users, color: "from-blue-500 to-indigo-400" },
          { label: "Anonymous", value: anonCount, sub: "All time", icon: HandCoins, color: "from-purple-500 to-violet-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-[#1B4332]">{s.value}</p>
              <p className="text-xs text-gray-400">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-800">Daily Donation Volume</h2>
            <p className="text-xs text-gray-400 mt-0.5">Last 8 days</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="donGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#52B788" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#52B788" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
            <Tooltip formatter={(v) => [`₹${(v / 1000).toFixed(1)}k`, "Donations"]} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Area type="monotone" dataKey="amount" stroke="#2D6A4F" strokeWidth={2.5} fill="url(#donGrad)" dot={{ fill: "#2D6A4F", r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search donor or campaign..."
            className="w-full pl-9 pr-4 py-2 bg-[#F0F7F4] rounded-xl text-sm outline-none" />
        </div>
        <select value={methodFilter} onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-[#F0F7F4] rounded-xl text-sm text-gray-600 outline-none">
          <option value="All">All Methods</option>
          <option>UPI</option>
          <option>Net Banking</option>
          <option>Card</option>
          <option>NEFT</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-[#F0F7F4] rounded-xl text-sm text-gray-600 outline-none">
          <option value="All">All Status</option>
          <option>Completed</option>
          <option>Pending</option>
          <option>Refunded</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F0F7F4] border-b border-gray-100">
                {["Transaction ID", "Donor", "Campaign", "Amount", "Date", "Method", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> Loading donations...
                </td></tr>
              ) : donations.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No donations found.</td></tr>
              ) : donations.map((d) => (
                <tr key={d.id} className="border-t border-gray-50 hover:bg-[#F9FFFE] transition-colors">
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{String(d.id).slice(-8).toUpperCase()}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${d.anonymous ? "bg-gray-400" : "bg-gradient-to-br from-[#2D6A4F] to-[#52B788]"}`}>
                        {initials(d.donor)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{d.donor}</p>
                        <p className="text-xs text-gray-400">{d.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 max-w-[150px]">
                    <p className="truncate text-sm">{d.campaign}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-bold text-[#2D6A4F]">₹{Number(d.amount).toLocaleString("en-IN")}</span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">{fmtDate(d.date)}</td>
                  <td className="px-4 py-3.5"><MethodBadge method={d.method} /></td>
                  <td className="px-4 py-3.5"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1.5">
                      <button className="p-1.5 rounded-lg text-gray-400 hover:text-[#2D6A4F] hover:bg-[#F0F7F4]" title="View details"><Eye className="w-4 h-4" /></button>
                      {d.status === "Completed" && (
                        <button onClick={() => openRefund(d)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50" title="Refund">
                          <Receipt className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
          <p className="text-sm text-gray-500">Showing <span className="font-medium text-gray-700">{donations.length}</span> of <span className="font-medium text-gray-700">{pagination.total}</span> transactions</p>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
              className="p-1.5 rounded-lg hover:bg-[#F0F7F4] text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft className="w-4 h-4" /></button>
            {Array.from({ length: pagination.pages || 1 }, (_, i) => i + 1).slice(0, 5).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium ${p === page ? "bg-[#2D6A4F] text-white" : "text-gray-600 hover:bg-[#F0F7F4]"}`}>{p}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(pagination.pages || 1, p + 1))} disabled={page >= (pagination.pages || 1)}
              className="p-1.5 rounded-lg hover:bg-[#F0F7F4] text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {refundTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 text-lg">Refund Donation</h3>
              <button onClick={() => setRefundTarget(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-gray-600 mb-1">Donor: <span className="font-medium text-gray-800">{refundTarget.donor}</span></p>
            <p className="text-sm text-gray-600 mb-4">Amount: <span className="font-bold text-[#2D6A4F]">₹{Number(refundTarget.amount).toLocaleString("en-IN")}</span></p>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Reason (optional)</label>
            <textarea value={refundReason} onChange={(e) => setRefundReason(e.target.value)} rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#2D6A4F]" placeholder="e.g. Requested by donor" />
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setRefundTarget(null)} className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={submitRefund} disabled={refunding}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
                {refunding && <Loader2 className="w-4 h-4 animate-spin" />} Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
