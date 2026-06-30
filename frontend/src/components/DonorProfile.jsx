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

    const donorDetails = [
        { label: "First Name", value: "Arjun" },
        { label: "Last Name", value: "Sharma" },
        { label: "Address", value: "55 Road Wail" },
        { label: "City", value: "Mumbai" },
        { label: "State & zip", value: "Maharashtra, 400075" },
        { label: "Country", value: "India" },
    ];

    const personalDetails = [
        { label: "Mobile", value: "99656788765" },
        { label: "Phone", value: "456789878" },
        { label: "DOB", value: "10/04/2008" },
        { label: "Gender", value: "Male" },
        { label: "Created", value: "June 21, 2026" },
        { label: "Account", value: "Donor" },
    ];

    const recurringDetails = [
        { label: "Amount", value: "$540" },
        { label: "Frequency", value: "Monthly" },
        { label: "Created", value: "June 28, 2026" }
    ];

    const recurringDetails2 = [
        { label: "Giving Fund", value: "General Fund" },
        { label: "Total", value: "$37,450" },
        { label: "Method", value: "UPI Card" }
    ];

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

    return (
        <div className="flex min-h-screen bg-[#f8fafc] relative">
            {/* Mobile Hamburger Menu Button - Fixed Position */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
                aria-label="Toggle sidebar"
            >
                {isSidebarOpen ? (
                    <X size={24} className="text-gray-700" />
                ) : (
                    <Menu size={24} className="text-gray-700" />
                )}
            </button>

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
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content - Added flex-1 and min-w-0 to prevent shrinking */}
            <div className="flex-1 min-w-0 overflow-x-hidden">
                {/* Header - Added padding top for mobile hamburger */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4 md:px-8 pt-16 md:pt-6 pb-6">
                    <div className="flex items-center text-sm md:text-base font-bold text-[#1E1E1E]">
                        <span>Arjun Sharma</span>
                        <Dot size={20} className="text-gray-400" />
                        <span>Donor</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#6DD89B] flex-shrink-0">
                            <Check size={12} className="text-white" />
                        </div>
                        <span className="text-sm text-gray-600">Profile Verified</span>
                    </div>
                </div>

                {/* UserDefined */}
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

                <div className="flex flex-col xl:flex-row gap-6 px-4 md:px-6">
                    <div className="flex-1 min-w-0">
                        {/* Donor Data */}
                        <div className="bg-white border border-gray-100 rounded-xl p-5 md:p-7 shadow-sm relative mb-5 w-full">
                            <div className="flex items-center justify-between mb-6 w-full">
                                <div className="flex items-center gap-2 text-gray-900 font-bold text-lg md:text-xl min-w-0">
                                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0"><CircleUser className="w-10 h-10 md:w-12 md:h-12" /></span>
                                    <h2 className="truncate">Donor Details</h2>
                                </div>
                                <button className="text-[#00a86b] hover:text-[#00965e] flex-shrink-0">
                                    <SquarePen size={20} />
                                </button>
                            </div>

                            {/* Donor Details */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-2 p-2.5">
                                <div className="space-y-4 m-3 p-2">
                                    {donorDetails.map((item) => (
                                        <div key={item.label} className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] md:grid-cols-[140px_1fr] lg:grid-cols-[160px_1fr] items-center text-sm md:text-base leading-[32px] gap-2">
                                            <span className="text-gray-400 font-medium truncate">{item.label}:</span>
                                            <span className="text-gray-800 font-bold truncate">{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4 m-3 p-2">
                                    {personalDetails.map((item) => (
                                        <div key={item.label} className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] md:grid-cols-[140px_1fr] lg:grid-cols-[160px_1fr] items-center text-sm md:text-base leading-[32px] gap-2">
                                            <span className="text-gray-400 font-medium truncate">{item.label}:</span>
                                            <span className="text-gray-800 font-bold truncate">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recurring Details */}
                        <div className="bg-white border border-gray-100 p-7 shadow-sm/50 relative mb-5 w-full">
                            <div className="flex items-center justify-between mb-6 w-full">
                                <div className="flex items-center gap-2 text-gray-900 font-bold text-lg md:text-xl min-w-0">
                                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0"><RefreshCw /></span>
                                    <h2 className="truncate">Recurring Details</h2>
                                </div>
                                <button className="text-[#00a86b] hover:text-[#00965e] flex-shrink-0">
                                    <SquarePen size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-5 m-3 p-2">
                                    {recurringDetails.map((item) => (
                                        <div key={item.label} className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] md:grid-cols-[140px_1fr] lg:grid-cols-[160px_1fr] items-center text-sm md:text-base leading-[32px] gap-2">
                                            <span className="text-gray-400 font-medium truncate">{item.label}:</span>
                                            <span className="text-gray-800 font-bold truncate">{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4 m-3 p-2">
                                    {recurringDetails2.map((item) => (
                                        <div key={item.label} className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] md:grid-cols-[140px_1fr] lg:grid-cols-[160px_1fr] items-center text-sm md:text-base leading-[32px] gap-2">
                                            <span className="text-gray-400 font-medium truncate">{item.label}:</span>
                                            <span className="text-gray-800 font-bold truncate">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm w-full xl:max-w-sm h-fit flex-shrink-0">
                        {donationActivity.map((item) => (
                            <div className="flex items-start gap-3 py-3 border-b last:border-b-0">
                                <RefreshCw size={25} className="flex-shrink-0" />
                                <div className="grid min-w-0">
                                    <span className="font-black text-[14px] truncate">{item.donation} Do.</span>
                                    <span className="font-gray text-[11px] truncate">{item.duration}</span>
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
    );
};

export default DonorProfile;