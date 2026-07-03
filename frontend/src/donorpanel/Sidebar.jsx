import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  HeartHandshake,
  Bookmark,
  Award,
  Users,
  Bell,
  Settings,
  ArrowRight
} from "lucide-react";

const Sidebar = ({ activeTab = "Dashboard", setActiveTab, isOpen, setIsOpen }) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "Explore Campaigns", label: "Explore Campaigns", icon: Search },
    { id: "My Donations", label: "My Donations", icon: HeartHandshake },
    { id: "Saved Campaigns", label: "Saved Campaigns", icon: Bookmark },
    { id: "Rewards & Badges", label: "Rewards & Badges", icon: Award },
    { id: "Following Creators", label: "Following Creators", icon: Users },
    { id: "Notifications", label: "Notifications", icon: Bell },
    { id: "Profile Settings", label: "Profile Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 lg:z-30 w-72 h-screen bg-card-white border-r border-brand-border/60 flex flex-col justify-between select-none transition-transform duration-300 lg:transform-none ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}>

        {/* Solid Green Brand Panel */}
        <div className="bg-[#10B981] p-6 text-white flex flex-col justify-center min-h-[140px] shadow-sm relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-wide leading-tight">Elpis.</h1>
              <p className="text-xs uppercase tracking-widest text-[#D1FAE5] font-semibold mt-1">Donor Panel</p>
            </div>
            {/* Close button on mobile */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 py-6 overflow-y-auto px-4 space-y-1 scrollbar-thin">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "Profile Settings") {
                    navigate("/donorprofile");
                  }
                  else if (item.id === "Rewards & Badges") {
                    navigate("/donorreward");
                  }
                  else if (item.id === "Notifications") {
                    navigate("/donor-Notifications");
                  }
                  else {
                    navigate(`/donordashboard?tab=${encodeURIComponent(item.id)}`);
                    if (setActiveTab) setActiveTab(item.id);
                  }
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all cursor-pointer ${isActive
                    ? "bg-[#D1FAE5]/60 text-[#059669] shadow-sm shadow-[#10B981]/5"
                    : "text-brand-secondary hover:text-brand-text hover:bg-slate-50"
                  }`}
              >
                <Icon size={18} className={isActive ? "text-[#059669]" : "text-brand-secondary"} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Reusable Bottom Sidebar Image Banner using downsidebar.jpg */}
        <div className="p-4 border-t border-brand-border/60">
          <div
            className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-cover bg-center flex flex-col justify-end p-5 text-white shadow-md group"
            style={{ backgroundImage: `url('/downsidebar.jpg')` }}
          >
            {/* Dark tint overlay for absolute readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-0 transition-opacity duration-300 group-hover:opacity-90" />

            <div className="relative z-10 space-y-3">
              <div className="space-y-0.5 leading-tight font-black tracking-wide text-sm md:text-base">
                <p className="text-white/90">Together,</p>
                <p className="text-[#10B981]">We Can Create</p>
                <p className="text-white/90">A Better Tomorrow.</p>
              </div>

              <button className="w-full py-2 px-3 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#10B981]/25 hover:scale-[1.02] cursor-pointer">
                <span>Explore Campaigns</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
