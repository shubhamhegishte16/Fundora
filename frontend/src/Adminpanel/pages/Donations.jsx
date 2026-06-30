import React, { useState } from "react";
import { Search, Download, HandCoins, TrendingUp, Users, ChevronLeft, ChevronRight, Eye, Receipt } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const donations = [
  { id: "DON-001", donor: "Ananya Sharma", email: "ananya@email.com", campaign: "Build Green School", amount: 2000, date: "01 Aug 2024", method: "UPI", status: "Completed", anonymous: false, avatar: "AS" },
  { id: "DON-002", donor: "Rohan Verma", email: "rohan@email.com", campaign: "Plant Trees for Tomorrow", amount: 1000, date: "01 Aug 2024", method: "Net Banking", status: "Completed", anonymous: false, avatar: "RV" },
  { id: "DON-003", donor: "Anonymous", email: "—", campaign: "Help Rural Hospital", amount: 3000, date: "31 Jul 2024", method: "UPI", status: "Completed", anonymous: true, avatar: "??" },
  { id: "DON-004", donor: "Arjun Nair", email: "arjun@email.com", campaign: "Support Women Entrepreneurs", amount: 750, date: "30 Jul 2024", method: "Card", status: "Completed", anonymous: false, avatar: "AN" },
  { id: "DON-005", donor: "Karan Mehta", email: "karan@email.com", campaign: "Clean Water Initiative", amount: 1500, date: "29 Jul 2024", method: "UPI", status: "Completed", anonymous: false, avatar: "KM" },
  { id: "DON-006", donor: "Priya Singh", email: "priya@email.com", campaign: "Build Green School", amount: 5000, date: "28 Jul 2024", method: "NEFT", status: "Completed", anonymous: false, avatar: "PS" },
  { id: "DON-007", donor: "Sumit Roy", email: "sumit@email.com", campaign: "Digital Library Project", amount: 800, date: "27 Jul 2024", method: "Card", status: "Pending", anonymous: false, avatar: "SR" },
  { id: "DON-008", donor: "Anonymous", email: "—", campaign: "Elderly Care Home", amount: 10000, date: "26 Jul 2024", method: "NEFT", status: "Completed", anonymous: true, avatar: "??" },
];

const chartData = [
  { date: "25 Jul", amount: 18000 },
  { date: "26 Jul", amount: 32000 },
  { date: "27 Jul", amount: 24000 },
  { date: "28 Jul", amount: 41000 },
  { date: "29 Jul", amount: 28000 },
  { date: "30 Jul", amount: 35000 },
  { date: "31 Jul", amount: 52000 },
  { date: "01 Aug", amount: 48000 },
];

const MethodBadge = ({ method }) => {
  const map = { UPI: "bg-indigo-100 text-indigo-700", "Net Banking": "bg-blue-100 text-blue-700", Card: "bg-purple-100 text-purple-700", NEFT: "bg-teal-100 text-teal-700" };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[method] || "bg-gray-100 text-gray-500"}`}>{method}</span>;
};

const StatusBadge = ({ status }) => {
  const map = { Completed: "bg-green-100 text-green-700", Pending: "bg-amber-100 text-amber-700", Failed: "bg-red-100 text-red-600" };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status]}`}>{status}</span>;
};

export default function Donations() {
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const total = donations.reduce((s, d) => s + d.amount, 0);
  const completed = donations.filter((d) => d.status === "Completed").length;
  const anonCount = donations.filter((d) => d.anonymous).length;

  const filtered = donations.filter((d) => {
    const matchSearch = d.donor.toLowerCase().includes(search.toLowerCase()) || d.campaign.toLowerCase().includes(search.toLowerCase());
    const matchMethod = methodFilter === "All" || d.method === methodFilter;
    const matchStatus = statusFilter === "All" || d.status === statusFilter;
    return matchSearch && matchMethod && matchStatus;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332]">Donations</h1>
          <p className="text-gray-500 text-sm mt-0.5">Monitor all donation transactions</p>
        </div>
        <button className="flex items-center gap-2 bg-[#2D6A4F] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1B4332] transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Collected", value: `₹${(total / 1000).toFixed(1)}k`, sub: "All time", icon: HandCoins, color: "from-[#2D6A4F] to-[#52B788]" },
          { label: "Today's Collection", value: "₹6,000", sub: "+18% vs yesterday", icon: TrendingUp, color: "from-emerald-500 to-teal-400" },
          { label: "Total Donors", value: "8,240", sub: "Unique donors", icon: Users, color: "from-blue-500 to-indigo-400" },
          { label: "Anonymous", value: anonCount, sub: "of this page", icon: HandCoins, color: "from-purple-500 to-violet-400" },
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

      {/* Area Chart */}
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

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search donor or campaign..."
            className="w-full pl-9 pr-4 py-2 bg-[#F0F7F4] rounded-xl text-sm outline-none" />
        </div>
        <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}
          className="px-3 py-2 bg-[#F0F7F4] rounded-xl text-sm text-gray-600 outline-none">
          <option value="All">All Methods</option>
          <option>UPI</option>
          <option>Net Banking</option>
          <option>Card</option>
          <option>NEFT</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-[#F0F7F4] rounded-xl text-sm text-gray-600 outline-none">
          <option value="All">All Status</option>
          <option>Completed</option>
          <option>Pending</option>
        </select>
      </div>

      {/* Table */}
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
              {filtered.map((d) => (
                <tr key={d.id} className="border-t border-gray-50 hover:bg-[#F9FFFE] transition-colors">
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{d.id}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${d.anonymous ? "bg-gray-400" : "bg-gradient-to-br from-[#2D6A4F] to-[#52B788]"}`}>
                        {d.avatar}
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
                    <span className="font-bold text-[#2D6A4F]">₹{d.amount.toLocaleString("en-IN")}</span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">{d.date}</td>
                  <td className="px-4 py-3.5"><MethodBadge method={d.method} /></td>
                  <td className="px-4 py-3.5"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1.5">
                      <button className="p-1.5 rounded-lg text-gray-400 hover:text-[#2D6A4F] hover:bg-[#F0F7F4]"><Eye className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-lg text-gray-400 hover:text-[#2D6A4F] hover:bg-[#F0F7F4]"><Receipt className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
          <p className="text-sm text-gray-500">Showing <span className="font-medium text-gray-700">{filtered.length}</span> of <span className="font-medium text-gray-700">{donations.length}</span> transactions</p>
          <div className="flex items-center gap-1.5">
            <button className="p-1.5 rounded-lg hover:bg-[#F0F7F4] text-gray-500"><ChevronLeft className="w-4 h-4" /></button>
            {[1, 2, 3].map((p) => (
              <button key={p} className={`w-8 h-8 rounded-lg text-sm font-medium ${p === 1 ? "bg-[#2D6A4F] text-white" : "text-gray-600 hover:bg-[#F0F7F4]"}`}>{p}</button>
            ))}
            <button className="p-1.5 rounded-lg hover:bg-[#F0F7F4] text-gray-500"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}