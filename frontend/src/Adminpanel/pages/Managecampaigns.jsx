import React, { useState } from "react";
import { Search, CheckCircle, XCircle, Eye, MoreHorizontal, Clock, Megaphone } from "lucide-react";

const campaigns = [
  { id: 1, title: "Build Green School", creator: "Ananya Sharma", category: "Education", goal: 250000, raised: 185000, status: "Active", deadline: "30 days left", flagged: false, emoji: "🏫" },
  { id: 2, title: "Plant Trees for Tomorrow", creator: "Rohan Verma", category: "Environment", goal: 200000, raised: 120000, status: "Active", deadline: "45 days left", flagged: false, emoji: "🌳" },
  { id: 3, title: "Help Rural Hospital", creator: "Meera Iyer", category: "Healthcare", goal: 130000, raised: 104000, status: "Active", deadline: "15 days left", flagged: false, emoji: "🏥" },
  { id: 4, title: "Support Women Entrepreneurs", creator: "Arjun Nair", category: "Social", goal: 100000, raised: 92000, status: "Pending", deadline: "28 days left", flagged: false, emoji: "👩‍💼" },
  { id: 5, title: "Clean Water Initiative", creator: "Pooja Khanna", category: "Environment", goal: 150000, raised: 45000, status: "Pending", deadline: "60 days left", flagged: true, emoji: "💧" },
  { id: 6, title: "Startup Accelerator Fund", creator: "Nikhil Gupta", category: "Startup", goal: 500000, raised: 80000, status: "Rejected", deadline: "Expired", flagged: true, emoji: "🚀" },
];

const categoryColors = {
  Education: "bg-blue-50 text-blue-600",
  Environment: "bg-emerald-50 text-emerald-600",
  Healthcare: "bg-rose-50 text-rose-600",
  Social: "bg-purple-50 text-purple-600",
  Startup: "bg-orange-50 text-orange-600",
};

const statusColors = {
  Active: "bg-emerald-50 text-emerald-600",
  Pending: "bg-amber-50 text-amber-600",
  Rejected: "bg-red-50 text-red-500",
};

export default function ManageCampaigns() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [actionMenu, setActionMenu] = useState(null);

  const filtered = campaigns.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.creator.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pending = campaigns.filter((c) => c.status === "Pending").length;

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Campaigns</h1>
          <p className="text-gray-400 text-sm mt-0.5">{campaigns.length} total campaigns</p>
        </div>
        {pending > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-700 px-4 py-2 rounded-xl text-sm">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{pending} awaiting review</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-100 shadow-sm"
          />
        </div>
        <div className="flex gap-2 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
          {["All", "Active", "Pending", "Rejected"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all ${statusFilter === s ? "bg-[#2D6A4F] text-white" : "text-gray-500 hover:bg-gray-50"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const pct = Math.round((c.raised / c.goal) * 100);
          return (
            <div key={c.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow ${c.flagged ? "border-red-100" : "border-gray-100"}`}>
              {/* Top color strip */}
              <div className={`h-1.5 w-full ${c.status === "Active" ? "bg-gradient-to-r from-[#2D6A4F] to-[#52B788]" : c.status === "Pending" ? "bg-amber-300" : "bg-gray-200"}`} />

              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{c.emoji}</span>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-[14px] leading-snug">{c.title}</h3>
                      <p className="text-[12px] text-gray-400 mt-0.5">by {c.creator}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button onClick={() => setActionMenu(actionMenu === c.id ? null : c.id)}
                      className="text-gray-300 hover:text-gray-500 p-1">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {actionMenu === c.id && (
                      <div className="absolute right-0 top-7 z-20 w-36 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden">
                        {[{ icon: Eye, label: "View" }, { icon: CheckCircle, label: "Approve" }, { icon: XCircle, label: "Reject", danger: true }].map((a) => (
                          <button key={a.label} onClick={() => setActionMenu(null)}
                            className={`w-full flex items-center gap-2 px-3.5 py-2 text-[13px] transition-colors
                              ${a.danger ? "text-red-500 hover:bg-red-50" : "text-gray-600 hover:bg-gray-50"}`}>
                            <a.icon className="w-3.5 h-3.5" />{a.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${categoryColors[c.category]}`}>{c.category}</span>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusColors[c.status]}`}>{c.status}</span>
                  {c.flagged && <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-500">🚩 Flagged</span>}
                  <span className="text-[11px] text-gray-400 ml-auto">{c.deadline}</span>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-[12px] mb-1.5">
                    <span className="font-semibold text-[#2D6A4F]">₹{c.raised.toLocaleString("en-IN")}</span>
                    <span className="text-gray-400">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct >= 70 ? "bg-[#52B788]" : pct >= 40 ? "bg-amber-400" : "bg-gray-300"}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">of ₹{c.goal.toLocaleString("en-IN")} goal</p>
                </div>

                {c.status === "Pending" && (
                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-50">
                    <button className="flex-1 flex items-center justify-center gap-1.5 bg-[#F0F7F4] text-[#2D6A4F] py-2 rounded-xl text-[12px] font-semibold hover:bg-[#D8F3DC] transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 text-red-500 py-2 rounded-xl text-[12px] font-semibold hover:bg-red-100 transition-colors">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}