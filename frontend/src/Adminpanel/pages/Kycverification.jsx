import React, { useState, useEffect, useCallback } from "react";
import { Clock, XCircle, CheckCircle, Search, FileText, Shield, X, Loader2 } from "lucide-react";
import adminAxios from "../utils/adminAxios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STATUS_UI = { verified: "Verified", pending: "Pending", rejected: "Rejected" };

const StatusBadge = ({ status }) => {
  const map = {
    Verified: { cls: "bg-green-100 text-green-700", Icon: CheckCircle },
    Pending: { cls: "bg-amber-100 text-amber-700", Icon: Clock },
    Rejected: { cls: "bg-red-100 text-red-600", Icon: XCircle },
  };

  const config = map[status];

  if (!config) {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        {status || "Unknown"}
      </span>
    );
  }

  const { cls, Icon } = config;

  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${cls}`}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
};

const initials = (name) => (name || "?").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");

export default function KYCVerification() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({ pending: 0, verified: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [acting, setActing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await adminAxios.get("/kyc/stats");
      setStats(data.stats);
    } catch (err) {
      console.error("Failed to load KYC stats:", err);
    }
  }, []);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const backendStatus = statusFilter === "All" ? "All" : statusFilter.toLowerCase();
      const { data } = await adminAxios.get("/kyc", { params: { status: backendStatus } });
      setSubmissions(data.submissions || []);
    } catch (err) {
      console.error("Failed to load KYC submissions:", err);
      setError(err.response?.data?.message || "Failed to load KYC submissions.");
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  useEffect(() => {
    if (selected) {
      const fresh = submissions.find((s) => s.id === selected.id);
      setSelected(fresh || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissions]);

  const filtered = submissions.filter((k) => {
    const name = k.foundationName || k.name || "";
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) || (k.email || "").toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const handleApprove = async (id) => {
    setActing(true);
    try {
      await adminAxios.patch(`/kyc/${id}/approve`);
      await Promise.all([fetchSubmissions(), fetchStats()]);
    } catch (err) {
      console.error("Approve failed:", err);
      alert(err.response?.data?.message || "Failed to approve KYC.");
    } finally {
      setActing(false);
    }
  };

  const openReject = () => { setRejectReason(""); setRejectOpen(true); };

  const submitReject = async () => {
    if (!selected || !rejectReason.trim()) return;
    setActing(true);
    try {
      await adminAxios.patch(`/kyc/${selected.id}/reject`, { reason: rejectReason.trim() });
      setRejectOpen(false);
      await Promise.all([fetchSubmissions(), fetchStats()]);
    } catch (err) {
      console.error("Reject failed:", err);
      alert(err.response?.data?.message || "Failed to reject KYC.");
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#1B4332]">KYC Verification</h1>
        <p className="text-gray-500 text-sm mt-0.5">Review and verify identity documents submitted by campaign creators</p>
      </div>

      {error && <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pending Review", value: stats.pending, icon: Clock, color: "from-amber-400 to-yellow-300", text: "text-amber-700" },
          { label: "Verified", value: stats.verified, icon: CheckCircle, color: "from-[#2D6A4F] to-[#52B788]", text: "text-[#2D6A4F]" },
          { label: "Rejected", value: stats.rejected, icon: XCircle, color: "from-red-500 to-rose-400", text: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {stats.pending > 0 && statusFilter !== "Pending" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600" />
            <p className="text-sm font-semibold text-amber-800">{stats.pending} KYC submissions awaiting review</p>
          </div>
          <button onClick={() => setStatusFilter("Pending")}
            className="bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors">
            Review Pending
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 bg-[#F0F7F4] rounded-xl text-sm outline-none" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setSelected(null); }}
          className="px-3 py-2 bg-[#F0F7F4] rounded-xl text-sm text-gray-600 outline-none">
          <option value="All">All Status</option>
          <option>Pending</option>
          <option>Verified</option>
          <option>Rejected</option>
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3 space-y-3">
          {loading ? (
            <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-gray-100">
              <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> Loading submissions...
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-gray-100">No KYC submissions found.</div>
          ) : filtered.map((k) => {
            const displayName = k.foundationName || k.name;
            const statusLabel = STATUS_UI[k.kycStatus] || k.kycStatus;
            return (
              <div key={k.id}
                onClick={() => setSelected(k)}
                className={`bg-white rounded-2xl p-4 shadow-sm border cursor-pointer transition-all hover:shadow-md
                  ${selected?.id === k.id ? "border-[#52B788] ring-2 ring-[#52B788]/20" : "border-gray-100"}`}>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#52B788] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {initials(displayName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-800">{displayName}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${k.foundationName ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                        {k.foundationName ? "Organization" : "Individual"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{k.email} · Submitted {fmtDate(k.submittedAt)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <StatusBadge status={statusLabel} />
                      <span className="text-xs text-gray-400">{k.idType || "No ID type"}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="xl:col-span-2">
          {selected ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#52B788] flex items-center justify-center text-white font-bold">
                  {initials(selected.foundationName || selected.name)}
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">{selected.foundationName || selected.name}</h2>
                  <p className="text-xs text-gray-500">{selected.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted Document</p>
                {selected.idFileUrl ? (
                  <div className="flex items-center justify-between p-3 bg-[#F0F7F4] rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-[#2D6A4F]" />
                      <span className="text-sm font-medium text-gray-700">{selected.idType || "ID Document"}</span>
                    </div>
                    <a href={selected.idFileUrl.startsWith("http") ? selected.idFileUrl : `${API_BASE}${selected.idFileUrl}`}
                      target="_blank" rel="noopener noreferrer" className="text-xs text-[#2D6A4F] hover:underline font-medium">View</a>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No document uploaded</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-gray-400 mb-0.5">ID Type</p>
                  <p className="font-medium text-gray-700">{selected.idType || "—"}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-gray-400 mb-0.5">ID Number</p>
                  <p className="font-medium text-gray-700">{selected.idNumber || "—"}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-gray-400 mb-0.5">Phone</p>
                  <p className="font-medium text-gray-700">{selected.phone || "—"}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-gray-400 mb-0.5">Submitted</p>
                  <p className="font-medium text-gray-700">{fmtDate(selected.submittedAt)}</p>
                </div>
                {selected.address && (
                  <div className="bg-gray-50 p-3 rounded-xl col-span-2">
                    <p className="text-gray-400 mb-0.5">Address</p>
                    <p className="font-medium text-gray-700">{selected.address}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <StatusBadge status={STATUS_UI[selected.kycStatus] || selected.kycStatus} />
              </div>

              {selected.kycStatus === "rejected" && selected.kycRejectionReason && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-700">
                  <span className="font-semibold">Rejection reason: </span>{selected.kycRejectionReason}
                </div>
              )}

              {selected.kycStatus === "pending" && (
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button onClick={() => handleApprove(selected.id)} disabled={acting}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#2D6A4F] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1B4332] transition-colors disabled:opacity-50">
                    {acting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Approve
                  </button>
                  <button onClick={openReject} disabled={acting}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-200 p-10 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#D8F3DC] flex items-center justify-center mb-3">
                <Shield className="w-7 h-7 text-[#52B788]" />
              </div>
              <p className="font-medium text-gray-700">Select a KYC submission</p>
              <p className="text-xs text-gray-400 mt-1">Click on any item to review documents and take action</p>
            </div>
          )}
        </div>
      </div>

      {rejectOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 text-lg">Reject KYC</h3>
              <button onClick={() => setRejectOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Reason for rejection *</label>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#2D6A4F]" placeholder="e.g. Document image unclear" />
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setRejectOpen(false)} className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={submitReject} disabled={acting || !rejectReason.trim()}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
                {acting && <Loader2 className="w-4 h-4 animate-spin" />} Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
