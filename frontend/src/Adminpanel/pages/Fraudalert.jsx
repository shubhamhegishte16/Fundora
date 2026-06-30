import React, { useState } from "react";
import { ShieldAlert, AlertTriangle, CheckCircle, XCircle, Eye, Flag, Clock, Search } from "lucide-react";

const fraudFlags = [
  { id: 1, campaign: "Clean Water Initiative", creator: "Pooja Khanna", reason: "Suspicious donation pattern", severity: "High", reported: "2 hr ago", status: "Open", donations: 12, amount: "₹45,000", trust: 38 },
  { id: 2, campaign: "Startup Accelerator Fund", creator: "Nikhil Gupta", reason: "Fake KYC documents suspected", severity: "Critical", reported: "5 hr ago", status: "Under Review", donations: 8, amount: "₹80,000", trust: 22 },
  { id: 3, campaign: "Medical Aid Nepal", creator: "Unknown User", reason: "Multiple accounts from same IP", severity: "High", reported: "1 day ago", status: "Open", donations: 34, amount: "₹1,20,000", trust: 15 },
  { id: 4, campaign: "Animal Rescue Fund", creator: "Priya S.", reason: "Duplicate campaign detected", severity: "Medium", reported: "2 days ago", status: "Resolved", donations: 5, amount: "₹9,500", trust: 55 },
  { id: 5, campaign: "Digital Library Project", creator: "Sumit R.", reason: "Rapid unusual donations spike", severity: "Medium", reported: "3 days ago", status: "Open", donations: 22, amount: "₹60,000", trust: 44 },
  { id: 6, campaign: "Flood Relief Bihar", creator: "NGO Helper", reason: "Unverified organization", severity: "Low", reported: "4 days ago", status: "Dismissed", donations: 60, amount: "₹2,10,000", trust: 68 },
];

const SeverityBadge = ({ severity }) => {
  const map = {
    Critical: "bg-red-100 text-red-700 border border-red-200",
    High: "bg-orange-100 text-orange-700 border border-orange-200",
    Medium: "bg-amber-100 text-amber-700 border border-amber-200",
    Low: "bg-blue-100 text-blue-700 border border-blue-200",
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[severity]}`}>{severity}</span>;
};

const StatusBadge = ({ status }) => {
  const map = {
    Open: "bg-red-50 text-red-600",
    "Under Review": "bg-amber-50 text-amber-700",
    Resolved: "bg-green-50 text-green-700",
    Dismissed: "bg-gray-100 text-gray-500",
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status]}`}>{status}</span>;
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

  const open = fraudFlags.filter((f) => f.status === "Open").length;
  const critical = fraudFlags.filter((f) => f.severity === "Critical").length;
  const underReview = fraudFlags.filter((f) => f.status === "Under Review").length;
  const resolved = fraudFlags.filter((f) => f.status === "Resolved" || f.status === "Dismissed").length;

  const filtered = fraudFlags.filter((f) => {
    const matchSearch = f.campaign.toLowerCase().includes(search.toLowerCase()) || f.creator.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || f.status === statusFilter;
    const matchSeverity = severityFilter === "All" || f.severity === severityFilter;
    return matchSearch && matchStatus && matchSeverity;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332]">Fraud Alerts</h1>
          <p className="text-gray-500 text-sm mt-0.5">Monitor and resolve suspicious activity on the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-medium text-red-600">{open} Active Alerts</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Open Alerts", value: open, color: "text-red-600", bg: "bg-red-50", border: "border-red-100", icon: AlertTriangle },
          { label: "Critical", value: critical, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100", icon: ShieldAlert },
          { label: "Under Review", value: underReview, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", icon: Clock },
          { label: "Resolved", value: resolved, color: "text-green-600", bg: "bg-green-50", border: "border-green-100", icon: CheckCircle },
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
      {critical > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-red-800">{critical} Critical alert{critical > 1 ? "s" : ""} need immediate attention</p>
            <p className="text-xs text-red-600 mt-0.5">These campaigns may involve fraudulent activity. Review and take action promptly.</p>
          </div>
          <button className="ml-auto bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-600 transition-colors flex-shrink-0">
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
        {filtered.map((f) => (
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
                  <button className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-semibold hover:bg-amber-100 transition-colors">
                    <Clock className="w-3.5 h-3.5" /> Mark Under Review
                  </button>
                  <button className="flex items-center gap-1.5 px-3.5 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors">
                    <XCircle className="w-3.5 h-3.5" /> Suspend Campaign
                  </button>
                  <button className="flex items-center gap-1.5 px-3.5 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-semibold hover:bg-green-100 transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" /> Dismiss Alert
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