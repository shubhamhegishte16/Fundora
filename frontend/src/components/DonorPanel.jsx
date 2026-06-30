import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { 
  Bell, 
  Menu, 
  TrendingUp, 
  Users, 
  Award, 
  Leaf, 
  Heart,
  ChevronRight
} from "lucide-react";

const DonorPanel = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load user data dynamically from localStorage, fallback to Arjun Sharma
  const [user] = useState(() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : { name: "Arjun Sharma" };
    } catch (e) {
      return { name: "Arjun Sharma" };
    }
  });

  // Recent donations mock data matching Figma
  const recentDonations = [
    {
      id: 1,
      title: "Clean Water Project",
      creator: "Water For All",
      status: "Completed",
      date: "25 Jun 2026",
      image: "https://images.unsplash.com/photo-1548824226-f525e556e3a2?w=120&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Education for All",
      creator: "Future Foundation",
      status: "Completed",
      date: "21 Feb 2026",
      image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=120&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Medical Aid Support",
      creator: "Health Helpers",
      status: "Completed",
      date: "17 Mar 2026",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=120&auto=format&fit=crop"
    },
    {
      id: 4,
      title: "Plant Trees Save Earth",
      creator: "Green Future",
      status: "Completed",
      date: "19 May 2026",
      image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=120&auto=format&fit=crop"
    },
    {
      id: 5,
      title: "Animal Shelter Care",
      creator: "Paws & Hearts",
      status: "Completed",
      date: "21 May 2026",
      image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=120&auto=format&fit=crop"
    }
  ];

  // Recommended campaigns mock data matching Figma
  const recommendedCampaigns = [
    {
      id: 1,
      title: "Empower Rural Education",
      creator: "Teach India",
      progress: 65,
      raised: "₹16,25,000",
      goal: "₹25,00,000",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Support Cancer Patients",
      creator: "Hope Foundation",
      progress: 45,
      raised: "₹4,50,000",
      goal: "₹10,00,000",
      image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Save Our Rivers",
      creator: "River Warriors",
      progress: 80,
      raised: "₹16,00,000",
      goal: "₹20,00,000",
      image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&auto=format&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-brand-border/60 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-brand-text p-2 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-brand-text flex items-center gap-2">
                Welcome back, {user.name.split(" ")[0]}! <span className="animate-wiggle">👋</span>
              </h2>
              <p className="text-xs sm:text-sm text-brand-secondary font-medium mt-0.5">Thank you for being a part of change.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {/* Notification Bell */}
            <button className="relative text-brand-text p-2.5 hover:bg-slate-50 rounded-full transition-all cursor-pointer border border-brand-border/60">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-brand-error rounded-full ring-2 ring-white" />
            </button>

            {/* Profile Avatar Card */}
            <div className="flex items-center gap-3 border-l border-brand-border/60 pl-4 sm:pl-6">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop" 
                alt={user.name} 
                className="w-10 h-10 shrink-0 rounded-full border border-brand-border/60 object-cover shadow-sm"
              />
              <div className="hidden sm:block leading-none">
                <h4 className="text-sm font-bold text-brand-text">{user.name}</h4>
                <p className="text-[11px] text-brand-secondary font-semibold uppercase mt-0.5 tracking-wider">Donor</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Grid Container */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-[1400px] w-full mx-auto space-y-6 sm:space-y-8 overflow-y-auto">
          
          {/* Stats Section Row */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            
            {/* Stat Card 1: Total Donated */}
            <div className="bg-card-white border border-brand-border/60 rounded-2xl p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4.5 shadow-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center shrink-0">
                <TrendingUp size={24} />
              </div>
              <div className="leading-tight">
                <p className="text-xs text-brand-secondary font-bold uppercase tracking-wider">Total Donated</p>
                <h3 className="text-xl sm:text-2xl font-black text-brand-text mt-1">₹25,000</h3>
                <p className="text-[11px] text-[#059669] font-semibold mt-1">Across 12 campaigns</p>
              </div>
            </div>

            {/* Stat Card 2: Campaigns Supported */}
            <div className="bg-card-white border border-brand-border/60 rounded-2xl p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4.5 shadow-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center shrink-0">
                <Users size={24} />
              </div>
              <div className="leading-tight">
                <p className="text-xs text-brand-secondary font-bold uppercase tracking-wider">Campaigns Supported</p>
                <h3 className="text-xl sm:text-2xl font-black text-brand-text mt-1">12</h3>
                <p className="text-[11px] text-brand-secondary font-semibold mt-1">You've supported</p>
              </div>
            </div>

            {/* Stat Card 3: Rewards Earned */}
            <div className="bg-card-white border border-brand-border/60 rounded-2xl p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4.5 shadow-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center shrink-0">
                <Award size={24} />
              </div>
              <div className="leading-tight">
                <p className="text-xs text-brand-secondary font-bold uppercase tracking-wider">Rewards Earned</p>
                <h3 className="text-xl sm:text-2xl font-black text-brand-text mt-1">5</h3>
                <p className="text-[11px] text-brand-secondary font-semibold mt-1">Badges unlocked</p>
              </div>
            </div>

            {/* Stat Card 4: Impact Score */}
            <div className="bg-card-white border border-brand-border/60 rounded-2xl p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4.5 shadow-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center shrink-0">
                <Leaf size={24} />
              </div>
              <div className="leading-tight">
                <p className="text-xs text-brand-secondary font-bold uppercase tracking-wider">Impact Score</p>
                <h3 className="text-xl sm:text-2xl font-black text-brand-text mt-1">850</h3>
                <p className="text-[11px] text-[#059669] font-semibold mt-1">Keep making impact!</p>
              </div>
            </div>

          </section>

          {/* Lower Two-Column Section */}
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 items-start">
            
            {/* Left Column: Recent Donations Card */}
            <div className="bg-card-white border border-brand-border/60 rounded-2xl p-4 sm:p-6 shadow-sm lg:col-span-3 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-brand-text">Recent Donations</h3>
                <a href="#all-donations" className="text-xs font-bold text-[#10B981] hover:text-[#059669] flex items-center gap-0.5 transition-colors">
                  <span>View All</span>
                  <ChevronRight size={14} />
                </a>
              </div>

              {/* Donation List items */}
              <div className="space-y-4 flex-1">
                {recentDonations.map((donation) => (
                  <div 
                    key={donation.id}
                    className="flex items-center justify-between p-2.5 sm:p-3 border border-brand-border/40 hover:border-brand-border rounded-xl transition-all hover:bg-slate-50/50"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img 
                        src={donation.image} 
                        alt={donation.title} 
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-brand-border/30 shadow-xs"
                      />
                      <div className="leading-tight min-w-0">
                        <h4 className="text-sm font-bold text-brand-text truncate">{donation.title}</h4>
                        <p className="text-[11px] text-brand-secondary font-semibold mt-0.5">By {donation.creator}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 text-right shrink-0">
                      <div className="hidden sm:block leading-none">
                        <span className="inline-block px-2.5 py-1 text-[10px] font-bold text-[#059669] bg-[#E1FDEC] border border-[#A7F3D0]/60 rounded-md">
                          {donation.status}
                        </span>
                        <p className="text-[10px] text-brand-secondary font-medium mt-1.5">{donation.date}</p>
                      </div>
                      
                      {/* Mobile fallback for badge */}
                      <span className="sm:hidden inline-block px-2 py-0.5 text-[9px] font-bold text-[#059669] bg-[#E1FDEC] rounded-md">
                        {donation.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Button */}
              <button className="w-full mt-6 py-3 bg-[#E1FDEC]/80 hover:bg-[#E1FDEC] text-[#059669] font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.99] cursor-pointer">
                View All Donations →
              </button>
            </div>

            {/* Right Column: Donation Overview & Recommendations */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              
              {/* Box 1: Donation Overview Donut Chart */}
              <div className="bg-card-white border border-brand-border/60 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-brand-text">Donation Overview</h3>
                  <select className="bg-slate-50 border border-brand-border/60 text-xs font-semibold px-3 py-1.5 rounded-lg outline-none focus:border-[#10B981]">
                    <option>This Month</option>
                    <option>Last 3 Months</option>
                    <option>Yearly</option>
                  </select>
                </div>

                {/* SVG Donut Chart container */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
                  <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      {/* Segment 1: Education (40%) -> strokeDasharray="40 60" */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#10B981"
                        strokeWidth="12"
                        strokeDasharray="95.5 238.7"
                        strokeDashoffset="0"
                      />
                      {/* Segment 2: Environment (32%) -> strokeDasharray="32 68" */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#A7F3D0"
                        strokeWidth="12"
                        strokeDasharray="76.4 238.7"
                        strokeDashoffset="-95.5"
                      />
                      {/* Segment 3: Health (20%) -> strokeDasharray="20 80" */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#3B82F6"
                        strokeWidth="12"
                        strokeDasharray="47.7 238.7"
                        strokeDashoffset="-171.9"
                      />
                      {/* Segment 4: Others (10%) -> strokeDasharray="10 90" */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#F59E0B"
                        strokeWidth="12"
                        strokeDasharray="23.9 238.7"
                        strokeDashoffset="-219.6"
                      />
                    </svg>
                    
                    {/* Centered label inside donut */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none select-none">
                      <span className="text-lg font-black text-brand-text">₹2,500</span>
                      <span className="text-[9px] font-bold text-brand-secondary uppercase mt-0.5">Donated</span>
                    </div>
                  </div>

                  {/* Legend list */}
                  <div className="flex-1 space-y-2.5 w-full">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                        <span className="text-brand-secondary">Education</span>
                      </div>
                      <span className="text-brand-text font-bold">₹1,000</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#A7F3D0]" />
                        <span className="text-brand-secondary">Environment</span>
                      </div>
                      <span className="text-brand-text font-bold">₹800</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#3B82F6]" />
                        <span className="text-brand-secondary">Health</span>
                      </div>
                      <span className="text-brand-text font-bold">₹500</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                        <span className="text-brand-secondary">Others</span>
                      </div>
                      <span className="text-brand-text font-bold">₹250</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Box 2: Recommended For You Card */}
              <div className="bg-card-white border border-brand-border/60 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-black text-brand-text">Recommended For You</h3>
                  <a href="#recommendations" className="text-xs font-bold text-[#10B981] hover:text-[#059669] flex items-center gap-0.5 transition-colors">
                    <span>View All</span>
                    <ChevronRight size={14} />
                  </a>
                </div>

                {/* Campaign Recommendation Cards */}
                <div className="space-y-4">
                  {recommendedCampaigns.map((camp) => (
                    <div 
                      key={camp.id}
                      className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 border border-brand-border/30 hover:border-brand-border rounded-xl transition-all"
                    >
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-lg overflow-hidden border border-brand-border/40">
                        <img 
                          src={camp.image} 
                          alt={camp.title} 
                          className="w-full h-full object-cover"
                        />
                        {/* Favorite badge/heart button */}
                        <button className="absolute top-1 right-1 w-5 h-5 bg-white/95 rounded-full flex items-center justify-center text-brand-secondary hover:text-brand-error hover:scale-105 transition-all shadow-xs cursor-pointer">
                          <Heart size={10} fill="none" />
                        </button>
                      </div>

                      <div className="flex-1 min-w-0 leading-tight">
                        <h4 className="text-xs font-black text-brand-text truncate">{camp.title}</h4>
                        <p className="text-[10px] text-brand-secondary font-semibold mt-0.5">By {camp.creator}</p>
                        
                        {/* Progress Bar & Goals */}
                        <div className="mt-2 space-y-1">
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-[#10B981] h-1.5 rounded-full transition-all" 
                              style={{ width: `${camp.progress}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[9px] font-bold text-brand-secondary">
                            <span>{camp.progress}% funded</span>
                            <span className="text-brand-text">{camp.raised} / {camp.goal}</span>
                          </div>
                        </div>
                      </div>

                      <button className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-[10px] rounded-lg shadow-xs hover:shadow-sm transition-all whitespace-nowrap cursor-pointer">
                        Donate
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>

        </main>
      </div>

    </div>
  );
};

export default DonorPanel;
