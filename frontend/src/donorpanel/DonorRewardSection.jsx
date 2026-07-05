import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, ArrowRight, Award, Flame, Sprout, Trees, Globe, Zap, Heart, Users, Bell, Star, RefreshCw, Receipt, CheckCircle, Printer } from "lucide-react";
import Sidebar from "./Sidebar";
import { getBadgeData, getDonationStats, getRecurringDetails, getDonationHistory } from "../../services/donorProfileService.js";

// Badge configuration matching the donor profile
const BADGE_CONFIG = {
    'First Milestone': {
        icon: <Sprout size={20} className="text-[#00966B]" />,
        criteria: 'First donation made',
        check: (data) => data.totalDonations >= 1
    },
    'Squad Supporter': {
        icon: <Users size={20} className="text-blue-500" />,
        criteria: '5+ donations made',
        check: (data) => data.donationCount >= 5
    },
    'First Keeper': {
        icon: <Star size={20} className="text-amber-500" />,
        criteria: '10+ donations made',
        check: (data) => data.donationCount >= 10
    },
    'Local Upper': {
        icon: <Globe size={20} className="text-green-500" />,
        criteria: '$500+ donated',
        check: (data) => data.totalDonations >= 500
    },
    'Awarded Fund': {
        icon: <Heart size={20} className="text-pink-500" />,
        criteria: '$1000+ donated',
        check: (data) => data.totalDonations >= 1000
    },
    'Control Peak': {
        icon: <Zap size={20} className="text-purple-500" />,
        criteria: '$2000+ donated',
        check: (data) => data.totalDonations >= 2000
    },
    'Stock Keeper': {
        icon: <Flame size={20} className="text-indigo-500" />,
        criteria: 'Recurring donor',
        check: (data) => data.isRecurring === true
    },
    'Ground Guardian': {
        icon: <Trees size={20} className="text-emerald-500" />,
        criteria: 'Recurring + 6+ months active',
        check: (data) => data.isRecurring === true && data.monthsActive >= 6
    },
    'Holdout Hero': {
        icon: <Award size={20} className="text-yellow-600" />,
        criteria: '12+ months active',
        check: (data) => data.monthsActive >= 12
    },
    'Anniversary Anchor': {
        icon: <Star size={20} className="text-yellow-500" />,
        criteria: '24+ months active',
        check: (data) => data.monthsActive >= 24
    },
    'Lifelong Pillar': {
        icon: <Globe size={20} className="text-blue-600" />,
        criteria: '36+ months active',
        check: (data) => data.monthsActive >= 36
    },
    'Canopy Cheerpien': {
        icon: <Trees size={20} className="text-green-600" />,
        criteria: '$250+ and 3+ donations',
        check: (data) => data.totalDonations >= 250 && data.donationCount >= 3
    }
};

// Milestone thresholds (points-based)
const MILESTONES = [
    { score: 100, label: '100' },
    { score: 500, label: '500' },
    { score: 1000, label: '1K' },
    { score: 1500, label: '1.5K' },
    { score: 2000, label: '2K' },
    { score: 2500, label: '2.5K' },
    { score: 3000, label: '3K' },
    { score: 5000, label: '5K' },
];

const DonorReward = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Rewards & Badges");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    
    // User state
    const [user, setUser] = useState(() => {
        try {
            const u = localStorage.getItem("user");
            return u ? JSON.parse(u) : { name: "Donor" };
        } catch {
            return { name: "Donor" };
        }
    });

    // Stats state
    const [stats, setStats] = useState({
        totalDonations: 0,
        donationCount: 0,
        monthsActive: 0,
        isRecurring: false,
        lifetimePoints: 0
    });

    // Badges state - ONLY UNLOCKED/COMPLETED
    const [completedBadges, setCompletedBadges] = useState([]);
    const [earnedCount, setEarnedCount] = useState(0);
    const [totalBadges, setTotalBadges] = useState(0);

    // Donations for receipt
    const [donations, setDonations] = useState([]);
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState(null);

    // Milestones
    const [milestones, setMilestones] = useState([]);

    // Rewards data (mock - replace with real API data)
    const rewardsData = [
        { id: "r1", title: "Empower Rural Power", category: "Eco-Warrior" },
        { id: "r2", title: "Support Cancer Patients", category: "Guardian Angel" },
        { id: "r3", title: "Clean Water For All", category: "Infrastructure" }
    ];

    // ==================== FETCH DATA ====================
    useEffect(() => {
        fetchRewardData();
    }, []);

    const fetchRewardData = async () => {
        try {
            setLoading(true);
            setFetchError(null);

            // Fetch all data in parallel
            const [badgeResponse, statsResponse, donationHistory] = await Promise.all([
                getBadgeData().catch(err => ({ success: false, error: err })),
                getDonationStats().catch(err => ({ success: false, error: err })),
                getDonationHistory(1, 100).catch(err => ({ success: false, error: err }))
            ]);

            // 1. Handle Stats
            let totalDonations = 0;
            let donationCount = 0;
            let monthsActive = 0;
            let isRecurring = false;

            if (statsResponse && statsResponse.success) {
                const data = statsResponse.data;
                totalDonations = data.totalDonations || data.lifetimeDonations || 0;
                donationCount = data.donationCount || 0;
                monthsActive = data.monthsActive || 0;
                isRecurring = data.isRecurring || false;
            }

            // 2. Handle Donations for Receipts
            if (donationHistory && donationHistory.success) {
                const data = donationHistory.data;
                setDonations(data.donations || []);
            }

            // 3. Handle Badges - ONLY UNLOCKED/COMPLETED
            let allBadges = [];
            let unlockedBadges = [];

            if (badgeResponse && badgeResponse.success) {
                const data = badgeResponse.data;
                totalDonations = data.totalDonations || totalDonations;
                donationCount = data.donationCount || donationCount;
                monthsActive = data.monthsActive || monthsActive;
                isRecurring = data.isRecurring || isRecurring;

                // Use badges from API if available
                if (data.badges && data.badges.length > 0) {
                    allBadges = data.badges.map(badge => ({
                        id: badge.id || badge.name,
                        name: badge.name,
                        criteria: badge.requirement || badge.criteria,
                        unlocked: badge.unlocked || false,
                        icon: BADGE_CONFIG[badge.name]?.icon || <Award size={20} className="text-gray-400" />,
                        level: badge.level || 'Bronze'
                    }));
                } else {
                    // Calculate badges from config
                    const statsData = { totalDonations, donationCount, monthsActive, isRecurring };
                    allBadges = Object.keys(BADGE_CONFIG).map((name, index) => {
                        const badge = BADGE_CONFIG[name];
                        const unlocked = badge.check(statsData);
                        return {
                            id: `badge-${index}`,
                            name: name,
                            criteria: badge.criteria,
                            unlocked: unlocked,
                            icon: badge.icon,
                            level: getBadgeLevel(name)
                        };
                    });
                }
            } else {
                // Fallback: Calculate badges from config
                const statsData = { totalDonations, donationCount, monthsActive, isRecurring };
                allBadges = Object.keys(BADGE_CONFIG).map((name, index) => {
                    const badge = BADGE_CONFIG[name];
                    const unlocked = badge.check(statsData);
                    return {
                        id: `badge-${index}`,
                        name: name,
                        criteria: badge.criteria,
                        unlocked: unlocked,
                        icon: badge.icon,
                        level: getBadgeLevel(name)
                    };
                });
            }

            // Filter ONLY unlocked/completed badges
            unlockedBadges = allBadges.filter(b => b.unlocked === true);

            // 4. Set state
            setStats({
                totalDonations,
                donationCount,
                monthsActive,
                isRecurring,
                lifetimePoints: Math.round(totalDonations / 10)
            });

            setCompletedBadges(unlockedBadges);
            setEarnedCount(unlockedBadges.length);
            setTotalBadges(allBadges.length);

            // 5. Calculate milestones
            const points = Math.round(totalDonations / 10);
            const milestoneData = MILESTONES.map(m => ({
                score: m.score,
                label: m.label,
                unlocked: points >= m.score
            }));
            setMilestones(milestoneData);

        } catch (error) {
            console.error("Error fetching reward data:", error);
            setFetchError(error?.message || "Failed to load rewards data");
        } finally {
            setLoading(false);
        }
    };

    // Helper: Get badge level
    const getBadgeLevel = (name) => {
        const levels = {
            'First Milestone': 'Bronze',
            'Squad Supporter': 'Bronze',
            'First Keeper': 'Silver',
            'Local Upper': 'Silver',
            'Awarded Fund': 'Gold',
            'Control Peak': 'Platinum',
            'Stock Keeper': 'Silver',
            'Ground Guardian': 'Gold',
            'Holdout Hero': 'Gold',
            'Anniversary Anchor': 'Platinum',
            'Lifelong Pillar': 'Diamond',
            'Canopy Cheerpien': 'Bronze'
        };
        return levels[name] || 'Bronze';
    };

    // Handle View Receipt
    const handleViewReceipt = (donation) => {
        const receipt = {
            receiptId: donation.id || donation.transactionId || `RCP-${Date.now()}`,
            date: donation.date ? new Date(donation.date).toLocaleDateString() : new Date().toLocaleDateString(),
            transactionId: donation.transactionId || `TXN-${Date.now()}`,
            title: donation.campaign || 'Donation',
            creator: donation.creator || 'Elpis',
            donorName: user?.name || 'You',
            donorEmail: user?.email || 'donor@example.com',
            isAnonymous: donation.isAnonymous || false,
            paymentMethod: donation.paymentMethod || 'Credit Card',
            rawAmount: donation.amount || 0,
            rawTip: donation.tip || 0,
            rawTotal: donation.total || donation.amount || 0
        };
        setReceiptData(receipt);
        setShowReceipt(true);
    };

    const handleCloseReceipt = () => {
        setShowReceipt(false);
        setReceiptData(null);
    };

    const handlePrintReceipt = () => {
        window.print();
    };

    // Calculate next milestone
    const nextMilestone = milestones.find(m => !m.unlocked);
    const pointsRemaining = nextMilestone ? nextMilestone.score - stats.lifetimePoints : 0;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a86b] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading rewards...</p>
                </div>
            </div>
        );
    }

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
                        <button onClick={() => navigate('/donor-Notifications')} className="w-10 h-10 rounded-full border border-gray-100 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 relative transition-colors shadow-xs cursor-pointer">
                            <Bell size={18} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                        {/* Profile Details */}
                        <div className="flex items-center gap-2.5 pl-1">
                            <div className="w-10 h-10 shrink-0 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-lg shadow-xs border border-gray-100">
                                {user?.name ? user.name.charAt(0).toUpperCase() : "D"}
                            </div>
                            <div className="hidden sm:block leading-none">
                                <span className="block font-bold text-xs text-gray-900">{user.name}</span>
                                <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Donor</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Scroll Content Area */}
                <main className="p-4 md:p-8 pt-6 w-full max-w-(screen-2xl) mx-auto">
                    {fetchError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {fetchError}
                            <button onClick={fetchRewardData} className="ml-2 text-red-700 underline">Retry</button>
                        </div>
                    )}

                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">

                        <div className="flex justify-between items-end mb-4">
                            <h2 className="text-[22px] font-bold text-gray-900">Your Rewards</h2>
                            <span className="text-sm font-bold text-gray-900">Points: <span className="text-[#00966B]">{stats.lifetimePoints}</span></span>
                        </div>

                        {/* Milestone Track Box Frame */}
                        <div className="border border-gray-200 rounded-xl p-5 bg-white mb-6 shadow-xs">
                            <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-5">
                                {pointsRemaining > 0 
                                    ? `${pointsRemaining} points remaining to unlock your next milestone`
                                    : '🎉 All milestones unlocked!'}
                            </p>
                            <div className="overflow-x-auto pb-2">
                                <div className="grid grid-cols-8 gap-x-4 min-w-[580px] justify-items-center">
                                    {milestones.map((item, index) => (
                                        <div key={index} className="flex flex-col items-center gap-2">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${item.unlocked ? "bg-emerald-50 border-[#00966B] text-[#00966B] shadow-xs" : "bg-gray-50 border-gray-200 text-gray-300"}`}>
                                                <span className="text-xs"><Star size={15} /></span>
                                            </div>
                                            <span className="text-xs font-medium text-gray-500">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action Button Segment */}
                        <div className="flex justify-end mb-8">
                            <button 
                                onClick={() => navigate('/donor/donate')}
                                className="bg-[#00966B] hover:bg-[#007F5A] text-white font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 text-[15px] transition-all shadow-sm hover:shadow-md cursor-pointer"
                            >
                                Donate <ArrowRight size={13} />
                            </button>
                        </div>

                        {/* Lower Split Grid Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            {/* Left Card Deck Column - My Rewards with View Receipt */}
                            <div className="lg:col-span-5 border border-gray-100 rounded-xl p-5 shadow-sm bg-white">
                                <h3 className="text-[16px] font-bold text-gray-900 mb-4 flex items-center gap-1">My Rewards <ArrowRight size={14} /></h3>
                                <div className="space-y-2.5">
                                    {donations && donations.length > 0 ? (
                                        donations.slice(0, 5).map((donation) => (
                                            <div key={donation.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50/50 transition-colors shadow-xs">
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[14px] font-medium text-gray-700 truncate block">
                                                        {donation.campaign || 'Donation'}
                                                    </span>
                                                    <span className="text-[11px] text-gray-400">
                                                        ${donation.amount} • {donation.status || 'Completed'}
                                                    </span>
                                                </div>
                                                <button 
                                                    onClick={() => handleViewReceipt(donation)}
                                                    className="shrink-0 text-[#00966B] font-bold text-[12px] flex items-center gap-0.5 hover:underline"
                                                >
                                                    View Receipt <Receipt size={12} />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-400">
                                            <Receipt size={32} className="mx-auto mb-2 opacity-50" />
                                            <p className="text-sm font-medium">No completed donations yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Grid Column Badge Vault - ONLY COMPLETED/UNLOCKED BADGES */}
                            <div className="lg:col-span-7 space-y-4">
                                <div className="flex items-baseline justify-between">
                                    <h3 className="text-[16px] font-bold text-gray-900 flex items-center gap-1">Completed Badges <ArrowRight size={14} /></h3>
                                    <span className="text-xs text-gray-400 font-medium">Unlocked: <span className="text-gray-900 font-bold">{earnedCount}</span>/{totalBadges}</span>
                                </div>

                                {completedBadges.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {completedBadges.map((badge) => (
                                            <div key={badge.id} className="border border-gray-200 rounded-xl p-3.5 flex items-start gap-3 bg-white transition-all shadow-sm hover:shadow-md">
                                                <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 shadow-xs">
                                                    {badge.icon}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <h4 className="text-[14px] font-bold text-gray-900 truncate">{badge.name}</h4>
                                                        <span className="text-[9px] font-bold lowercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-[#00966B]">
                                                            ✅ Earned
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-400 mt-1 leading-normal">{badge.criteria}</p>
                                                    {badge.level && (
                                                        <span className="text-[8px] font-bold uppercase text-gray-400 mt-1 block">
                                                            {badge.level}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 border border-gray-200 rounded-xl bg-gray-50">
                                        <Award size={32} className="mx-auto mb-2 text-gray-300" />
                                        <p className="text-sm font-medium text-gray-400">No badges completed yet</p>
                                        <p className="text-xs text-gray-400 mt-1">Start donating to earn badges!</p>
                                    </div>
                                )}

                                {/* Refresh Button */}
                                <div className="flex justify-end mt-4">
                                    <button 
                                        onClick={fetchRewardData}
                                        className="text-sm text-[#00a86b] hover:text-[#00965e] font-medium flex items-center gap-1"
                                    >
                                        <RefreshCw size={14} />
                                        Refresh
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>

            {/* Receipt Modal */}
            {showReceipt && receiptData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Receipt size={20} className="text-[#10B981]" />
                                <h3 className="text-lg font-black text-gray-900">Donation Receipt</h3>
                            </div>
                            <button onClick={handleCloseReceipt} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <CheckCircle size={32} className="text-[#10B981]" />
                                </div>
                            </div>

                            <p className="text-center text-sm font-semibold text-[#10B981] mb-6">Payment Successful! 🎉</p>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                                    <span className="text-gray-500">Receipt ID</span>
                                    <span className="font-bold text-gray-900">{receiptData.receiptId}</span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                                    <span className="text-gray-500">Date</span>
                                    <span className="font-bold text-gray-900">{receiptData.date}</span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                                    <span className="text-gray-500">Transaction ID</span>
                                    <span className="font-bold text-gray-900 text-xs">{receiptData.transactionId}</span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                                    <span className="text-gray-500">Campaign</span>
                                    <span className="font-bold text-gray-900 text-right max-w-[60%]">{receiptData.title}</span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                                    <span className="text-gray-500">Creator</span>
                                    <span className="font-bold text-gray-900">{receiptData.creator}</span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                                    <span className="text-gray-500">Donor</span>
                                    <span className="font-bold text-gray-900">
                                        {receiptData.isAnonymous ? 'Anonymous Donor' : receiptData.donorName}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                                    <span className="text-gray-500">Email</span>
                                    <span className="font-bold text-gray-900 text-xs">{receiptData.donorEmail}</span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                                    <span className="text-gray-500">Payment Method</span>
                                    <span className="font-bold text-gray-900">{receiptData.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                                    <span className="text-gray-500">Anonymous</span>
                                    <span className="font-bold text-gray-900">{receiptData.isAnonymous ? 'Yes' : 'No'}</span>
                                </div>

                                <div className="bg-emerald-50/50 rounded-xl p-4 mt-2 border border-emerald-100">
                                    <p className="text-xs font-bold text-gray-900 mb-2">Amount Breakdown</p>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Donation Amount</span>
                                            <span className="font-bold text-gray-900">₹{(receiptData.rawAmount || 0).toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Elpis Tip</span>
                                            <span className="font-bold text-gray-900">₹{(receiptData.rawTip || 0).toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between text-sm pt-1.5 border-t border-emerald-200">
                                            <span className="font-bold text-gray-900">Total</span>
                                            <span className="font-bold text-[#10B981] text-lg">₹{(receiptData.rawTotal || 0).toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-2">
                                <button
                                    onClick={handlePrintReceipt}
                                    className="flex-1 py-2.5 border border-gray-200 hover:border-gray-300 text-gray-900 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Printer size={16} />
                                    Print / Save as PDF
                                </button>
                            </div>

                            <button
                                onClick={handleCloseReceipt}
                                className="w-full mt-2 py-2.5 bg-[#10B981] hover:bg-emerald-700 text-white font-black text-sm rounded-xl transition-all cursor-pointer"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DonorReward;