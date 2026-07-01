import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import ExploreCampaigns from "./ExploreCampaigns";
import SavedCampaigns from "./SavedCampaigns";
import { Bell, Menu, TrendingUp, Users, Award, Leaf, Heart, ChevronRight } from "lucide-react";
import { getDonorDashboard } from "../../services/donorDashboardService.js";

const CIRC = 238.76;
const CATEGORIES = [
  { key: "Education",   color: "#10B981" },
  { key: "Environment", color: "#A7F3D0" },
  { key: "Health",      color: "#3B82F6" },
  { key: "Others",      color: "#F59E0B" },
];

const EmptyState = ({ icon, title, sub }) => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center mb-3 text-[#10B981]">{icon}</div>
    <p className="text-sm font-bold text-brand-text">{title}</p>
    <p className="text-xs text-brand-secondary mt-1">{sub}</p>
  </div>
);

const DonorPanel = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => new URLSearchParams(location.search).get("tab") || "Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user] = useState(() => { try { const u = localStorage.getItem("user"); return u ? JSON.parse(u) : { name: "Arjun Sharma" }; } catch { return { name: "Arjun Sharma" }; } });
  const [stats, setStats] = useState({ totalDonated: 0, campaignsSupported: 0, rewardsEarned: 0, impactScore: 0 });
  const [recentDonations, setRecentDonations] = useState([]);
  const [recommendedCampaigns, setRecommendedCampaigns] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState({ Education: 0, Environment: 0, Health: 0, Others: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { const params = new URLSearchParams(location.search); const tab = params.get("tab"); if (tab) setActiveTab(tab); }, [location.search]);

  useEffect(() => {
    if (activeTab !== "Dashboard") return;
    (async () => {
      try {
        setLoading(true);
        const res = await getDonorDashboard();
        if (res.success && res.data) {
          setStats(res.data.stats);
          setRecentDonations(res.data.recentDonations);
          setCategoryBreakdown(res.data.categoryBreakdown);
          setRecommendedCampaigns(res.data.recommendedCampaigns);
        }
      } catch { setError("Failed to load dashboard data."); }
      finally { setLoading(false); }
    })();
  }, [activeTab]);

  const totalSum = CATEGORIES.reduce((s, c) => s + (categoryBreakdown[c.key] || 0), 0);
  const dash = (amt) => totalSum === 0 ? `0 ${CIRC}` : `${((amt / totalSum) * CIRC).toFixed(1)} ${CIRC}`;
  const offset = (prev) => totalSum === 0 ? 0 : -((prev.reduce((a, b) => a + b, 0) / totalSum) * CIRC);

  const statCards = [
    { icon: <TrendingUp size={24} />, label: "Total Donated",       value: `₹${stats.totalDonated.toLocaleString("en-IN")}`, sub: `Across ${stats.campaignsSupported} campaigns`, subColor: "#059669" },
    { icon: <Users size={24} />,      label: "Campaigns Supported", value: stats.campaignsSupported,                          sub: "You've supported" },
    { icon: <Award size={24} />,      label: "Rewards Earned",      value: stats.rewardsEarned,                               sub: "Badges unlocked" },
    { icon: <Leaf size={24} />,       label: "Impact Score",        value: stats.impactScore,                                 sub: "Keep making impact!", subColor: "#059669" },
  ];

  if (loading && activeTab === "Dashboard") return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin h-10 w-10 border-4 border-[#10B981] border-t-transparent rounded-full" />
        <p className="text-sm font-semibold text-brand-secondary">Loading dashboard...</p>
      </div>
    </div>
  );

  if (error && activeTab === "Dashboard") return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans items-center justify-center">
      <div className="bg-white p-6 rounded-2xl border border-brand-border/60 shadow-sm text-center max-w-sm">
        <h3 className="text-lg font-bold text-brand-error mb-2">Error Loading Dashboard</h3>
        <p className="text-sm text-brand-secondary mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-[#10B981] text-white font-bold text-sm rounded-xl cursor-pointer hover:bg-[#059669] transition-all">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-brand-border/60 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-brand-text p-2 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"><Menu size={24} /></button>
            {activeTab === "Dashboard" && (
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-brand-text flex items-center gap-2">Welcome back, {user.name.split(" ")[0]}! <span className="animate-wiggle">👋</span></h2>
                <p className="text-xs sm:text-sm text-brand-secondary font-medium mt-0.5">Thank you for being a part of change.</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <button className="relative text-brand-text p-2.5 hover:bg-slate-50 rounded-full transition-all cursor-pointer border border-brand-border/60">
              <Bell size={20} /><span className="absolute top-2 right-2 w-2.5 h-2.5 bg-brand-error rounded-full ring-2 ring-white" />
            </button>
            <div className="flex items-center gap-3 border-l border-brand-border/60 pl-4 sm:pl-6">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop" alt={user.name} className="w-10 h-10 shrink-0 rounded-full border border-brand-border/60 object-cover shadow-sm" />
              <div className="hidden sm:block leading-none">
                <h4 className="text-sm font-bold text-brand-text">{user.name}</h4>
                <p className="text-[11px] text-brand-secondary font-semibold uppercase mt-0.5 tracking-wider">Donor</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-[1400px] w-full mx-auto space-y-6 sm:space-y-8 overflow-y-auto">
          {activeTab === "Dashboard" ? (
            <>
              {/* Stats Row */}
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {statCards.map((card) => (
                  <div key={card.label} className="bg-card-white border border-brand-border/60 rounded-2xl p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4.5 shadow-sm">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center shrink-0">{card.icon}</div>
                    <div className="leading-tight">
                      <p className="text-xs text-brand-secondary font-bold uppercase tracking-wider">{card.label}</p>
                      <h3 className="text-xl sm:text-2xl font-black text-brand-text mt-1">{card.value}</h3>
                      <p className="text-[11px] font-semibold mt-1" style={{ color: card.subColor || "var(--color-brand-secondary)" }}>{card.sub}</p>
                    </div>
                  </div>
                ))}
              </section>

              {/* Lower Section */}
              <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 items-start">

                {/* Recent Donations */}
                <div className="bg-card-white border border-brand-border/60 rounded-2xl p-4 sm:p-6 shadow-sm lg:col-span-3 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-brand-text">Recent Donations</h3>
                    <a href="#all-donations" className="text-xs font-bold text-[#10B981] hover:text-[#059669] flex items-center gap-0.5 transition-colors"><span>View All</span><ChevronRight size={14} /></a>
                  </div>
                  <div className="space-y-4 flex-1">
                    {recentDonations.length === 0
                      ? <EmptyState icon={<Heart size={20} />} title="No donations yet" sub="Your donation history will appear here" />
                      : recentDonations.map((d) => (
                          <div key={d._id || d.id} className="flex items-center justify-between p-2.5 sm:p-3 border border-brand-border/40 hover:border-brand-border rounded-xl transition-all hover:bg-slate-50/50">
                            <div className="flex items-center gap-3.5 min-w-0">
                              <img src={d.image} alt={d.title} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-brand-border/30 shadow-xs" />
                              <div className="leading-tight min-w-0">
                                <h4 className="text-sm font-bold text-brand-text truncate">{d.title}</h4>
                                <p className="text-[11px] text-brand-secondary font-semibold mt-0.5">By {d.creator}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-5 text-right shrink-0">
                              <div className="hidden sm:block leading-none">
                                <span className="inline-block px-2.5 py-1 text-[10px] font-bold text-[#059669] bg-[#E1FDEC] border border-[#A7F3D0]/60 rounded-md">{d.status}</span>
                                <p className="text-[10px] text-brand-secondary font-medium mt-1.5">{d.date}</p>
                              </div>
                              <span className="sm:hidden inline-block px-2 py-0.5 text-[9px] font-bold text-[#059669] bg-[#E1FDEC] rounded-md">{d.status}</span>
                            </div>
                          </div>
                        ))
                    }
                  </div>
                  <button className="w-full mt-6 py-3 bg-[#E1FDEC]/80 hover:bg-[#E1FDEC] text-[#059669] font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.99] cursor-pointer">View All Donations →</button>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-6 sm:space-y-8">

                  {/* Donut Chart */}
                  <div className="bg-card-white border border-brand-border/60 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-black text-brand-text">Donation Overview</h3>
                      <select className="bg-slate-50 border border-brand-border/60 text-xs font-semibold px-3 py-1.5 rounded-lg outline-none focus:border-[#10B981]">
                        <option>This Month</option><option>Last 3 Months</option><option>Yearly</option>
                      </select>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
                      <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                          {totalSum === 0
                            ? <circle cx="50" cy="50" r="38" fill="transparent" stroke="#E2E8F0" strokeWidth="12" />
                            : CATEGORIES.map((cat, i) => (
                                <circle key={cat.key} cx="50" cy="50" r="38" fill="transparent"
                                  stroke={cat.color} strokeWidth="12"
                                  strokeDasharray={dash(categoryBreakdown[cat.key])}
                                  strokeDashoffset={offset(CATEGORIES.slice(0, i).map(c => categoryBreakdown[c.key] || 0))} />
                              ))
                          }
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none select-none">
                          <span className="text-lg font-black text-brand-text">₹{totalSum.toLocaleString("en-IN")}</span>
                          <span className="text-[9px] font-bold text-brand-secondary uppercase mt-0.5">Donated</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-2.5 w-full">
                        {CATEGORIES.map((cat) => (
                          <div key={cat.key} className="flex items-center justify-between text-xs font-semibold">
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: cat.color }} /><span className="text-brand-secondary">{cat.key}</span></div>
                            <span className="text-brand-text font-bold">₹{(categoryBreakdown[cat.key] || 0).toLocaleString("en-IN")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recommended */}
                  <div className="bg-card-white border border-brand-border/60 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-black text-brand-text">Recommended For You</h3>
                      <a href="#recommendations" className="text-xs font-bold text-[#10B981] hover:text-[#059669] flex items-center gap-0.5 transition-colors"><span>View All</span><ChevronRight size={14} /></a>
                    </div>
                    <div className="space-y-4">
                      {recommendedCampaigns.length === 0
                        ? <EmptyState icon={<Heart size={18} />} title="No recommendations yet" sub="Active campaigns will appear here" />
                        : recommendedCampaigns.map((camp) => (
                            <div key={camp._id || camp.id} className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 border border-brand-border/30 hover:border-brand-border rounded-xl transition-all">
                              <div className="relative w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-lg overflow-hidden border border-brand-border/40">
                                <img src={camp.image} alt={camp.title} className="w-full h-full object-cover" />
                                <button className="absolute top-1 right-1 w-5 h-5 bg-white/95 rounded-full flex items-center justify-center text-brand-secondary hover:text-brand-error hover:scale-105 transition-all shadow-xs cursor-pointer"><Heart size={10} fill="none" /></button>
                              </div>
                              <div className="flex-1 min-w-0 leading-tight">
                                <h4 className="text-xs font-black text-brand-text truncate">{camp.title}</h4>
                                <p className="text-[10px] text-brand-secondary font-semibold mt-0.5">By {camp.creator}</p>
                                <div className="mt-2 space-y-1">
                                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden"><div className="bg-[#10B981] h-1.5 rounded-full transition-all" style={{ width: `${camp.progress}%` }} /></div>
                                  <div className="flex items-center justify-between text-[9px] font-bold text-brand-secondary">
                                    <span>{camp.progress}% funded</span><span className="text-brand-text">{camp.raised} / {camp.goal}</span>
                                  </div>
                                </div>
                              </div>
                              <button className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-[10px] rounded-lg shadow-xs hover:shadow-sm transition-all whitespace-nowrap cursor-pointer">Donate</button>
                            </div>
                          ))
                      }
                    </div>
                  </div>
                </div>
              </section>
            </>
          ) : activeTab === "Explore Campaigns" ? (
            <ExploreCampaigns />
          ) : activeTab === "Saved Campaigns" ? (
            <SavedCampaigns />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-brand-secondary">
              <h3 className="text-xl font-bold">{activeTab} Section</h3>
              <p className="text-sm mt-1">This section is currently under development.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DonorPanel;
