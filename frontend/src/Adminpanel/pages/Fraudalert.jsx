import React, { useState, useEffect, useCallback } from "react";
import { ShieldAlert, AlertTriangle, CheckCircle, XCircle, Eye, Flag, Clock, Search, Loader2 } from "lucide-react";
import adminAxios from "../utils/adminAxios";

const SeverityBadge = ({ severity }) => {
  const map = {
    Critical: "bg-red-100 text-red-700 border border-red-200",
    High: "bg-orange-100 text-orange-700 border border-orange-200",
    Medium: "bg-amber-100 text-amber-700 border border-amber-200",
    Low: "bg-blue-100 text-blue-700 border border-blue-200",
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[severity] || "bg-gray-100 text-gray-500"}`}>{severity}</span>;
};

const StatusBadge = ({ status }) => {
  const map = {
    Open: "bg-red-50 text-red-600",
    "Under Review": "bg-amber-50 text-amber-700",
    Resolved: "bg-green-50 text-green-700",
    Dismissed: "bg-gray-100 text-gray-500",
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-500"}`}>{status}</span>;
};

const TrustScore = ({ score }) => {
  const color = score < 30 ? "bg-red-500" : score < 55 ? "bg-amber-400" : "bg-green-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-16">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-bold ${score < 30 ? "text-red-600" : score < 55 ? "text-amber-600" : "text-green-600"}`}>{score}</span>
    </div>
  );
};

export default function FraudAlert() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [flags, setFlags] = useState([]);
  const [stats, setStats] = useState({ open: 0, critical: 0, underReview: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await adminAxios.get("/fraud/stats");
      setStats(data.stats);
    } catch (err) {
      console.error("Failed to load fraud stats:", err);
    }
  }, []);

  const fetchFlags = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await adminAxios.get("/fraud", {
        params: { search: debouncedSearch || undefined, status: statusFilter, severity: severityFilter },
      });
      setFlags(data.alerts || []);
    } catch (err) {
      console.error("Failed to load fraud alerts:", err);
      setError(err.response?.data?.message || "Failed to load fraud alerts.");
      setFlags([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, severityFilter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchFlags(); }, [fetchFlags]);

  const STATUS_TO_API = { "Under Review": "investigating", Resolved: "resolved", Dismissed: "dismissed", Open: "open" };

  const changeStatus = async (id, statusLabel) => {
    setActingId(id);
    try {
      await adminAxios.patch(`/fraud/${id}/status`, { status: STATUS_TO_API[statusLabel] || statusLabel.toLowerCase() });
      await Promise.all([fetchFlags(), fetchStats()]);
    } catch (err) {
      console.error("Failed to update fraud alert:", err);
      alert(err.response?.data?.message || "Failed to update fraud alert.");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332]">Fraud Alerts</h1>
          <p className="text-gray-500 text-sm mt-0.5">Monitor and resolve suspicious activity on the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-medium text-red-600">{stats.open} Active Alerts</span>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Open Alerts", value: stats.open, color: "text-red-600", bg: "bg-red-50", border: "border-red-100", icon: AlertTriangle },
          { label: "Critical", value: stats.critical, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100", icon: ShieldAlert },
          { label: "Under Review", value: stats.underReview, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", icon: Clock },
          { label: "Resolved", value: stats.resolved, color: "text-green-600", bg: "bg-green-50", border: "border-green-100", icon: CheckCircle },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4 flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Critical Banner */}
      {stats.critical > 0 && severityFilter !== "Critical" && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-red-800">{stats.critical} Critical alert{stats.critical > 1 ? "s" : ""} need immediate attention</p>
            <p className="text-xs text-red-600 mt-0.5">These campaigns may involve fraudulent activity. Review and take action promptly.</p>
          </div>
          <button onClick={() => setSeverityFilter("Critical")} className="ml-auto bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-600 transition-colors flex-shrink-0">
            Review Critical
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search campaigns or creators..."
            className="w-full pl-9 pr-4 py-2 bg-[#F0F7F4] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#52B788]/40" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-[#F0F7F4] rounded-xl text-sm text-gray-600 outline-none">
          <option value="All">All Status</option>
          <option>Open</option>
          <option>Under Review</option>
          <option>Resolved</option>
          <option>Dismissed</option>
        </select>
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-2 bg-[#F0F7F4] rounded-xl text-sm text-gray-600 outline-none">
          <option value="All">All Severity</option>
          <option>Critical</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>

      {/* Fraud Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-gray-100">
            <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> Loading fraud alerts...
          </div>
        ) : flags.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-gray-100">No fraud alerts found.</div>
        ) : flags.map((f) => (
          <div key={f.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden
            ${f.severity === "Critical" ? "border-red-200" : f.severity === "High" ? "border-orange-200" : "border-gray-100"}`}>
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                  ${f.severity === "Critical" ? "bg-red-100" : f.severity === "High" ? "bg-orange-100" : "bg-amber-50"}`}>
                  <Flag className={`w-5 h-5 ${f.severity === "Critical" ? "text-red-600" : f.severity === "High" ? "text-orange-600" : "text-amber-600"}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="font-semibold text-gray-800">{f.campaign}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">by {f.creator} · Reported {f.reported}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <SeverityBadge severity={f.severity} />
                      <StatusBadge status={f.status} />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Reason</p>
                      <p className="text-sm font-medium text-gray-700">{f.reason}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Donations</p>
                      <p className="text-sm font-medium text-gray-700">{f.donations} transactions</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Amount</p>
                      <p className="text-sm font-medium text-[#2D6A4F]">{f.amount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Trust Score</p>
                      <TrustScore score={f.trust} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {f.status !== "Resolved" && f.status !== "Dismissed" && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                  <button className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F0F7F4] text-[#2D6A4F] rounded-xl text-xs font-semibold hover:bg-[#D8F3DC] transition-colors">
                    <Eye className="w-3.5 h-3.5" /> View Campaign
                  </button>
                  {f.status !== "Under Review" && (
                    <button disabled={actingId === f.id} onClick={() => changeStatus(f.id, "Under Review")}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-semibold hover:bg-amber-100 transition-colors disabled:opacity-50">
                      <Clock className="w-3.5 h-3.5" /> Mark Under Review
                    </button>
                  )}
                  <button disabled={actingId === f.id} onClick={() => changeStatus(f.id, "Resolved")}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50">
                    <XCircle className="w-3.5 h-3.5" /> Resolve (Action Taken)
                  </button>
                  <button disabled={actingId === f.id} onClick={() => changeStatus(f.id, "Dismissed")}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-semibold hover:bg-green-100 transition-colors disabled:opacity-50">
                    {actingId === f.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />} Dismiss Alert
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
