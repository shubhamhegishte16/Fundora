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
    CircleUser
} from "lucide-react";
import Sidebar from "./Sidebar";

// --- Main Donor Profile Page ---
const DonorProfile = () => {
    const [activeTab, setActiveTab] = useState("Dashboard");
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
        <div className="flex min-h-screen bg-[#f8fafc]">
            {/* Sidebar */}
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />

            {/* Main Content - Added flex-1 and min-w-0 to prevent shrinking */}
            <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between mx-8 my-6">
                    <div className="flex items-center text-[17px] font-bold text-[#1E1E1E]">
                        <span>Arjun Sharma</span>
                        <Dot size={20} className="text-gray-400" />
                        <span>Donor</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#6DD89B]">
                            <Check size={12} className="text-white" />
                        </div>
                        <span className="text-sm text-gray-600">Profile Verified</span>
                    </div>
                </div>

                {/* UserDefined */}
                <div className="flex items-center justify-between mx-10 my-8">
                    <div className="flex justify-center gap-3">
                        <div className="flex items-center justify-center">
                            <CircleUser size={45} color="#1bc089" />
                        </div>
                        <div className="grid">
                            <span className="font-semibold text-[17px]">Arjun Sharma</span>
                            <span className="text-gray-500 text-[12px]">arjunsharma@gmail.com</span>
                        </div>
                    </div>
                    <div className="flex gap-8">
                        <div className="grid">
                            <span className="font-extrabold text-[20px]">$ 37,450</span>
                            <span className="font-medium text-[15px] text-gray-600">Lifetime Donations</span>
                        </div>
                        <div className="grid">
                            <span className="font-extrabold text-[20px]">$ 12,850</span>
                            <span className="font-medium text-[15px] text-gray-600">Avg Donations Size</span>
                        </div>
                        <div className="mx-15">
                            <span className="font-extrabold text-[18px]">Activity</span>
                        </div>
                    </div>
                </div>

                <div className="flex">
                    <div>
                        {/* Donor Data */}
                        <div className="bg-white border border-gray-100 p-7 shadow-sm/50 relative mb-5 w-250 mx-6">
                            <div className="flex items-center justify-between mb-6 w-230">
                                <div className="flex items-center gap-2 text-gray-900 font-bold text-[20px]">
                                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs"><CircleUser /></span>
                                    <h2>Donor Details</h2>
                                </div>
                                <button className="text-[#00a86b] hover:text-[#00965e]">
                                    <SquarePen size={20} />
                                </button>
                            </div>

                            {/* Donor Details */}
                            <div className="grid grid-cols-2 gap-x-12 gap-y-4 p-2.5">
                                <div className="space-y-5 m-3 p-2">
                                    {donorDetails.map((item) => (
                                        <div key={item.label} className="grid grid-cols-[270px_1fr] items-center text-[17px] leading-[32px]">

                                            <span className="text-gray-400 font-medium">{item.label}:</span>

                                            <span className="text-gray-800 font-bold">{item.value}</span>
                                        </div>
                                    ))}
                                </div>


                                <div className="space-y-4 m-3 p-2">
                                    {personalDetails.map((item) => (
                                        <div key={item.label} className="grid grid-cols-[250px_1fr] items-center text-[17px] leading-[32px]">

                                            <span className="text-gray-400 font-medium">{item.label}:</span>

                                            <span className="text-gray-800 font-bold">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recurring Details */}
                        <div className="bg-white border border-gray-100 p-7 shadow-sm/50 relative mb-5 w-250 mx-6">
                            <div className="flex items-center justify-between mb-6 w-230">
                                <div className="flex items-center gap-2 text-gray-900 font-bold text-[20px]">
                                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs"><RefreshCw /></span>
                                    <h2>Recurring Details</h2>
                                </div>
                                <button className="text-[#00a86b] hover:text-[#00965e]">
                                    <SquarePen size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-x-12 gap-y-4 p-2.5">
                                <div className="space-y-5 m-3 p-2">
                                    {recurringDetails.map((item) => (
                                        <div key={item.label} className="grid grid-cols-[270px_1fr] items-center text-[17px] leading-[32px]">

                                            <span className="text-gray-400 font-medium">{item.label}:</span>

                                            <span className="text-gray-800 font-bold">{item.value}</span>
                                        </div>
                                    ))}
                                </div>


                                <div className="space-y-4 m-3 p-2">
                                    {recurringDetails2.map((item) => (
                                        <div key={item.label} className="grid grid-cols-[250px_1fr] items-center text-[17px] leading-[32px]">

                                            <span className="text-gray-400 font-medium">{item.label}:</span>

                                            <span className="text-gray-800 font-bold">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="bg-white border border-gray-100 p-2 shadow-sm/50 relative mb-5 w-250 mx-6 h-70">
                        {donationActivity.map((item) => (
                            <div className="flex gap-2.5">
                                <RefreshCw size={25} />
                                <div className="grid">
                                    <span className="font-black text-[14px]">{item.donation} Do.</span>
                                    <span className="font-gray text-[11px]">{item.duration}</span>
                                    -------------
                                </div>
                            </div>
                        ))}

                        <div className="flex flex-col gap-2.5 p-7 my-12">
                            {buttons.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => console.log(`Clicked ${item.label}`)}
                                    className="w-full bg-[#00a86b] hover:bg-[#00965e] text-white text-[13px] font-bold py-2.5 px-4 rounded-xl flex items-center justify-between transition-colors shadow-sm cursor-pointer"
                                >
                                    {/* Button Label */}
                                    <span>{item.label}</span>

                                    {/* Elegant Right Arrow */}
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