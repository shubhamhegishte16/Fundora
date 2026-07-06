import React, { useState, useEffect } from "react";
import {
    Search,
    Bell,
    ChevronDown,
    Filter,
    Menu,
    X,
    Loader2
} from "lucide-react";
import Sidebar from "./Sidebar";
import { getDonorNotifications, markNotificationAsRead } from "../../services/donorNotificationApiService.js";
import { getProfile } from "../../services/donorProfileService.js";

const Notifications = () => {
    const [activeTab, setActiveTab] = useState("Notifications");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [donorName, setDonorName] = useState("Donor");

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch profile for dynamic name
                const profileRes = await getProfile();
                if (profileRes.success && profileRes.user) {
                    setDonorName(profileRes.user.name || "Donor");
                }
                
                // Fetch notifications
                const notifRes = await getDonorNotifications();
                if (notifRes.success) {
                    setNotifications(notifRes.notifications);
                }
            } catch (error) {
                console.error("Failed to load notifications data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await markNotificationAsRead(id);
            setNotifications(prev => prev.map(n => 
                n._id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markNotificationAsRead('all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const filteredNotifications = notifications.filter(notification => {
        const matchesFilter = filter === 'all' || 
            (filter === 'unread' && !notification.isRead) || 
            (filter === 'read' && notification.isRead);
        const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusColor = (isRead) => {
        return isRead ? 'text-gray-600' : 'text-[#10B981] font-bold';
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
            case 'Activity':
                return 'bg-blue-100 text-blue-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

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
                <header className="sticky top-0 z-20 bg-white border-b border-gray-100/80 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-900 p-2 hover:bg-slate-50 rounded-xl transition-all cursor-pointer">
                            <Menu size={24} />
                        </button>
                        <div>
                            <h2 className="text-lg sm:text-2xl font-black text-gray-900">Notifications</h2>
                            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                                Stay updated with your latest messages and responses.
                            </p>
                        </div>
                    </div>

                    {/* User Actions Account Node Block */}
                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-3 pl-1 sm:pl-0">
                            <div className="w-10 h-10 shrink-0 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-lg shadow-sm border border-gray-100">
                                {donorName ? donorName.charAt(0).toUpperCase() : "D"}
                            </div>
                            <div className="hidden sm:block leading-none">
                                <h4 className="text-sm font-bold text-gray-900">{donorName}</h4>
                                <p className="text-[11px] text-gray-500 font-semibold uppercase mt-0.5 tracking-wider">Donor</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">

                    {/* Search Bar & Filters */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                        {/* Search Bar - Takes remaining space */}
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search notifications..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#10B981] bg-white text-sm font-medium transition-colors"
                            />
                            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        </div>

                        <div className="flex gap-2">
                            <select 
                                className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 outline-none focus:border-[#10B981] bg-white cursor-pointer"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="unread">Unread</option>
                                <option value="read">Read</option>
                            </select>
                            
                            {unreadCount > 0 && (
                                <button 
                                    onClick={handleMarkAllAsRead}
                                    className="px-4 py-2.5 bg-[#10B981] hover:bg-emerald-600 text-white rounded-lg transition-colors text-sm font-bold cursor-pointer whitespace-nowrap"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Notification Headers */}
                    <div className="hidden sm:flex items-center justify-between px-4 py-3 bg-white rounded-t-xl border-b border-gray-200 shadow-sm">
                        <div className="flex-1">
                            <span className="font-bold text-gray-700 text-sm">Notification</span>
                        </div>
                        <div className="flex items-center space-x-16 mr-2 w-37 shrink-0 justify-between">
                            <span className="font-bold text-gray-700 text-sm">Type</span>
                            <span className="font-bold text-gray-700 text-sm">Status</span>
                        </div>
                    </div>

                    {/* Notification Items */}
                    <div className="bg-white sm:rounded-b-xl rounded-xl shadow-sm border border-gray-100">
                        {loading ? (
                            <div className="flex justify-center items-center py-16">
                                <Loader2 className="animate-spin text-[#10B981]" size={32} />
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="text-center py-12">
                                <Bell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">No notifications found</p>
                            </div>
                        ) : (
                            filteredNotifications.map((item, index) => (
                                <div
                                    key={item._id}
                                    onClick={() => !item.isRead && handleMarkAsRead(item._id)}
                                    className={`flex flex-col sm:flex-row sm:items-center justify-between px-4 py-4 sm:py-3 transition cursor-pointer ${
                                        index !== filteredNotifications.length - 1 ? 'border-b border-gray-100' : ''
                                    } ${!item.isRead ? 'bg-emerald-50/50 hover:bg-emerald-50' : 'hover:bg-gray-50'}`}
                                >
                                    <div className="flex items-start sm:items-center flex-1 min-w-0 mb-3 sm:mb-0">
                                        <div className={`p-2 rounded-full mr-3 flex-shrink-0 mt-1 sm:mt-0 ${getIconBg(item.category)}`}>
                                            <Bell className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-800">{item.title}</span>
                                            <span className="text-xs text-gray-500 mt-0.5 pr-4">{item.detail}</span>
                                            <span className="text-[10px] text-gray-400 mt-1 sm:hidden">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end space-x-0 sm:space-x-12 flex-shrink-0 sm:w-48 ml-0 sm:ml-4 pl-12 sm:pl-0">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.category}</span>
                                        <div className="flex items-center">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${!item.isRead ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {!item.isRead ? 'New' : 'Viewed'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer note */}
                    <div className="mt-6 text-xs font-medium text-gray-400 text-center">
                        Showing {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Notifications;