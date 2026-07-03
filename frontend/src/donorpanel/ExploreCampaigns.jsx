import React, { useState, useEffect, useCallback } from "react";
import { LayoutGrid, Heart, MapPin, Clock, Calendar, ChevronDown, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import CampaignDetail from "./CampaignDetail";
import { getAllActiveCampaigns, toggleSaveCampaign } from "../../services/donorCampaignService.js";

const ExploreCampaigns = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
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

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch campaigns function - can be called manually
  const fetchCampaigns = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const res = await getAllActiveCampaigns();
      if (res.success && res.data) {
        setCampaigns(res.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      setError("Failed to load campaigns.");
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchCampaigns(true);
  }, [fetchCampaigns]);

  // Auto-refresh every 30 seconds to keep data fresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCampaigns(false);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchCampaigns]);

  const handleSave = async (e, campId) => {
    e.stopPropagation();
    try {
      await toggleSaveCampaign(campId);
      alert("Campaign saved successfully!");
    } catch (err) {
      console.error("Failed to save campaign", err);
      alert("Failed to save campaign.");
    }
  };

  // Handle campaign back - refresh the list
  const handleCampaignBack = useCallback(async () => {
    setSelectedCampaign(null);
    // Refresh campaigns to get updated data after donation
    await fetchCampaigns(false);
  }, [fetchCampaigns]);

  // If a campaign is selected, show detail view
  if (selectedCampaign) {
    return (
      <CampaignDetail 
        campaign={selectedCampaign} 
        onBack={handleCampaignBack}
        onDonationComplete={() => {
          // This will be called when donation is complete
          // It triggers a refresh when the user returns to the list
        }}
      />
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header with refresh button */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-brand-text leading-tight">Explore Campaigns</h1>
          <p className="text-sm text-brand-secondary font-medium mt-1">
            Discover meaningful campaigns and support causes that create real impact.
          </p>
          {lastUpdated && (
            <p className="text-xs text-brand-secondary mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={() => fetchCampaigns(false)}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-brand-border/60 rounded-xl text-sm font-semibold text-brand-secondary hover:border-brand-border transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={`${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {filterKeys.map(({ key, icon: Icon, fill }) => (
          <div key={key} className="relative shrink-0">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === key ? null : key)} 
              className="flex items-center gap-2 bg-white border border-brand-border/60 hover:border-brand-border rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-brand-text whitespace-nowrap cursor-pointer transition-all shadow-xs active:scale-[0.98]"
            >
              <Icon size={16} className={`text-primary-green ${fill ? "fill-primary-green" : ""}`} />
              <span>{filters[key]}</span>
              <ChevronDown size={14} className="text-brand-secondary ml-1" />
            </button>
            {activeDropdown === key && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-brand-border/60 rounded-2xl shadow-lg py-2 z-50 animate-fadeIn">
                {options[key].map((opt) => (
                  <button 
                    key={opt} 
                    onClick={() => { 
                      setFilters(prev => ({ ...prev, [key]: opt })); 
                      setActiveDropdown(null); 
                    }} 
                    className={`w-full text-left px-4 py-2 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors ${filters[key] === opt ? "text-[#059669] bg-emerald-50/30" : "text-brand-text"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-[#10B981] border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <div className="text-center text-brand-error font-semibold py-10">{error}</div>
      ) : campaigns.length === 0 ? (
        <div className="text-center text-brand-secondary font-semibold py-10">No campaigns found.</div>
      ) : (
        <>
          {/* Campaigns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((camp) => (
              <div 
                key={camp.id} 
                className="bg-white border border-brand-border/60 rounded-3xl overflow-hidden hover:border-brand-border/80 transition-all hover:shadow-md flex flex-col group cursor-pointer" 
                onClick={() => setSelectedCampaign(camp)}
              >
                {/* Image section */}
                <div className="h-48 w-full overflow-hidden relative">
                  <img 
                    src={camp.image} 
                    alt={camp.title} 
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" 
                  />
                  {/* Progress badge on image */}
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {camp.progress}% funded
                  </div>
                </div>

                {/* Campaign details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-black text-brand-text line-clamp-1 group-hover:text-primary-green transition-colors leading-snug">
                      {camp.title}
                    </h3>
                    <p className="text-xs font-semibold text-brand-secondary mt-1">by {camp.creator}</p>
                  </div>

                  {/* Progress and status */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-bold text-brand-secondary mb-2">
                      <span className="text-[#059669]">{camp.progress}% funded</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-brand-secondary" />
                        {camp.daysLeft || 30} days left
                      </span>
                    </div>
                    {/* Progress bar - animated */}
                    <div className="w-full bg-[#E1FDEC]/40 h-2 rounded-full overflow-hidden mb-4">
                      <div 
                        className="h-full bg-primary-green rounded-full transition-all duration-1000 ease-out" 
                        style={{ 
                          width: `${Math.min(camp.progress || 0, 100)}%`,
                          transition: 'width 1s cubic-bezier(0.22, 1, 0.36, 1)'
                        }} 
                      />
                    </div>
                  </div>

                  {/* Raised vs Goal Info */}
                  <div className="flex items-center justify-between text-xs font-bold text-brand-secondary mb-5">
                    <div>
                      <span className="text-brand-text font-black text-sm">
                        {typeof camp.raised === 'number' ? `₹${camp.raised.toLocaleString('en-IN')}` : camp.raised}
                      </span> raised
                    </div>
                    <div className="text-right">
                      <span className="text-brand-text font-black text-sm">
                        {typeof camp.goal === 'number' ? `₹${camp.goal.toLocaleString('en-IN')}` : camp.goal}
                      </span> Goal
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button 
                      className="flex-1 py-2.5 bg-[#E1FDEC]/80 hover:bg-[#E1FDEC] text-[#059669] font-black text-sm rounded-2xl transition-all cursor-pointer text-center active:scale-[0.98]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCampaign(camp);
                      }}
                    >
                      View
                    </button>
                    <button 
                      onClick={(e) => handleSave(e, camp.id)} 
                      className="flex-1 py-2.5 border border-[#059669] hover:bg-emerald-50/20 text-[#059669] font-black text-sm rounded-2xl transition-all cursor-pointer text-center bg-white active:scale-[0.98]"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination component */}
          <div className="flex justify-center items-center gap-1.5 pt-4">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
              className="w-8 h-8 rounded-lg border border-brand-border/60 text-brand-secondary hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-all active:scale-95"
            >
              <ChevronLeft size={16} />
            </button>

            {[1, 2, 3, 4, 5].map((page) => (
              <button 
                key={page} 
                onClick={() => setCurrentPage(page)} 
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold cursor-pointer select-none transition-all active:scale-95 ${currentPage === page ? "bg-primary-green text-white shadow-xs" : "text-brand-secondary hover:bg-slate-50 hover:text-brand-text"}`}
              >
                {page}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(prev => Math.min(5, prev + 1))} 
              className="w-8 h-8 rounded-lg border border-brand-border/60 text-brand-secondary hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-all active:scale-95"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExploreCampaigns;