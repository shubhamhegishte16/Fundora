import React, { useState } from "react";
import { BadgeCheck, Clock, XCircle, Eye, CheckCircle, Search, Upload, FileText, User, Shield } from "lucide-react";

const kycList = [
  { id: 1, name: "Ananya Sharma", email: "ananya@email.com", type: "Individual", submitted: "10 Jul 2024", status: "Verified", docs: ["Aadhaar Card", "PAN Card", "Selfie"], trust: 92, avatar: "AS" },
  { id: 2, name: "Rohan Verma", email: "rohan@email.com", type: "Individual", submitted: "15 Jul 2024", status: "Pending", docs: ["Aadhaar Card", "Selfie"], trust: 60, avatar: "RV" },
  { id: 3, name: "GreenEarth NGO", email: "greenearth@ngo.com", type: "Organization", submitted: "18 Jul 2024", status: "Pending", docs: ["Registration Cert.", "PAN Card", "Director ID"], trust: 70, avatar: "GE" },
  { id: 4, name: "Nikhil Gupta", email: "nikhil@email.com", type: "Individual", submitted: "08 Jul 2024", status: "Rejected", docs: ["Aadhaar Card"], trust: 20, avatar: "NG" },
  { id: 5, name: "Pooja Khanna", email: "pooja@email.com", type: "Individual", submitted: "20 Jul 2024", status: "Pending", docs: ["Aadhaar Card", "PAN Card"], trust: 55, avatar: "PK" },
  { id: 6, name: "HelpAid Trust", email: "helpaid@trust.org", type: "Organization", submitted: "22 Jul 2024", status: "Verified", docs: ["Registration Cert.", "Tax Exemption", "Director ID"], trust: 88, avatar: "HA" },
];

const StatusBadge = ({ status }) => {
  const map = {
    Verified: { cls: "bg-green-100 text-green-700", Icon: BadgeCheck },
    Pending: { cls: "bg-amber-100 text-amber-700", Icon: Clock },
    Rejected: { cls: "bg-red-100 text-red-600", Icon: XCircle },
  };
  const { cls, Icon } = map[status] || {};
  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${cls}`}>
      <Icon className="w-3.5 h-3.5" /> {status}
    </span>
  );
};

const TrustBar = ({ score }) => {
  const color = score >= 75 ? "bg-green-500" : score >= 50 ? "bg-amber-400" : "bg-red-500";
  const label = score >= 75 ? "text-green-600" : score >= 50 ? "text-amber-600" : "text-red-600";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">Trust Score</span>
        <span className={`font-bold ${label}`}>{score}/100</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
};

export default function KYCVerification() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const pending = kycList.filter((k) => k.status === "Pending").length;
  const verified = kycList.filter((k) => k.status === "Verified").length;
  const rejected = kycList.filter((k) => k.status === "Rejected").length;

  const filtered = kycList.filter((k) => {
    const matchSearch = k.name.toLowerCase().includes(search.toLowerCase()) || k.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || k.status === statusFilter;
    const matchType = typeFilter === "All" || k.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#1B4332]">KYC Verification</h1>
        <p className="text-gray-500 text-sm mt-0.5">Review and verify identity documents submitted by users</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pending Review", value: pending, icon: Clock, color: "from-amber-400 to-yellow-300", text: "text-amber-700" },
          { label: "Verified", value: verified, icon: BadgeCheck, color: "from-[#2D6A4F] to-[#52B788]", text: "text-[#2D6A4F]" },
          { label: "Rejected", value: rejected, icon: XCircle, color: "from-red-500 to-rose-400", text: "text-red-600" },
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

      {/* Pending Banner */}
      {pending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600" />
            <p className="text-sm font-semibold text-amber-800">{pending} KYC submissions awaiting review</p>
          </div>
          <button onClick={() => setStatusFilter("Pending")}
            className="bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors">
            Review Pending
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 bg-[#F0F7F4] rounded-xl text-sm outline-none" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-[#F0F7F4] rounded-xl text-sm text-gray-600 outline-none">
          <option value="All">All Status</option>
          <option>Pending</option>
          <option>Verified</option>
          <option>Rejected</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-[#F0F7F4] rounded-xl text-sm text-gray-600 outline-none">
          <option value="All">All Types</option>
          <option>Individual</option>
          <option>Organization</option>
        </select>
      </div>

      {/* Two Column: List + Detail */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* List */}
        <div className="xl:col-span-3 space-y-3">
          {filtered.map((k) => (
            <div key={k.id}
              onClick={() => setSelected(k)}
              className={`bg-white rounded-2xl p-4 shadow-sm border cursor-pointer transition-all hover:shadow-md
                ${selected?.id === k.id ? "border-[#52B788] ring-2 ring-[#52B788]/20" : "border-gray-100"}`}>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#52B788] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {k.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-800">{k.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${k.type === "Organization" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                      {k.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{k.email} · Submitted {k.submitted}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <StatusBadge status={k.status} />
                    <span className="text-xs text-gray-400">{k.docs.length} doc{k.docs.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-xl font-bold ${k.trust >= 75 ? "text-green-600" : k.trust >= 50 ? "text-amber-600" : "text-red-600"}`}>{k.trust}</div>
                  <p className="text-xs text-gray-400">Trust</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="xl:col-span-2">
          {selected ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#52B788] flex items-center justify-center text-white font-bold">
                  {selected.avatar}
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">{selected.name}</h2>
                  <p className="text-xs text-gray-500">{selected.email}</p>
                </div>
              </div>

              <TrustBar score={selected.trust} />

              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted Documents</p>
                {selected.docs.map((doc) => (
                  <div key={doc} className="flex items-center justify-between p-3 bg-[#F0F7F4] rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-[#2D6A4F]" />
                      <span className="text-sm font-medium text-gray-700">{doc}</span>
                    </div>
                    <button className="text-xs text-[#2D6A4F] hover:underline font-medium">View</button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-gray-400 mb-0.5">Type</p>
                  <p className="font-medium text-gray-700">{selected.type}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-gray-400 mb-0.5">Submitted</p>
                  <p className="font-medium text-gray-700">{selected.submitted}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <StatusBadge status={selected.status} />
              </div>

              {selected.status === "Pending" && (
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-[#2D6A4F] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1B4332] transition-colors">
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors">
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
    </div>
  );
}