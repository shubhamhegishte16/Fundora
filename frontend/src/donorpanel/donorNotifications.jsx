import React, { useState, useEffect } from "react";
import {
    Search,
    Bell,
    ChevronDown,
    Eye,
    MessageSquare,
    Award,
    Receipt,
    Heart,
    Menu,
    X,
    Dot,
    Filter,
    ChevronUp
} from "lucide-react";
import Sidebar from "./Sidebar";

const Notifications = () => {
    const [activeTab, setActiveTab] = useState("Notifications");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");

    const [notifications] = useState([
        {
            id: 1,
            title: "Receipt for Empower Rural Development",
            type: "Activity",
            status: "Viewed",
            category: "Receipt"
        },
        {
            id: 2,
            title: "Thanking Message from creator Sujeet",
            type: "Message",
            status: "Not Viewed",
            category: "Message"
        },
        {
            id: 3,
            title: "You earned a new Badge",
            type: "Activity",
            status: "Not Viewed",
            category: "Badge"
        },
        {
            id: 4,
            title: "Your payment is successful view receipt",
            type: "Activity",
            status: "Not Viewed",
            category: "Payment"
        },
        {
            id: 5,
            title: "Only one more donation to unlock new badge",
            type: "Activity",
            status: "Not Viewed",
            category: "Badge"
        },
        {
            id: 6,
            title: "Campaign update: New milestone reached",
            type: "Activity",
            status: "Viewed",
            category: "Activity"
        },
        {
            id: 7,
            title: "Thank you for your generous donation",
            type: "Activity",
            status: "Viewed",
            category: "Activity"
        },
        {
            id: 8,
            title: "Weekly donation report available",
            type: "Activity",
            status: "Viewed",
            category: "Activity"
        }
    ]);

    const filteredNotifications = notifications.filter(notification => {
        const matchesFilter = filter === 'all' || notification.status === filter;
        const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusColor = (status) => {
        return status === 'Viewed' ? 'text-gray-600' : 'text-yellow-600 font-medium';
    };

    const getIconBg = (category) => {
        switch (category) {
            case 'Receipt':
            case 'Payment':
                return 'bg-green-100 text-green-600';
            case 'Message':
                return 'bg-blue-100 text-blue-600';
            case 'Badge':
                return 'bg-purple-100 text-purple-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row font-sans antialiased">
            {/* Mobile Header */}
            <div className="lg:hidden w-full bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-xs">
                <span className="font-bold text-gray-900 text-lg">Elpis Panel</span>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 bg-gray-50 border border-gray-100 rounded-xl"
                >
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
                <span className="truncate">Notifications</span>
                <Dot size={20} className="text-gray-400 flex-shrink-0" />
                <span className="text-gray-500 font-medium text-lg md:text-xl flex-shrink-0">
                  {filteredNotifications.length} items
                </span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-gray-600" />
          </div>
        </header>
                <header className="sticky top-0 z-30 bg-[#F8F9FA]/90 backdrop-blur-md border-b border-gray-100/80 px-4 md:px-8 py-5 flex items-center justify-between gap-4 shadow-xs">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
                        <p className="text-gray-600 text-sm">
                            Stay updated with your latest messages and responses.
                        </p>
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

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">


                    {/* Search Bar */}
                    <div className="flex items-center gap-3 mb-6">
                        {/* Search Bar - Takes remaining space */}
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b] focus:border-transparent bg-white"
                            />
                            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        </div>

                        {/* Filter Button */}
                        <button className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0">
                            <Filter className="w-5 h-5 text-gray-600" />
                        </button>

                        {/* Type Dropdown Button */}
                        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 flex-shrink-0">
                            <span className="text-sm font-medium">Type</span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>

                    {/* Notification Headers */}
                    <div className="flex items-center justify-between px-4 py-2 bg-white rounded-t-lg border-b border-gray-200">
                        <div className="flex-1">
                            <span className="font-medium text-gray-700">Notification</span>
                        </div>
                        <div className="flex items-center space-x-26 mr-10">
                            <span className="font-medium text-gray-700">Type</span>
                            <span className="font-medium text-gray-700">Status</span>
                        </div>
                    </div>

                    {/* Notification Items */}
                    <div className="bg-white rounded-b-lg shadow-sm">
                        {filteredNotifications.map((item, index) => (
                            <div
                                key={item.id}
                                className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition ${index !== filteredNotifications.length - 1 ? 'border-b border-gray-100' : ''
                                    } ${item.status === 'Not Viewed' ? 'bg-blue-50' : ''}`}
                            >
                                <div className="flex items-center flex-1 min-w-0">
                                    <div className={`p-1.5 rounded-full mr-3 flex-shrink-0 ${getIconBg(item.category)}`}>
                                        {/* {item.icon && <item.icon className="w-4 h-4" />} */}
                                    </div>
                                    <span className="text-sm text-gray-800 truncate">{item.title}</span>
                                </div>
                                <div className="flex items-center space-x-12 flex-shrink-0 ml-4">
                                    <span className="text-sm text-gray-600 w-20">{item.type}</span>
                                    <div className="flex items-center w-24">
                                        <span className={`text-sm px-2 py-0.5 rounded ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                        {/* <ChevronDown className="w-4 h-4 text-gray-400 ml-1" /> */}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredNotifications.length === 0 && (
                            <div className="text-center py-12">
                                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No notifications found</p>
                            </div>
                        )}
                    </div>

                    {/* Footer note */}
                    <div className="mt-6 text-xs text-gray-400 text-center">
                        Showing {filteredNotifications.length} notifications
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Notifications;