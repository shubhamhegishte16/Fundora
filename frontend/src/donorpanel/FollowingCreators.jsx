import React, { useState, useMemo } from "react";
import { Search, LayoutGrid, Heart, Calendar, Bell, ChevronDown } from "lucide-react";

const CATEGORIES = ["All Categories", "Education", "Environment", "Health"];

const SAMPLE_CREATORS = [
  {
    id: 1,
    name: "Teach India",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop",
    category: "Education",
    bio: "Empowering rural children through quality education and resources",
    campaigns: 12,
    followers: "12k",
    totalRaised: "₹18,50,000",
    livesImpacted: "25,000+",
    successRate: "92%",
    recentCampaign: {
      title: "Empower Rural Education",
      image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&auto=format&fit=crop",
      fundedPct: 65,
      raised: "₹8,50,5000",
      goal: "₹10,00,000",
    },
  },
  {
    id: 2,
    name: "Water For Life",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&auto=format&fit=crop",
    category: "Environment",
    bio: "Providing clean water access to communities in need",
    campaigns: 5,
    followers: "10k",
    totalRaised: "₹12,00,000",
    livesImpacted: "50,000+",
    successRate: "80%",
    recentCampaign: {
      title: "Clean Water For All",
      image: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=300&auto=format&fit=crop",
      fundedPct: 70,
      raised: "₹6,50,5000",
      goal: "₹10,00,000",
    },
  },
  {
    id: 3,
    name: "Hope Foundation",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop",
    category: "Health",
    bio: "Supporting patients and communities with critical healthcare",
    campaigns: 7,
    followers: "5k",
    totalRaised: "₹50,00,000",
    livesImpacted: "52,000+",
    successRate: "99%",
    recentCampaign: {
      title: "Support cancer Patients",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&auto=format&fit=crop",
      fundedPct: 78,
      raised: "₹8,50,5000",
      goal: "₹10,00,000",
    },
  },
];

const BADGE_COLORS = {
  Education: "bg-[#10B981] text-white",
  Environment: "bg-[#0EA5E9] text-white",
  Health: "bg-[#EF4444] text-white",
};

export default function FollowingCreators() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filtered = useMemo(() => {
    return SAMPLE_CREATORS.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchesCat = category === "All Categories" || c.category === category;
      return matchesSearch && matchesCat;
    });
  }, [search, category]);

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-brand-text">Following Creators</h1>
        <p className="text-sm text-brand-secondary font-medium mt-1">Creators you follow and their impact updates</p>
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
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-3 text-[#10B981]">
              <Search size={24} />
            </div>
            <p className="text-sm font-bold text-brand-text">No creators found</p>
            <p className="text-xs text-brand-secondary mt-1">Try adjusting your search or filter</p>
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
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-brand-border/40 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-brand-text leading-tight">{creator.name}</h3>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold rounded-md ${BADGE_COLORS[creator.category]}`}>
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

                {/* Right — Recent Campaign */}
                <div className="lg:w-[40%] min-w-0">
                  <p className="text-xs font-bold text-brand-text mb-2.5">Recent Campaigns</p>
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

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-3">
                    <button className="px-4 py-1.5 border border-[#10B981] text-[#10B981] text-xs font-bold rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer">
                      View Profile
                    </button>
                    <button className="p-1.5 border border-brand-border/60 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-brand-secondary hover:text-brand-text">
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
