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
    Key
} from "lucide-react";
import Sidebar from "./Sidebar";
import { getProfile, updateProfile } from "../../services/donorProfileService.js";

// --- Main Donor Profile Page ---
const DonorProfile = () => {
    // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
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

    // Recurring details - read-only, from other databases
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


    useEffect(() => {
        fetchProfile();
    }, []);

    // Update donor and personal details when profile data loads
    useEffect(() => {
        if (user) {
            // Check if profile is complete by checking if required fields exist
            const hasProfileData = profile && (
                profile.address ||
                profile.city ||
                profile.state ||
                profile.country ||
                profile.dob ||
                profile.gender
            );

            setIsProfileComplete(hasProfileData);

            // Donor Details - these come from user auth and profile
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

            // Personal Details - combine user auth and profile data
            setPersonalDetails([
                {
                    label: "Mobile",
                    value: profile?.mobile || profile?.mobile || "",
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

    const fetchProfile = async () => {
        try {
            setFetchError(null);
            setLoading(true);

            const response = await getProfile();

            // The response directly has user and profile properties
            if (response && response.success) {
                setUser(response.user || null);
                setProfile(response.profile || null);
            } else {
                throw new Error(response?.message || 'Failed to fetch profile');
            }

        } catch (error) {
            console.error("Error fetching profile:", error);
            setFetchError(error?.response?.data?.message || error.message || "Failed to load profile. Please refresh the page.");

            // Try to get user from localStorage as fallback
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const userData = JSON.parse(storedUser);
                    setUser(userData);
                    setProfile({});
                }
            } catch (e) {
                console.error("Error parsing stored user:", e);
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle donor detail change
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

    // Save profile updates
    const saveProfileUpdates = async () => {
        try {
            setSaveError(null);

            // Prepare profile data from donor details and personal details
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
                // Refresh profile data
                await fetchProfile();

                // Exit edit mode
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

    // Default donation activity data (will be replaced with real data from DB)
    const donationActivity = [
        { donation: "$0", duration: "No donations yet" },
        { donation: "$0", duration: "No donations yet" },
        { donation: "$0", duration: "No donations yet" },
        { donation: "$0", duration: "First Donation" },
    ];

    const buttons = [
        { label: "Donation" },
        { label: "History" },
        { label: "My Rewards" }
    ];

    // Now it's safe to have conditional returns
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
                {/* Header - Updated */}
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

                    {/* Profile Verified - Moved to right */}
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
                    {/* Error Display */}
                    {fetchError && (
                        <div className="px-4 md:px-8 pt-4">
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                                <div className="text-red-600 text-lg">❌</div>
                                <div className="flex-1">
                                    <p className="text-sm text-red-800 font-medium">Error Loading Profile</p>
                                    <p className="text-xs text-red-700 mt-1">{fetchError}</p>
                                    <button
                                        onClick={fetchProfile}
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
                                <div className="text-red-600 text-lg">❌</div>
                                <div className="flex-1">
                                    <p className="text-sm text-red-800 font-medium">Error Saving Profile</p>
                                    <p className="text-xs text-red-700 mt-1">{saveError}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* User Defined Section */}
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
                                <span className="font-extrabold text-lg md:text-xl">$ 0</span>
                                <span className="font-medium text-[15px] text-gray-600">Lifetime Donations</span>
                            </div>
                            <div className="grid text-center sm:text-left">
                                <span className="font-extrabold text-lg md:text-xl">$ 0</span>
                                <span className="font-medium text-[15px] text-gray-600">Avg Donations Size</span>
                            </div>
                        </div>
                    </div>

                    {!isProfileComplete && user && (
                        <div className="px-4 md:px-8 pb-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                                <div className="text-yellow-600 text-lg">⚠️</div>
                                <div className="flex-1">
                                    <p className="text-sm text-yellow-800 font-medium">Profile Incomplete</p>
                                    <p className="text-xs text-yellow-700 mt-1">
                                        Please fill in your address, city, state, country, DOB, and gender to complete your profile.
                                        Click the edit button (✏️) next to "Donor Details" to update your information.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col xl:flex-row gap-6 px-4 md:px-6 pb-6">
                        <div className="flex-1 min-w-0">
                            {/* Donor Data */}
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
                                                    // If canceling edit, reload data
                                                    fetchProfile();
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

                            {/* Recurring Details - READ ONLY, NO EDIT BUTTON */}
                            <div className="bg-white border border-gray-100 rounded-xl p-5 md:p-7 shadow-sm relative mb-5 w-full">
                                <div className="flex items-center justify-between mb-6 w-full">
                                    <div className="flex items-center gap-2 text-gray-900 font-bold text-lg md:text-xl min-w-0">
                                        <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0"><RefreshCw size={20} /></span>
                                        <h2 className="truncate">Recurring Details</h2>
                                    </div>
                                    {/* No edit button - read only */}
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
                        </div>

                        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm w-full xl:max-w-sm h-fit flex-shrink-0">
                            {donationActivity.map((item, index) => (
                                <div key={index} className="flex items-start gap-3 py-3 border-b last:border-b-0">
                                    <RefreshCw size={25} className="flex-shrink-0 text-gray-300" />
                                    <div className="grid min-w-0">
                                        <span className="font-black text-[14px] truncate text-gray-400">{item.donation}</span>
                                        <span className="text-gray-400 text-[11px] truncate">{item.duration}</span>
                                    </div>
                                </div>
                            ))}

                            <div className="flex flex-col gap-3 mt-8">
                                {buttons.map((item) => (
                                    <button
                                        key={item.label}
                                        onClick={() => console.log(`Clicked ${item.label}`)}
                                        className="w-full bg-[#00a86b] hover:bg-[#00965e] text-white text-[13px] font-bold py-2.5 px-4 rounded-xl flex items-center justify-between transition-colors shadow-sm cursor-pointer"
                                    >
                                        <span>{item.label}</span>
                                        <span className="text-[15px] font-light opacity-90">→</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonorProfile;