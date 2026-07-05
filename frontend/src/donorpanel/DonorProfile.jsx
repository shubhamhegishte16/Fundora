import React, { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Search,
    HeartHandshake,
    Bookmark,
    Award,
    Users,
    Bell,
    Settings,
    ArrowRight,
    Dot,
    Check,
    SquarePen,
    RefreshCw,
    CircleUser,
    Menu,
    X,
    Key,
    Eye,
    EyeOff,
    Trophy,
    UserStar,
    CalendarSync,
    IdCardLanyard,
    Cake,
    Globe,
    Landmark,
    Podium,
    Heart,
    Sprout,
    TreeDeciduous,
    Gem,
    Cross,
    LogOut
} from "lucide-react";
import Sidebar from "./Sidebar";
import {
    getProfile,
    updateProfile,
    changePassword,
    getBadgeData,
    getDonationStats,
    getRecurringDetails
} from "../../services/donorProfileService.js";
import myDonations from "./MyDonations.jsx";
import notifications from "./donorNotifications.jsx";
import rewards from "./DonorRewardSection.jsx";
import { useNavigate } from "react-router-dom";

// --- Badge Configuration ---
const BADGE_CONFIG = {
    'First Milestone': {
        icon: <Trophy />,
        requirement: 'First donation made',
        check: (data) => data.totalDonations >= 1
    },
    'Squad Supporter': {
        icon: <UserStar />,
        requirement: '5+ donations',
        check: (data) => data.donationCount >= 5
    },
    'Stock Keeper': {
        icon: <CalendarSync />,
        requirement: 'Recurring donor',
        check: (data) => data.isRecurring === true
    },
    'Holdout Hero': {
        icon: <IdCardLanyard />,
        requirement: '12+ months active',
        check: (data) => data.monthsActive >= 12
    },
    'Anniversary Anchor': {
        icon: <Cake />,
        requirement: '24+ months active',
        check: (data) => data.monthsActive >= 24
    },
    'Local Upper': {
        icon: <Globe />,
        requirement: '$500+ donated',
        check: (data) => data.totalDonations >= 500
    },
    'Lifelong Pillar': {
        icon: <Landmark />,
        requirement: '36+ months active',
        check: (data) => data.monthsActive >= 36
    },
    'First Keeper': {
        icon: <Podium />,
        requirement: '10+ donations',
        check: (data) => data.donationCount >= 10
    },
    'Awarded Fund': {
        icon: <Heart />,
        requirement: '$1000+ donated',
        check: (data) => data.totalDonations >= 1000
    },
    'Ground Guardian': {
        icon: <Sprout />,
        requirement: 'Recurring + 6+ months',
        check: (data) => data.isRecurring === true && data.monthsActive >= 6
    },
    'Canopy Cheerpien': {
        icon: <TreeDeciduous />,
        requirement: '$250+ and 3+ donations',
        check: (data) => data.totalDonations >= 250 && data.donationCount >= 3
    },
    'Control Peak': {
        icon: <Gem />,
        requirement: '$2000+ donated',
        check: (data) => data.totalDonations >= 2000
    }
};

// --- Main Donor Profile Page ---
const DonorProfile = () => {
    const [activeTab, setActiveTab] = useState("Profile Settings");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProfileComplete, setIsProfileComplete] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [fetchError, setFetchError] = useState(null);

    // State for editable data
    const [donorDetails, setDonorDetails] = useState([]);
    const [personalDetails, setPersonalDetails] = useState([]);

    // Recurring details - FROM REAL DB
    const [recurringDetails, setRecurringDetails] = useState([
        { label: "Amount", value: "$0" },
        { label: "Frequency", value: "Monthly" },
        { label: "Created", value: "N/A" }
    ]);
    const [recurringDetails2, setRecurringDetails2] = useState([
        { label: "Giving Fund", value: "$0" },
        { label: "Total", value: "$0" },
        { label: "Method", value: "Not set" }
    ]);

    // Donation stats - FROM REAL DB
    const [donationStats, setDonationStats] = useState({
        lifetimeDonations: 0,
        avgDonationSize: 0,
        recentDonations: []
    });

    const [editingDonor, setEditingDonor] = useState(false);

    // Password change state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Badges state
    const [badges, setBadges] = useState([]);
    const [badgeStats, setBadgeStats] = useState({
        totalDonations: 0,
        donationCount: 0,
        monthsActive: 0,
        isRecurring: false
    });
    const [badgesLoading, setBadgesLoading] = useState(true);

    const navigate = useNavigate();

    // ==================== FETCH ALL DATA ====================
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            setFetchError(null);

            // Fetch all data in parallel
            const [profileResponse, statsResponse, recurringResponse, badgeStatsResponse] = await Promise.all([
                getProfile().catch(err => ({ success: false, error: err })),
                getDonationStats().catch(err => ({ success: false, error: err })),
                getRecurringDetails().catch(err => ({ success: false, error: err })),
                getBadgeData().catch(err => ({ success: false, error: err }))
            ]);

            // 1. Handle Profile
            if (profileResponse && profileResponse.success) {
                setUser(profileResponse.user);
                setProfile(profileResponse.profile);
            }

            // 2. Handle Donation Stats
            if (statsResponse && statsResponse.success) {
                const stats = statsResponse.data;
                setDonationStats({
                    lifetimeDonations: stats.lifetimeDonations || stats.totalDonations || 0,
                    avgDonationSize: stats.averageDonationSize || stats.avgDonation || 0,
                    recentDonations: stats.recentDonations || []
                });
            }

            // 3. Handle Recurring Details
            if (recurringResponse && recurringResponse.success) {
                const recurring = recurringResponse.data;
                setRecurringDetails([
                    { label: "Amount", value: recurring.hasRecurring ? `$${recurring.amount}` : "$0" },
                    { label: "Frequency", value: recurring.frequency || "Monthly" },
                    { label: "Created", value: recurring.created || "N/A" }
                ]);
                setRecurringDetails2([
                    { label: "Giving Fund", value: recurring.hasRecurring ? `$${recurring.givingFund}` : "$0" },
                    { label: "Total", value: recurring.hasRecurring ? `$${recurring.total}` : "$0" },
                    { label: "Method", value: recurring.method || "Not set" }
                ]);
            }

            // 4. Handle Badge Stats - Calculate badges from stats
            if (badgeStatsResponse && badgeStatsResponse.success) {
                const stats = badgeStatsResponse.data;

                // Update badge stats
                setBadgeStats({
                    totalDonations: stats.totalDonations || 0,
                    donationCount: stats.donationCount || 0,
                    monthsActive: stats.monthsActive || 0,
                    isRecurring: stats.isRecurring || false
                });

                // Calculate badges from BADGE_CONFIG using the stats
                const calculatedBadges = Object.keys(BADGE_CONFIG).map(name => {
                    const badge = BADGE_CONFIG[name];
                    const isUnlocked = badge.check({
                        totalDonations: stats.totalDonations || 0,
                        donationCount: stats.donationCount || 0,
                        monthsActive: stats.monthsActive || 0,
                        isRecurring: stats.isRecurring || false
                    });

                    return {
                        name: name,
                        icon: badge.icon,
                        requirement: badge.requirement,
                        unlocked: isUnlocked,
                        level: isUnlocked ? getBadgeLevel(name) : 'Locked'
                    };
                });

                setBadges(calculatedBadges);
                setBadgesLoading(false);
            } else {
                // Fallback: Use BADGE_CONFIG with all locked
                const defaultBadges = Object.keys(BADGE_CONFIG).map(name => ({
                    name,
                    icon: BADGE_CONFIG[name].icon,
                    requirement: BADGE_CONFIG[name].requirement,
                    unlocked: false,
                    level: 'Locked'
                }));
                setBadges(defaultBadges);
                setBadgesLoading(false);
            }

        } catch (error) {
            console.error("Error fetching data:", error);
            setFetchError(error?.message || "Failed to load data. Please refresh the page.");
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get badge level based on name
    const getBadgeLevel = (badgeName) => {
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
        return levels[badgeName] || 'Bronze';
    };

    // Update donor details when profile data changes
    useEffect(() => {
        if (user) {
            const hasProfileData = profile && (
                profile.address ||
                profile.city ||
                profile.state ||
                profile.country ||
                profile.dob ||
                profile.gender
            );
            setIsProfileComplete(hasProfileData);

            setDonorDetails([
                {
                    label: "First Name",
                    value: user?.name?.split(' ')[0] || "",
                    isFromAuth: true,
                },
                {
                    label: "Last Name",
                    value: user?.name?.split(' ').slice(1).join(' ') || "",
                    isFromAuth: true,
                },
                {
                    label: "Address",
                    value: profile?.address || "",
                    isFromAuth: false,
                    isRequired: true,
                },
                {
                    label: "City",
                    value: profile?.city || "",
                    isFromAuth: false,
                    isRequired: true,
                },
                {
                    label: "State",
                    value: profile?.state || "",
                    isFromAuth: false,
                    isRequired: true,
                },
                {
                    label: "Country",
                    value: profile?.country || "",
                    isFromAuth: false,
                    isRequired: true,
                },
            ]);

            setPersonalDetails([
                {
                    label: "Mobile",
                    value: user?.mobile || profile?.mobile || "",
                    isFromAuth: true,
                },
                {
                    label: "Phone",
                    value: profile?.phone || "",
                    isFromAuth: false,
                },
                {
                    label: "DOB",
                    value: profile?.dob ? new Date(profile.dob).toLocaleDateString() : "",
                    isFromAuth: false,
                    isRequired: true,
                },
                {
                    label: "Gender",
                    value: profile?.gender || "",
                    isFromAuth: false,
                    isRequired: true,
                },
                {
                    label: "Created",
                    value: user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "",
                    isFromAuth: true,
                },
                {
                    label: "Account",
                    value: user?.role || "",
                    isFromAuth: true,
                },
            ]);
        }
    }, [profile, user]);

    // ==================== HANDLERS ====================
    const handleDonorChange = (index, value, isPersonal = false) => {
        if (isPersonal) {
            const updated = [...personalDetails];
            updated[index].value = value;
            setPersonalDetails(updated);
        } else {
            const updated = [...donorDetails];
            updated[index].value = value;
            setDonorDetails(updated);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userData');

        // Clear any other stored data
        sessionStorage.clear();

        navigate('/login');
    };

    const saveProfileUpdates = async () => {
        try {
            setSaveError(null);

            const profileData = {
                firstName: donorDetails[0]?.value || "",
                lastName: donorDetails[1]?.value || "",
                address: donorDetails[2]?.value || "",
                city: donorDetails[3]?.value || "",
                state: donorDetails[4]?.value || "",
                country: donorDetails[5]?.value || "",
                phone: personalDetails[1]?.value || "",
                dob: personalDetails[2]?.value || "",
                gender: personalDetails[3]?.value || "",
            };

            const response = await updateProfile(profileData);

            if (response && response.success) {
                await fetchAllData();
                setEditingDonor(false);
                alert("Profile updated successfully!");
            } else {
                throw new Error(response?.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            const errorMessage = error?.response?.data?.message || error.message || "Failed to update profile. Please try again.";
            setSaveError(errorMessage);
            alert(errorMessage);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordError('Please fill in all fields');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters long');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        setIsChangingPassword(true);

        try {
            const response = await changePassword(passwordData);
            if (response && response.success) {
                setPasswordSuccess('Password changed successfully!');
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setTimeout(() => {
                    setShowPasswordModal(false);
                    setPasswordSuccess('');
                }, 2000);
            } else {
                throw new Error(response?.message || 'Failed to change password');
            }
        } catch (error) {
            console.error("Error changing password:", error);
            const errorMessage = error?.response?.data?.message || error.message || "Failed to change password. Please try again.";
            setPasswordError(errorMessage);
        } finally {
            setIsChangingPassword(false);
        }
    };

    const buttons = [
        {
            label: "My Donation",
            path: "/donordashboard?tab=My%20Donations"
        },
        {
            label: "Notifications",
            path: "/donor-Notifications"
        },
        {
            label: "My Rewards",
            path: "/donorreward"
        }
    ];

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a86b] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row font-sans antialiased">

            {/* Mobile Header */}
            <div className="lg:hidden w-full bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-xs">
                <span className="font-bold text-gray-900 text-lg">Elpis Panel</span>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-gray-50 border border-gray-100 rounded-xl">
                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Sidebar */}
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-xs z-40"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="hidden lg:flex sticky top-0 z-30 bg-[#F8F9FA] border-b border-gray-100/80 px-4 md:px-8 py-5 items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-1 sm:gap-2 flex-wrap">
                                <span className="truncate">{user?.name || 'Donor'}</span>
                                <Dot size={20} className="text-gray-400 flex-shrink-0" />
                                <span className="text-gray-500 font-medium text-lg md:text-xl flex-shrink-0">{user?.role || 'Donor'}</span>
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`flex h-5 w-5 items-center justify-center rounded-full flex-shrink-0 ${isProfileComplete ? 'bg-[#6DD89B]' : 'bg-yellow-400'}`}>
                            <Check size={12} className="text-white" />
                        </div>
                        <span className="text-sm text-gray-600">
                            {isProfileComplete ? 'Profile Verified' : 'Profile Incomplete'}
                        </span>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Errors */}
                    {fetchError && (
                        <div className="px-4 md:px-8 pt-4">
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                                <div className="text-red-600 text-lg"><Cross size={10} /></div>
                                <div className="flex-1">
                                    <p className="text-sm text-red-800 font-medium">Error Loading Profile</p>
                                    <p className="text-xs text-red-700 mt-1">{fetchError}</p>
                                    <button
                                        onClick={fetchAllData}
                                        className="mt-2 text-xs text-red-600 font-medium hover:text-red-700 underline"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {saveError && (
                        <div className="px-4 md:px-8 pt-4">
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                                <div className="text-red-600 text-lg"><Cross size={10} /></div>
                                <div className="flex-1">
                                    <p className="text-sm text-red-800 font-medium">Error Saving Profile</p>
                                    <p className="text-xs text-red-700 mt-1">{saveError}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* User Stats  */}
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 px-4 md:px-8 py-6">
                        <div className="flex justify-center gap-3">
                            <div className="flex items-center justify-center flex-shrink-0">
                                <CircleUser className="w-10 h-10 md:w-12 md:h-12" />
                            </div>
                            <div className="grid min-w-0">
                                <span className="font-semibold text-sm md:text-base truncate">{user?.name || 'Donor'}</span>
                                <span className="text-gray-500 text-[12px] truncate">{user?.email || 'No email'}</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-start gap-6 lg:gap-10 xl:gap-16">
                            <div className="grid text-center sm:text-left">
                                <span className="font-extrabold text-lg md:text-xl">${donationStats.lifetimeDonations?.toLocaleString() || 0}</span>
                                <span className="font-medium text-[15px] text-gray-600">Lifetime Donations</span>
                            </div>
                            <div className="grid text-center sm:text-left">
                                <span className="font-extrabold text-lg md:text-xl">${donationStats.avgDonationSize?.toLocaleString() || 0}</span>
                                <span className="font-medium text-[15px] text-gray-600">Avg Donations Size</span>
                            </div>
                        </div>
                    </div>

                    {/* Profile Incomplete Warning */}
                    {!isProfileComplete && user && (
                        <div className="px-4 md:px-8 pb-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                                <div className="text-yellow-600 text-lg">Caution</div>
                                <div className="flex-1">
                                    <p className="text-sm text-yellow-800 font-medium">Profile Incomplete</p>
                                    <p className="text-xs text-yellow-700 mt-1">
                                        Please fill in your address, city, state, country, DOB, and gender to complete your profile.
                                        Click the edit button next to "Donor Details" to update your information.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col xl:flex-row gap-6 px-4 md:px-6 pb-6">
                        <div className="flex-1 min-w-0">
                            {/* Donor Details */}
                            <div className="bg-white border border-gray-100 rounded-xl p-5 md:p-7 shadow-sm relative mb-5 w-full">
                                <div className="flex items-center justify-between mb-6 w-full">
                                    <div className="flex items-center gap-2 text-gray-900 font-bold text-lg md:text-xl min-w-0">
                                        <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0"><CircleUser className="w-10 h-10 md:w-12 md:h-12" /></span>
                                        <h2 className="truncate">Donor Details</h2>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {editingDonor && (
                                            <button
                                                onClick={saveProfileUpdates}
                                                className="text-[#00a86b] hover:text-[#00965e] text-sm font-medium px-3 py-1 bg-green-50 rounded-lg flex-shrink-0"
                                            >
                                                Save
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                if (editingDonor) {
                                                    fetchAllData();
                                                }
                                                setEditingDonor(!editingDonor);
                                            }}
                                            className="text-[#00a86b] hover:text-[#00965e] flex-shrink-0"
                                        >
                                            {editingDonor ? <X size={20} /> : <SquarePen size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-2 p-2.5">
                                    <div className="space-y-4 m-3 p-2">
                                        {donorDetails.map((item, index) => (
                                            <div key={item.label} className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] items-center text-sm md:text-base leading-[32px] gap-2">
                                                <span className="text-gray-400 font-medium truncate">
                                                    {item.label}:
                                                    {item.isRequired && !item.isFromAuth && !item.value && (
                                                        <span className="text-red-500 ml-1">*</span>
                                                    )}
                                                </span>
                                                {editingDonor ? (
                                                    <input
                                                        type="text"
                                                        value={item.value}
                                                        onChange={(e) => handleDonorChange(index, e.target.value, false)}
                                                        className={`text-gray-800 font-bold bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#00a86b] focus:border-transparent w-full ${item.isFromAuth ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                                                            }`}
                                                        disabled={item.isFromAuth}
                                                        placeholder={item.isRequired && !item.value ? "Required" : ""}
                                                    />
                                                ) : (
                                                    <span className={`text-gray-800 font-bold truncate ${!item.value && !item.isFromAuth ? 'text-gray-400 italic' : ''}`}>
                                                        {item.value || "Not provided"}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-4 m-3 p-2">
                                        {personalDetails.map((item, index) => (
                                            <div key={item.label} className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] items-center text-sm md:text-base leading-[32px] gap-2">
                                                <span className="text-gray-400 font-medium truncate">
                                                    {item.label}:
                                                    {item.isRequired && !item.isFromAuth && !item.value && (
                                                        <span className="text-red-500 ml-1">*</span>
                                                    )}
                                                </span>
                                                {editingDonor ? (
                                                    <input
                                                        type={item.label === "DOB" ? "date" : "text"}
                                                        value={item.value}
                                                        onChange={(e) => handleDonorChange(index, e.target.value, true)}
                                                        className={`text-gray-800 font-bold bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#00a86b] focus:border-transparent w-full ${item.isFromAuth ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                                                            }`}
                                                        disabled={item.isFromAuth}
                                                        placeholder={item.isRequired && !item.value ? "Required" : ""}
                                                    />
                                                ) : (
                                                    <span className={`text-gray-800 font-bold truncate ${!item.value && !item.isFromAuth ? 'text-gray-400 italic' : ''}`}>
                                                        {item.value || "Not provided"}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Recurring Details - FROM REAL DB */}
                            <div className="bg-white border border-gray-100 rounded-xl p-5 md:p-7 shadow-sm relative mb-5 w-full">
                                <div className="flex items-center justify-between mb-6 w-full">
                                    <div className="flex items-center gap-2 text-gray-900 font-bold text-lg md:text-xl min-w-0">
                                        <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0"><RefreshCw size={20} /></span>
                                        <h2 className="truncate">Recurring Details</h2>
                                    </div>
                                    <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Read Only</span>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-5 m-3 p-2">
                                        {recurringDetails.map((item) => (
                                            <div key={item.label} className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] items-center text-sm md:text-base leading-[32px] gap-2">
                                                <span className="text-gray-400 font-medium truncate">{item.label}:</span>
                                                <span className="text-gray-800 font-bold truncate">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-4 m-3 p-2">
                                        {recurringDetails2.map((item) => (
                                            <div key={item.label} className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] items-center text-sm md:text-base leading-[32px] gap-2">
                                                <span className="text-gray-400 font-medium truncate">{item.label}:</span>
                                                <span className="text-gray-800 font-bold truncate">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Change Password Button */}
                            <div className="mt-4">
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="flex items-center gap-2 text-[#00a86b] hover:text-[#00965e] font-medium text-sm border border-[#00a86b] hover:border-[#00965e] px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Key size={18} />
                                    Change Password
                                </button>
                            </div>
                        </div>

                        {/* Right Sidebar - Donation Activity FROM REAL DB */}
                        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm w-full xl:max-w-sm h-fit flex-shrink-0">
                            {donationStats.recentDonations && donationStats.recentDonations.length > 0 ? (
                                donationStats.recentDonations.map((item, index) => (
                                    <div key={index} className="flex items-start gap-3 py-3 border-b last:border-b-0">
                                        <RefreshCw size={25} className="flex-shrink-0 text-[#00a86b]" />
                                        <div className="grid min-w-0">
                                            <span className="font-black text-[14px] truncate">${item.amount} {item.currency || 'USD'}</span>
                                            <span className="text-gray-500 text-[11px] truncate">{item.duration || 'N/A'}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-start gap-3 py-3 border-b last:border-b-0">
                                    <RefreshCw size={25} className="flex-shrink-0 text-gray-300" />
                                    <div className="grid min-w-0">
                                        <span className="font-black text-[14px] truncate text-gray-400">$0</span>
                                        <span className="text-gray-400 text-[11px] truncate">No donations yet</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-3 mt-8">
                                {buttons.map((item) => (
                                    <button
                                        key={item.label}
                                        onClick={() => navigate(item.path)}
                                        className="w-full bg-[#00a86b] hover:bg-[#00965e] text-white text-[13px] font-bold py-2.5 px-4 rounded-xl flex items-center justify-between transition-colors shadow-sm cursor-pointer"
                                    >
                                        <span>{item.label}</span>
                                        <span className="text-[15px] font-light opacity-90">
                                            <ArrowRight size={15} />
                                        </span>
                                    </button>
                                ))}

                                <button
                                    onClick={handleLogout}
                                    className="w-full bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold py-2.5 px-4 rounded-xl flex items-center justify-between transition-colors shadow-sm cursor-pointer mt-2"
                                >
                                    <span>Logout</span>
                                    <span className="text-[15px] font-light opacity-90">
                                        <LogOut size={15} />
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ==================== BADGES SECTION ==================== */}
                    <div className="px-4 md:px-6 pb-6">
                        <div className="bg-white border border-gray-100 rounded-xl p-5 md:p-7 shadow-sm w-full">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2 text-gray-900 font-bold text-lg md:text-xl">
                                    <Award size={24} className="text-[#00a86b]" />
                                    <h2>Your Badges</h2>
                                </div>
                                <button
                                    onClick={fetchAllData}
                                    className="text-sm text-[#00a86b] hover:text-[#00965e] font-medium flex items-center gap-1"
                                >
                                    <RefreshCw size={14} />
                                    Refresh
                                </button>
                            </div>

                            {badgesLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a86b]"></div>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                        {badges.map((badge) => (
                                            <div
                                                key={badge.name}
                                                className={`relative flex flex-col items-center p-3 rounded-lg transition-all duration-300 ${badge.unlocked
                                                    ? 'bg-gradient-to-br from-[#00a86b]/10 to-[#00a86b]/5 border border-[#00a86b]/30 hover:shadow-md'
                                                    : 'bg-gray-50 border border-gray-200 opacity-60'
                                                    }`}
                                            >
                                                <div className={`text-3xl mb-1 ${badge.unlocked ? '' : 'filter blur-[1px]'}`}>
                                                    {badge.icon}
                                                </div>
                                                <span className={`text-xs font-medium text-center leading-tight ${badge.unlocked ? 'text-gray-800' : 'text-gray-400'
                                                    }`}>
                                                    {badge.name}
                                                </span>
                                                {badge.level && (
                                                    <span className={`mt-0.5 text-[8px] font-bold uppercase ${badge.unlocked ? 'text-[#00a86b]' : 'text-gray-400'
                                                        }`}>
                                                        {badge.level}
                                                    </span>
                                                )}
                                                <span className={`mt-1 text-[10px] font-medium ${badge.unlocked ? 'text-[#00a86b]' : 'text-gray-400'
                                                    }`}>
                                                    {badge.unlocked ? '✓' : '🔒'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Progress Summary */}
                                    <div className="mt-6 pt-4 border-t border-gray-100">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Progress</span>
                                            <span className="font-medium text-[#00a86b]">
                                                {badges.filter(b => b.unlocked).length} / {badges.length}
                                            </span>
                                        </div>
                                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                            <div
                                                className="bg-[#00a86b] h-1.5 rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${(badges.filter(b => b.unlocked).length / badges.length) * 100}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Key size={24} className="text-[#00a86b]" />
                                    Change Password
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setPasswordError('');
                                        setPasswordSuccess('');
                                        setPasswordData({
                                            currentPassword: '',
                                            newPassword: '',
                                            confirmPassword: ''
                                        });
                                    }}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handlePasswordChange}>
                                {/* Current Password */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({
                                                ...passwordData,
                                                currentPassword: e.target.value
                                            })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b] focus:border-transparent"
                                            placeholder="Enter current password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({
                                                ...passwordData,
                                                newPassword: e.target.value
                                            })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b] focus:border-transparent"
                                            placeholder="Enter new password (min 6 characters)"
                                            required
                                            minLength="6"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
                                </div>

                                {/* Confirm Password */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({
                                                ...passwordData,
                                                confirmPassword: e.target.value
                                            })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b] focus:border-transparent"
                                            placeholder="Confirm new password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                {passwordError && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                        {passwordError}
                                    </div>
                                )}
                                {passwordSuccess && (
                                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                                        {passwordSuccess}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPasswordModal(false);
                                            setPasswordError('');
                                            setPasswordSuccess('');
                                            setPasswordData({
                                                currentPassword: '',
                                                newPassword: '',
                                                confirmPassword: ''
                                            });
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isChangingPassword}
                                        className="flex-1 px-4 py-2 bg-[#00a86b] text-white rounded-lg hover:bg-[#00965e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        {isChangingPassword ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Changing...
                                            </>
                                        ) : (
                                            'Change Password'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DonorProfile;