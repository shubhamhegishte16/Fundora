import React, { useState } from "react";
import { Menu, X, ArrowRight, Award, Flame, Sprout, Trees, Globe, Zap, Heart, Users, Bell } from "lucide-react";
import Sidebar from "./Sidebar";

const DonorReward = () => {
    const [activeTab, setActiveTab] = useState("Rewards & Badges");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const lifetimePoints = 2450;

    const milestones = [
        { score: 100, unlocked: lifetimePoints >= 100 },
        { score: 500, unlocked: lifetimePoints >= 500 },
        { score: 1000, unlocked: lifetimePoints >= 1000 },
        { score: 1500, unlocked: lifetimePoints >= 1500 },
        { score: 2000, unlocked: lifetimePoints >= 2000 },
        { score: 2500, unlocked: lifetimePoints >= 2500 },
        { score: 3000, unlocked: lifetimePoints >= 3000 },
        { score: 5000, unlocked: lifetimePoints >= 5000 },
    ];

    const badgeVault = [
        { id: "b1", name: "Sprout Supporter", criteria: "Funded your first community micro-grant", unlocked: true, icon: <Sprout size={20} className="text-[#00966B]" /> },
        { id: "b2", name: "Canopy Champion", criteria: "Contributed to 5 eco-afforestation campaigns", unlocked: true, icon: <Trees size={20} className="text-amber-500" /> },
        { id: "b3", name: "Luminary", criteria: "Maintained active recurring status for 6 months cumulative", unlocked: true, icon: <Flame size={20} className="text-indigo-500" /> },
        { id: "b4", name: "Visionary Catalyst", criteria: "Initiated a $1k peer matching funding pool across the platform", unlocked: true, icon: <Users size={20} className="text-pink-500" /> },
        { id: "b5", name: "Ecosystem Pillar", criteria: "Exceeded $10,000 in direct peer-validated project funding", unlocked: false, icon: <Globe size={20} className="text-blue-400" /> },
        { id: "b6", name: "Crisis Dispatch", criteria: "Responded to an urgent flash emergency relief drop within 4 hours", unlocked: false, icon: <Zap size={20} className="text-purple-400" /> },
    ];

    const earnedCount = badgeVault.filter(b => b.unlocked).length;

    const rewardsData = [
        { id: "r1", title: "Empower Rural Power", category: "Eco-Warrior" },
        { id: "r2", title: "Support Cancer Patients", category: "Guardian Angel" },
        { id: "r3", title: "Clean Water For All", category: "Infrastructure" }
    ];

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row font-sans antialiased">

            {/* Mobile Nav Trigger Header */}
            <div className="lg:hidden w-full bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-xs">
                <span className="font-bold text-gray-900 text-lg">Elpis Panel</span>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-gray-50 border border-gray-100 rounded-xl">
                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Platform Sidebar */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            {isSidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-xs z-40" onClick={() => setIsSidebarOpen(false)} />}

            {/* Right Work Environment Layer */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* GLOBAL STICKY DASHBOARD HEADER FRAME WITH SHADOW */}
                <header className="sticky top-0 z-30 bg-[#F8F9FA]/90 backdrop-blur-md border-b border-gray-100/80 px-4 md:px-8 py-5 flex items-center justify-between gap-4 shadow-xs">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                            Your Impact at Elpis
                        </h1>
                        <p className="text-xs md:text-sm text-gray-500 mt-0.5">Track Donate Patterns, Donor behaviour & how it contributes to results</p>
                    </div>

                    {/* User Actions Account Node Block */}
                    <div className="flex items-center gap-4 shrink-0">
                        <button className="w-10 h-10 rounded-full border border-gray-100 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 relative transition-colors shadow-xs">
                            <Bell size={18} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                        <div className="flex items-center gap-2.5 pl-1">
                            <img
                                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                                alt="User Avatar"
                                className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-xs"
                            />
                            <div className="hidden sm:block leading-none">
                                <span className="block font-bold text-xs text-gray-900">Arjun Sharma</span>
                                <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Donor</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Scroll Content Area */}
                <main className="p-4 md:p-8 pt-6 w-full max-w-(screen-2xl) mx-auto">
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">

                        <div className="flex justify-between items-end mb-4">
                            <h2 className="text-base font-bold text-gray-900">Your Rewards</h2>
                            <span className="text-sm font-bold text-gray-900">Points: <span className="text-[#00966B]">{lifetimePoints}</span></span>
                        </div>

                        {/* Milestone Track Box Frame */}
                        <div className="border border-gray-200 rounded-xl p-5 bg-white mb-6 shadow-xs">
                            <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-5">50 points remaining to unlock your next milestone</p>
                            <div className="overflow-x-auto pb-2">
                                <div className="grid grid-cols-8 gap-x-4 min-w-[580px] justify-items-center">
                                    {milestones.map((item, index) => (
                                        <div key={index} className="flex flex-col items-center gap-2">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${item.unlocked ? "bg-emerald-50 border-[#00966B] text-[#00966B] shadow-xs" : "bg-gray-50 border-gray-200 text-gray-300"}`}>
                                                <span className="text-xs">★</span>
                                            </div>
                                            <span className="text-xs font-medium text-gray-500">{item.score}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action Button Segment */}
                        <div className="flex justify-end mb-8">
                            <button className="bg-[#00966B] hover:bg-[#007F5A] text-white font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 text-xs transition-all shadow-sm hover:shadow-md">
                                Donate <ArrowRight size={13} />
                            </button>
                        </div>

                        {/* Lower Split Grid Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            {/* Left Card Deck Column */}
                            <div className="lg:col-span-5 border border-gray-100 rounded-xl p-5 shadow-sm bg-white">
                                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-1">My Rewards <ArrowRight size={14} /></h3>
                                <div className="space-y-2.5">
                                    {rewardsData.map((reward) => (
                                        <div key={reward.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50/50 transition-colors shadow-xs">
                                            <span className="text-xs font-medium text-gray-700 truncate mr-2">{reward.title}</span>
                                            <button className="shrink-0 text-[#00966B] font-bold text-[11px] flex items-center gap-0.5 hover:underline">
                                                View Reward <ArrowRight size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Grid Column Badge Vault */}
                            <div className="lg:col-span-7 space-y-4">
                                <div className="flex items-baseline justify-between">
                                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1">Lifetime Badges Vault <ArrowRight size={14} /></h3>
                                    <span className="text-xs text-gray-400 font-medium">Unlocked: <span className="text-gray-900 font-bold">{earnedCount}</span>/{badgeVault.length}</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {badgeVault.map((badge) => (
                                        <div key={badge.id} className={`border rounded-xl p-3.5 flex items-start gap-3 bg-white transition-all shadow-sm ${badge.unlocked ? "border-gray-200" : "border-gray-100 opacity-50 select-none"}`}>
                                            <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 shadow-xs">
                                                {badge.icon}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <h4 className="text-xs font-bold text-gray-900 truncate">{badge.name}</h4>
                                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${badge.unlocked ? "bg-emerald-50 text-[#00966B]" : "bg-gray-100 text-gray-400"}`}>
                                                        {badge.unlocked ? "Earned" : "Locked"}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-gray-400 mt-1 leading-normal">{badge.criteria}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default DonorReward;