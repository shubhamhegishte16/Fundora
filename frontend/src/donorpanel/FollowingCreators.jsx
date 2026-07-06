import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search, LayoutGrid, Heart, Calendar, Bell, ChevronDown, UserPlus, UserMinus, Loader2 } from "lucide-react";
import { discoverCreators, getFollowingCreators, toggleFollowCreator } from "../../services/donorCreatorService.js";

const CATEGORIES = ["All Categories", "Education", "Environment", "Health", "Community", "Disaster Relief", "Animal Welfare"];

const BADGE_COLORS = {
  Education: "bg-[#10B981] text-white",
  Environment: "bg-[#0EA5E9] text-white",
  Health: "bg-[#EF4444] text-white",
  Community: "bg-purple-500 text-white",
  "Disaster Relief": "bg-orange-500 text-white",
  "Animal Welfare": "bg-yellow-500 text-white",
};

export default function FollowingCreators() {
  const [activeTab, setActiveTab] = useState("following"); // 'following' | 'discover'
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCreators = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "following") {
        const res = await getFollowingCreators(category);
        if (res.success) setCreators(res.creators);
      } else {
        const res = await discoverCreators(search, category);
        if (res.success) setCreators(res.creators);
      }
    } catch (error) {
      console.error("Failed to fetch creators", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, category, search]);

  useEffect(() => {
    // Debounce search slightly for the discover tab
    const timer = setTimeout(() => {
      fetchCreators();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchCreators]);

  const handleToggleFollow = async (creatorId, currentFollowing) => {
    try {
      const res = await toggleFollowCreator(creatorId);
      if (res.success) {
        // If we are on 'following' tab and unfollowed, remove from list
        if (activeTab === 'following' && !res.isFollowing) {
          setCreators(prev => prev.filter(c => c.id !== creatorId));
        } else {
          // Otherwise update the specific creator's isFollowing state
          setCreators(prev => prev.map(c => 
            c.id === creatorId ? { ...c, isFollowing: res.isFollowing } : c
          ));
        }
      }
    } catch (error) {
      console.error("Failed to toggle follow", error);
    }
  };

  // The backend already filters based on search/category for discover
  // But for following, if we have local search text, we can filter locally too
  const filtered = useMemo(() => {
    if (activeTab === "discover") return creators; // backend handled search
    
    return creators.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [creators, search, activeTab]);

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-text">Creators</h1>
          <p className="text-sm text-brand-secondary font-medium mt-1">Discover and follow creators making an impact</p>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("following")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "following" ? "bg-white text-brand-text shadow-sm" : "text-brand-secondary hover:text-brand-text"
            }`}
          >
            Following
          </button>
          <button
            onClick={() => setActiveTab("discover")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "discover" ? "bg-white text-brand-text shadow-sm" : "text-brand-secondary hover:text-brand-text"
            }`}
          >
            Discover
          </button>
        </div>
      </div>

      {/* Search + Category Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-secondary" />
          <input
            type="text"
            placeholder="Search Creators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-brand-border/60 rounded-xl text-sm font-medium text-brand-text placeholder:text-brand-secondary/60 outline-none focus:border-[#10B981] transition-colors bg-white"
          />
        </div>

        {/* Category dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-4 py-2.5 border border-brand-border/60 rounded-xl text-sm font-semibold text-brand-text bg-white hover:border-brand-border transition-colors cursor-pointer"
          >
            <LayoutGrid size={14} className="text-brand-secondary" />
            {category}
            <ChevronDown size={14} className={`text-brand-secondary transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-brand-border/60 rounded-xl shadow-lg z-20 py-1 animate-fadeIn">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${category === cat ? "text-[#10B981] bg-emerald-50/60 font-bold" : "text-brand-text hover:bg-slate-50"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Creator Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="animate-spin text-[#10B981]" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-3 text-[#10B981]">
              <Search size={24} />
            </div>
            <p className="text-sm font-bold text-brand-text">No creators found</p>
            <p className="text-xs text-brand-secondary mt-1">Try adjusting your search or filter, or check the Discover tab.</p>
          </div>
        ) : (
          filtered.map((creator) => (
            <div
              key={creator.id}
              className="bg-white border border-brand-border/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-brand-border transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row gap-5">

                {/* Left — Avatar + Info */}
                <div className="flex items-start gap-4 lg:w-[38%] min-w-0">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-brand-border/40 shrink-0 bg-brand-border/10 text-brand-text text-2xl font-black uppercase">
                    {creator.name ? creator.name.charAt(0) : "?"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-brand-text leading-tight">{creator.name}</h3>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold rounded-md ${BADGE_COLORS[creator.category] || "bg-slate-500 text-white"}`}>
                      {creator.category}
                    </span>
                    <p className="text-xs text-brand-secondary font-medium mt-2 leading-relaxed line-clamp-2">{creator.bio}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-brand-secondary font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} /> {creator.campaigns} Campaigns
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Heart size={12} /> {creator.followers} Followers
                      </span>
                    </div>
                  </div>
                </div>

                {/* Middle — Stats */}
                <div className="flex flex-row lg:flex-col justify-between lg:justify-center gap-3 lg:w-[22%] lg:border-l lg:border-r lg:border-brand-border/40 lg:px-5">
                  <div>
                    <p className="text-xs text-brand-secondary font-semibold">Total Raised</p>
                    <p className="text-base font-black text-[#10B981]">{creator.totalRaised}</p>
                  </div>
                  <div>
                    <p className="text-xs text-brand-secondary font-semibold">Lives Impacted</p>
                    <p className="text-base font-black text-brand-text">{creator.livesImpacted}</p>
                  </div>
                  <div>
                    <p className="text-xs text-brand-secondary font-semibold">Success Rate</p>
                    <p className="text-base font-black text-brand-text">{creator.successRate}</p>
                  </div>
                </div>

                {/* Right — Recent Campaign & Actions */}
                <div className="lg:w-[40%] min-w-0 flex flex-col justify-between">
                  {creator.recentCampaign ? (
                    <>
                      <p className="text-xs font-bold text-brand-text mb-2.5">Recent Campaign</p>
                      <div className="flex items-start gap-3">
                        <img
                          src={creator.recentCampaign.image}
                          alt={creator.recentCampaign.title}
                          className="w-16 h-16 rounded-lg object-cover border border-brand-border/30 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-brand-text truncate">{creator.recentCampaign.title}</h4>
                          <p className="text-[10px] font-bold text-[#10B981] mt-0.5">{creator.recentCampaign.fundedPct}% funded</p>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                            <div className="bg-[#10B981] h-1.5 rounded-full transition-all" style={{ width: `${creator.recentCampaign.fundedPct}%` }} />
                          </div>
                          <div className="flex items-center justify-between text-[9px] font-bold text-brand-secondary mt-1">
                            <span>{creator.recentCampaign.raised} raised</span>
                            <span>{creator.recentCampaign.goal} Goal</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center border border-dashed border-brand-border/60 rounded-lg p-4">
                       <p className="text-xs font-bold text-brand-secondary">No active campaigns</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-brand-border/30">
                    <button 
                      onClick={() => handleToggleFollow(creator.id, creator.isFollowing)}
                      className={`flex items-center gap-1.5 px-4 py-1.5 border text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        creator.isFollowing 
                          ? "border-slate-300 text-slate-600 hover:bg-slate-50" 
                          : "border-[#10B981] bg-[#10B981] text-white hover:bg-emerald-600"
                      }`}
                    >
                      {creator.isFollowing ? <UserMinus size={14} /> : <UserPlus size={14} />}
                      {creator.isFollowing ? "Unfollow" : "Follow"}
                    </button>
                    <button className="px-4 py-1.5 border border-brand-border/60 text-brand-text text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                      Profile
                    </button>
                    <button className="p-1.5 border border-brand-border/60 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-brand-secondary hover:text-brand-text ml-auto">
                      <Bell size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
