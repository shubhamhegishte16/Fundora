import React, { useState, useEffect } from "react";
import { Heart, Calendar, LayoutGrid, Leaf, Shield, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { getSavedCampaigns, toggleSaveCampaign } from "../../services/donorCampaignService.js";

const SavedCampaigns = () => {
  const [activeCategory, setActiveCategory] = useState("All Saved");
  const [currentPage, setCurrentPage] = useState(1);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { label: "All Saved", count: campaigns.length, icon: LayoutGrid },
    { label: "Education", count: campaigns.filter(c => c.category === "Education").length, icon: Leaf },
    { label: "Environment", count: campaigns.filter(c => c.category === "Environment").length, icon: Leaf },
    { label: "Health", count: campaigns.filter(c => c.category === "Health").length, icon: Shield },
    { label: "Others", count: campaigns.filter(c => c.category === "Others").length, icon: Sparkles },
  ];

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const res = await getSavedCampaigns();
      if (res.success) {
        setCampaigns(res.data || []);
      }
    } catch (err) {
      setError("Failed to load saved campaigns");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = activeCategory === "All Saved" ? campaigns : campaigns.filter(c => c.category === activeCategory);
  const totalPages = Math.max(1, Math.ceil(filtered.length / 6));
  const paginated = filtered.slice((currentPage - 1) * 6, currentPage * 6);

  const toggleSave = async (id) => {
    try {
      await toggleSaveCampaign(id);
      // Remove it from the current list optimistically or refetch
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error("Failed to unsave campaign", err);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-brand-text leading-tight">Explore Campaigns</h1>
        <p className="text-sm text-brand-secondary font-medium mt-1">Discover meaningful campaigns and support causes that create real impact.</p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-3">
        {categories.map(({ label, count, icon: Icon }) => {
          const isActive = activeCategory === label;
          return (
            <button
              key={label}
              onClick={() => { setActiveCategory(label); setCurrentPage(1); }}
              className={`flex items-center gap-2.5 px-4.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer transition-all active:scale-[0.97] border ${
                isActive
                  ? "bg-white border-brand-border text-brand-text shadow-xs"
                  : "bg-white border-brand-border/60 text-brand-secondary hover:text-brand-text hover:border-brand-border"
              }`}
            >
              <Icon size={16} className={isActive ? "text-[#10B981]" : "text-brand-secondary/60"} />
              <span>{label}</span>
              <span className={`ml-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                isActive ? "bg-[#10B981] text-white" : "border border-brand-border text-brand-secondary/60"
              }`}>{count}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-[#10B981] border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <div className="text-center text-brand-error font-semibold py-10">{error}</div>
      ) : campaigns.length === 0 ? (
        <div className="text-center text-brand-secondary font-semibold py-10">No saved campaigns yet.</div>
      ) : (
        <>
          {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginated.map((camp) => (
          <div key={camp.id} className="bg-white border border-brand-border/60 rounded-3xl overflow-hidden hover:border-brand-border/80 transition-all hover:shadow-md flex flex-col group">
            {/* Image with Heart */}
            <div className="h-48 w-full overflow-hidden relative">
              <img src={camp.image} alt={camp.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
              <button
                onClick={() => toggleSave(camp.id)}
                className="absolute top-4 right-4 w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md hover:scale-105 transition-all cursor-pointer border border-brand-border/30"
              >
                <Heart size={18} className="text-red-500 fill-red-500" />
              </button>
            </div>

            {/* Card Body */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black text-brand-text line-clamp-1 group-hover:text-primary-green transition-colors leading-snug cursor-pointer">{camp.title}</h3>
                <p className="text-xs font-semibold text-brand-secondary mt-1">by {camp.creator}</p>
              </div>

              {/* Progress Info */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-bold text-brand-secondary mb-2">
                  <span className="text-[#059669]">{camp.progress}% funded</span>
                  <span className="flex items-center gap-1"><Calendar size={13} className="text-brand-secondary" />{camp.daysLeft} days left</span>
                </div>
                <div className="w-full bg-[#E1FDEC]/40 h-2 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-primary-green rounded-full transition-all duration-300" style={{ width: `${camp.progress}%` }} />
                </div>
              </div>

              {/* Raised vs Goal */}
              <div className="flex items-center justify-between text-xs font-bold text-brand-secondary mb-5">
                <div><span className="text-brand-text font-black text-sm">{typeof camp.raised === 'number' ? `₹${camp.raised.toLocaleString('en-IN')}` : camp.raised}</span> raised</div>
                <div className="text-right"><span className="text-brand-text font-black text-sm">{typeof camp.goal === 'number' ? `₹${camp.goal.toLocaleString('en-IN')}` : camp.goal}</span> Goal</div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 py-2.5 bg-[#E1FDEC]/80 hover:bg-[#E1FDEC] text-[#059669] font-black text-sm rounded-2xl transition-all cursor-pointer text-center active:scale-[0.98]">Donate Now</button>
                <button onClick={() => toggleSave(camp.id)} className="flex-1 py-2.5 border border-[#059669] hover:bg-emerald-50/20 text-[#059669] font-black text-sm rounded-2xl transition-all cursor-pointer text-center bg-white active:scale-[0.98]">Unsave</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-1.5 pt-4">
        <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} className="w-8 h-8 rounded-lg border border-brand-border/60 text-brand-secondary hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-all active:scale-95"><ChevronLeft size={16} /></button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold cursor-pointer select-none transition-all active:scale-95 ${currentPage === page ? "bg-primary-green text-white shadow-xs" : "text-brand-secondary hover:bg-slate-50 hover:text-brand-text"}`}>{page}</button>
        ))}
        <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} className="w-8 h-8 rounded-lg border border-brand-border/60 text-brand-secondary hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-all active:scale-95"><ChevronRight size={16} /></button>
      </div>
      </>
      )}
    </div>
  );
};

export default SavedCampaigns;
