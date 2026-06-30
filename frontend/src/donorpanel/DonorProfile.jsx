import React, { useState } from "react";
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
    X
} from "lucide-react";
import Sidebar from "./Sidebar";

// --- Main Donor Profile Page ---
const DonorProfile = () => {
    const [activeTab, setActiveTab] = useState("Profile Settings");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // State for editable data
    const [donorDetails, setDonorDetails] = useState([
        { label: "First Name", value: "Arjun" },
        { label: "Last Name", value: "Sharma" },
        { label: "Address", value: "55 Road Wail" },
        { label: "City", value: "Mumbai" },
        { label: "State & zip", value: "Maharashtra, 400075" },
        { label: "Country", value: "India" },
    ]);

    const [personalDetails] = useState([
        { label: "Mobile", value: "99656788765" },
        { label: "Phone", value: "456789878" },
        { label: "DOB", value: "10/04/2008" },
        { label: "Gender", value: "Male" },
        { label: "Created", value: "June 21, 2026" },
        { label: "Account", value: "Donor" },
    ]);

    const [recurringDetails, setRecurringDetails] = useState([
        { label: "Amount", value: "$540" },
        { label: "Frequency", value: "Monthly" },
        { label: "Created", value: "June 28, 2026" }
    ]);

    const [recurringDetails2, setRecurringDetails2] = useState([
        { label: "Giving Fund", value: "General Fund" },
        { label: "Total", value: "$37,450" },
        { label: "Method", value: "UPI Card" }
    ]);

    const [editingDonor, setEditingDonor] = useState(false);
    const [editingRecurring, setEditingRecurring] = useState(false);

    const donationActivity = [
        { donation: "$540", duration: "Yesterday" },
        { donation: "$1120", duration: "Yesterday" },
        { donation: "$128", duration: "Last month" },
        { donation: "$54", duration: "First Donation" },
    ];

    const buttons = [
        { label: "Donation" },
        { label: "History" },
        { label: "My Rewards" }
    ];

    // Handle donor detail change
    const handleDonorChange = (index, value) => {
        const updated = [...donorDetails];
        updated[index].value = value;
        setDonorDetails(updated);
    };

    // Handle recurring detail change
    const handleRecurringChange = (index, value, isFirstSet) => {
        if (isFirstSet) {
            const updated = [...recurringDetails];
            updated[index].value = value;
            setRecurringDetails(updated);
        } else {
            const updated = [...recurringDetails2];
            updated[index].value = value;
            setRecurringDetails2(updated);
        }
    };

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
                                <span className="truncate">Arjun Sharma</span>
                                <Dot size={20} className="text-gray-400 flex-shrink-0" />
                                <span className="text-gray-500 font-medium text-lg md:text-xl flex-shrink-0">Donor</span>
                            </h1>
                        </div>
                    </div>

                    {/* Profile Verified - Moved to right */}
                    <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#6DD89B] flex-shrink-0">
                            <Check size={12} className="text-white" />
                        </div>
                        <span className="text-sm text-gray-600">Profile Verified</span>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* User Defined Section */}
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 px-4 md:px-8 py-6">
                        <div className="flex justify-center gap-3">
                            <div className="flex items-center justify-center flex-shrink-0">
                                <CircleUser className="w-10 h-10 md:w-12 md:h-12" />
                            </div>
                            <div className="grid min-w-0">
                                <span className="font-semibold text-sm md:text-base truncate">Arjun Sharma</span>
                                <span className="text-gray-500 text-[12px] truncate">arjunsharma@gmail.com</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-start gap-6 lg:gap-10 xl:gap-16">
                            <div className="grid text-center sm:text-left">
                                <span className="font-extrabold text-lg md:text-xl">$ 37,450</span>
                                <span className="font-medium text-[15px] text-gray-600">Lifetime Donations</span>
                            </div>
                            <div className="grid text-center sm:text-left">
                                <span className="font-extrabold text-lg md:text-xl">$ 12,850</span>
                                <span className="font-medium text-[15px] text-gray-600">Avg Donations Size</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col xl:flex-row gap-6 px-4 md:px-6 pb-6">
                        <div className="flex-1 min-w-0">
                            {/* Donor Data */}
                            <div className="bg-white border border-gray-100 rounded-xl p-5 md:p-7 shadow-sm relative mb-5 w-full">
                                <div className="flex items-center justify-between mb-6 w-full">
                                    <div className="flex items-center gap-2 text-gray-900 font-bold text-lg md:text-xl min-w-0">
                                        <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0"><CircleUser className="w-10 h-10 md:w-12 md:h-12" /></span>
                                        <h2 className="truncate">Donor Details</h2>
                                    </div>
                                    <button
                                        onClick={() => setEditingDonor(!editingDonor)}
                                        className="text-[#00a86b] hover:text-[#00965e] flex-shrink-0"
                                    >
                                        {editingDonor ? <Check size={20} /> : <SquarePen size={20} />}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-2 p-2.5">
                                    <div className="space-y-4 m-3 p-2">
                                        {donorDetails.map((item, index) => (
                                            <div key={item.label} className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] items-center text-sm md:text-base leading-[32px] gap-2">
                                                <span className="text-gray-400 font-medium truncate">{item.label}:</span>
                                                {editingDonor ? (
                                                    <input
                                                        type="text"
                                                        value={item.value}
                                                        onChange={(e) => handleDonorChange(index, e.target.value)}
                                                        className="text-gray-800 font-bold bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#00a86b] focus:border-transparent w-full"
                                                    />
                                                ) : (
                                                    <span className="text-gray-800 font-bold truncate">{item.value}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-4 m-3 p-2">
                                        {personalDetails.map((item) => (
                                            <div key={item.label} className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] items-center text-sm md:text-base leading-[32px] gap-2">
                                                <span className="text-gray-400 font-medium truncate">{item.label}:</span>
                                                {editingDonor ? (
                                                    <input
                                                        type="text"
                                                        value={item.value}
                                                        onChange={(e) => handleDonorChange(index, e.target.value)}
                                                        className="text-gray-800 font-bold bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#00a86b] focus:border-transparent w-full"
                                                    />
                                                ) : (
                                                    <span className="text-gray-800 font-bold truncate">{item.value}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Recurring Details */}
                            <div className="bg-white border border-gray-100 rounded-xl p-5 md:p-7 shadow-sm relative mb-5 w-full">
                                <div className="flex items-center justify-between mb-6 w-full">
                                    <div className="flex items-center gap-2 text-gray-900 font-bold text-lg md:text-xl min-w-0">
                                        <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0"><RefreshCw size={20} /></span>
                                        <h2 className="truncate">Recurring Details</h2>
                                    </div>
                                    <button
                                        onClick={() => setEditingRecurring(!editingRecurring)}
                                        className="text-[#00a86b] hover:text-[#00965e] flex-shrink-0"
                                    >
                                        {editingRecurring ? <Check size={20} /> : <SquarePen size={20} />}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-5 m-3 p-2">
                                        {recurringDetails.map((item, index) => (
                                            <div key={item.label} className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] items-center text-sm md:text-base leading-[32px] gap-2">
                                                <span className="text-gray-400 font-medium truncate">{item.label}:</span>
                                                {editingRecurring ? (
                                                    <input
                                                        type="text"
                                                        value={item.value}
                                                        onChange={(e) => handleRecurringChange(index, e.target.value, true)}
                                                        className="text-gray-800 font-bold bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#00a86b] focus:border-transparent w-full"
                                                    />
                                                ) : (
                                                    <span className="text-gray-800 font-bold truncate">{item.value}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-4 m-3 p-2">
                                        {recurringDetails2.map((item, index) => (
                                            <div key={item.label} className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] items-center text-sm md:text-base leading-[32px] gap-2">
                                                <span className="text-gray-400 font-medium truncate">{item.label}:</span>
                                                {editingRecurring ? (
                                                    <input
                                                        type="text"
                                                        value={item.value}
                                                        onChange={(e) => handleRecurringChange(index, e.target.value, false)}
                                                        className="text-gray-800 font-bold bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#00a86b] focus:border-transparent w-full"
                                                    />
                                                ) : (
                                                    <span className="text-gray-800 font-bold truncate">{item.value}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm w-full xl:max-w-sm h-fit flex-shrink-0">
                            {donationActivity.map((item, index) => (
                                <div key={index} className="flex items-start gap-3 py-3 border-b last:border-b-0">
                                    <RefreshCw size={25} className="flex-shrink-0" />
                                    <div className="grid min-w-0">
                                        <span className="font-black text-[14px] truncate">{item.donation} Do.</span>
                                        <span className="text-gray-500 text-[11px] truncate">{item.duration}</span>
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