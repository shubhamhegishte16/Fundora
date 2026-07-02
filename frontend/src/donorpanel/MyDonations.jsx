import React, { useState } from "react";
import { LayoutGrid, CheckCircle, Clock, Calendar, Download, ChevronLeft, ChevronRight } from "lucide-react";

const TABS = [
  { label: "All Saved",   icon: LayoutGrid,   filter: null },
  { label: "Completed",  icon: CheckCircle,  filter: "Completed" },
  { label: "In Progress",icon: Clock,        filter: "In Progress" },
  { label: "Upcoming",   icon: Calendar,     filter: "Upcoming" },
];

const DONATIONS = [
  { id:1, title:"Empower Rural Education", creator:"Teach India",       amount:"₹50,001", status:"Completed",  date:"25 Jun,2026", image:"https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&auto=format&fit=crop" },
  { id:2, title:"Clean Water",             creator:"Water For Life",    amount:"₹10,001", status:"Completed",  date:"21 May,2026", image:"https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=200&auto=format&fit=crop" },
  { id:3, title:"Support Cancer Patients", creator:"Hope Foundation",   amount:"₹5,101",  status:"Completed",  date:"20 May,2026", image:"https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=200&auto=format&fit=crop" },
  { id:4, title:"Animal Shelter Care",     creator:"Paws & Hearts",     amount:"₹20,201", status:"Completed",  date:"15 Apr,2026", image:"https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&auto=format&fit=crop" },
  { id:5, title:"Plant Trees Save Earth",  creator:"Green Future",      amount:"₹30,201", status:"Completed",  date:"21 Jan,2026", image:"https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200&auto=format&fit=crop" },
  { id:6, title:"Digital Literacy Drive",  creator:"Code For India",    amount:"₹8,500",  status:"In Progress",date:"10 Jun,2026", image:"https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=200&auto=format&fit=crop" },
  { id:7, title:"Flood Relief Support",    creator:"Helping Hands",     amount:"₹12,000", status:"Upcoming",   date:"30 Jul,2026", image:"https://images.unsplash.com/photo-1547683905-f686c993aae5?w=200&auto=format&fit=crop" },
  { id:8, title:"Save Mangroves",          creator:"Ocean Warriors",    amount:"₹7,200",  status:"Upcoming",   date:"15 Aug,2026", image:"https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200&auto=format&fit=crop" },
];

const STATUS_STYLE = {
  "Completed":  "bg-emerald-100 text-emerald-700",
  "In Progress":"bg-blue-100 text-blue-700",
  "Upcoming":   "bg-amber-100 text-amber-700",
};

const PER_PAGE = 5;

export default function MyDonations() {
  const [tab, setTab]   = useState(0);
  const [page, setPage] = useState(1);

  const filtered   = TABS[tab].filter ? DONATIONS.filter(d => d.status === TABS[tab].filter) : DONATIONS;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const rows       = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const switchTab = (i) => { setTab(i); setPage(1); };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900">My Donations</h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">Track all your contributions and download receipts.</p>
      </div>

      {/* Card */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden p-6">

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(({ label, icon: Icon }, i) => {
            const isActive = tab === i;
            const count = (TABS[i].filter ? DONATIONS.filter(d => d.status === TABS[i].filter) : DONATIONS).length;
            return (
            <button
              key={label}
              onClick={() => switchTab(i)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition-all border ${
                isActive
                  ? "bg-white border-gray-300 text-gray-900 shadow-sm"
                  : "bg-white border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300"
              }`}
            >
              <Icon size={16} className={isActive ? "text-emerald-500" : "text-gray-400"} />
              {label}
              <span className={`ml-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                isActive ? "bg-emerald-500 text-white" : "border border-gray-200 text-gray-400"
              }`}>{count}</span>
            </button>
            )
          })}
        </div>

        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 pb-4 text-xs font-bold text-gray-900 border-b border-gray-200">
          {["Campaign","Amount","Status","Date","Receipt"].map(h => <span key={h}>{h}</span>)}
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100 mt-2">
          {rows.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <CheckCircle size={36} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-semibold">No donations in this category</p>
            </div>
          ) : rows.map(d => (
            <div key={d.id} className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 items-center py-4 hover:bg-gray-50/60 transition-colors rounded-xl px-2 -mx-2">
              {/* Campaign */}
              <div className="flex items-center gap-3 min-w-0">
                <img src={d.image} alt={d.title} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-100" />
                <div className="min-w-0">
                  <p className="text-sm font-black text-gray-900 truncate">{d.title}</p>
                  <p className="text-xs text-gray-500 font-medium">by {d.creator}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-gray-800">{d.amount}</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full w-fit ${STATUS_STYLE[d.status]}`}>{d.status}</span>
              <span className="text-xs text-gray-500 font-bold">{d.date}</span>
              {/* Download */}
              <button className="flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-all cursor-pointer w-fit">
                <Download size={14} /> Download
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-1.5 pt-4">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center justify-center cursor-pointer transition-all active:scale-95">
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-semibold cursor-pointer transition-all active:scale-95 ${page === p ? "bg-[#10B981] text-white shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>{p}</button>
        ))}
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center justify-center cursor-pointer transition-all active:scale-95">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
