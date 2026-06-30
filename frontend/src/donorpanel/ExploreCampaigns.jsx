import React, { useState } from "react";
import { LayoutGrid, Heart, MapPin, Clock, Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const ExploreCampaigns = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filters, setFilters] = useState({
    category: "All Categories",
    goal: "Goal Amount",
    location: "Location",
    sort: "Most Popular",
    timing: "Ending Soon"
  });

  const options = {
    category: ["All Categories", "Education", "Environment", "Health & Medical", "Animal Welfare", "Disaster Relief"],
    goal: ["Goal Amount", "Under ₹5 Lakh", "₹5 Lakh - ₹10 Lakh", "Over ₹10 Lakh"],
    location: ["Location", "Mumbai", "Delhi", "Bangalore", "Pune", "Rural India"],
    sort: ["Most Popular", "Trending", "Newest First", "Highest Funded"],
    timing: ["Ending Soon", "Ending Today", "Ending this Week", "Ending this Month"]
  };

  const filterKeys = [
    { key: "category", icon: LayoutGrid, fill: false },
    { key: "goal", icon: Heart, fill: true },
    { key: "location", icon: MapPin, fill: false },
    { key: "sort", icon: Clock, fill: false },
    { key: "timing", icon: Calendar, fill: false }
  ];

  // Sample Campaign data from Figma mockup
  const campaigns = [
    { id: 1, title: "Empower Rural Education", creator: "Teach India", progress: 65, daysLeft: 15, raised: "₹6,50,000", goal: "₹10,00,000", image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&auto=format&fit=crop" },
    { id: 2, title: "Clean Water for All", creator: "Water For Life", progress: 70, daysLeft: 10, raised: "₹7,50,000", goal: "₹10,00,000", image: "https://images.unsplash.com/photo-1548824226-f525e556e3a2?w=500&auto=format&fit=crop" },
    { id: 3, title: "Support Cancer Patients", creator: "Hope Foundation", progress: 40, daysLeft: 30, raised: "₹4,00,000", goal: "₹10,00,000", image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop" },
    { id: 4, title: "Animal Shelter Care", creator: "Paws & Hearts", progress: 65, daysLeft: 15, raised: "₹6,50,000", goal: "₹10,00,000", image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop" },
    { id: 5, title: "Plant Trees Save Earth", creator: "Green Future", progress: 80, daysLeft: 5, raised: "₹8,00,000", goal: "₹10,00,000", image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&auto=format&fit=crop" },
    { id: 6, title: "Flood Relief Support", creator: "Helping Hands", progress: 60, daysLeft: 25, raised: "₹6,50,000", goal: "₹10,00,000", image: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=500&auto=format&fit=crop" }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header text */}
      <div>
        <h1 className="text-3xl font-black text-brand-text leading-tight">Explore Campaigns</h1>
        <p className="text-sm text-brand-secondary font-medium mt-1">Discover meaningful campaigns and support causes that create real impact.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {filterKeys.map(({ key, icon: Icon, fill }) => (
          <div key={key} className="relative shrink-0">
            <button onClick={() => setActiveDropdown(activeDropdown === key ? null : key)} className="flex items-center gap-2 bg-white border border-brand-border/60 hover:border-brand-border rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-brand-text whitespace-nowrap cursor-pointer transition-all shadow-xs active:scale-[0.98]"><Icon size={16} className={`text-primary-green ${fill ? "fill-primary-green" : ""}`} /><span>{filters[key]}</span><ChevronDown size={14} className="text-brand-secondary ml-1" /></button>
            {activeDropdown === key && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-brand-border/60 rounded-2xl shadow-lg py-2 z-50 animate-fadeIn">
                {options[key].map((opt) => (
                  <button key={opt} onClick={() => { setFilters(prev => ({ ...prev, [key]: opt })); setActiveDropdown(null); }} className={`w-full text-left px-4 py-2 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors ${filters[key] === opt ? "text-[#059669] bg-emerald-50/30" : "text-brand-text"}`}>{opt}</button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((camp) => (
          <div key={camp.id} className="bg-white border border-brand-border/60 rounded-3xl overflow-hidden hover:border-brand-border/80 transition-all hover:shadow-md flex flex-col group">
            {/* Image section */}
            <div className="h-48 w-full overflow-hidden relative">
              <img src={camp.image} alt={camp.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
            </div>

            {/* Campaign details */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black text-brand-text line-clamp-1 group-hover:text-primary-green transition-colors leading-snug cursor-pointer">{camp.title}</h3>
                <p className="text-xs font-semibold text-brand-secondary mt-1">by {camp.creator}</p>
              </div>

              {/* Progress and status */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-bold text-brand-secondary mb-2">
                  <span className="text-[#059669]">{camp.progress}% funded</span>
                  <span className="flex items-center gap-1"><Calendar size={13} className="text-brand-secondary" />{camp.daysLeft} days left</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-[#E1FDEC]/40 h-2 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-primary-green rounded-full transition-all duration-300" style={{ width: `${camp.progress}%` }} />
                </div>
              </div>

              {/* Raised vs Goal Info */}
              <div className="flex items-center justify-between text-xs font-bold text-brand-secondary mb-5">
                <div><span className="text-brand-text font-black text-sm">{camp.raised}</span> raised</div>
                <div className="text-right"><span className="text-brand-text font-black text-sm">{camp.goal}</span> Goal</div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 py-2.5 bg-[#E1FDEC]/80 hover:bg-[#E1FDEC] text-[#059669] font-black text-sm rounded-2xl transition-all cursor-pointer text-center active:scale-[0.98]">Donate Now</button>
                <button className="flex-1 py-2.5 border border-[#059669] hover:bg-emerald-50/20 text-[#059669] font-black text-sm rounded-2xl transition-all cursor-pointer text-center bg-white active:scale-[0.98]">Save</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination component */}
      <div className="flex justify-center items-center gap-1.5 pt-4">
        <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} className="w-8 h-8 rounded-lg border border-brand-border/60 text-brand-secondary hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-all active:scale-95"><ChevronLeft size={16} /></button>

        {[1, 2, 3, 4, 5].map((page) => (
          <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold cursor-pointer select-none transition-all active:scale-95 ${currentPage === page ? "bg-primary-green text-white shadow-xs" : "text-brand-secondary hover:bg-slate-50 hover:text-brand-text"}`}>{page}</button>
        ))}

        <button onClick={() => setCurrentPage(prev => Math.min(5, prev + 1))} className="w-8 h-8 rounded-lg border border-brand-border/60 text-brand-secondary hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-all active:scale-95"><ChevronRight size={16} /></button>
      </div>
    </div>
  );
};

export default ExploreCampaigns;
