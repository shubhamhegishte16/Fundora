// src/BrowseNoLogin.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Heart,
  MapPin,
  Clock,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search, // added
  X,
} from "lucide-react";
import { getAllActiveCampaigns } from "../services/donorCampaignService.js";

const ITEMS_PER_PAGE = 6;

// ---------- Robust Indian number parser ----------
const parseIndianNumber = (value) => {
  if (value == null) return NaN;
  if (typeof value === "number") return value;
  let str = String(value).trim().toLowerCase();

  const multipliers = {
    k: 1_000,
    thousand: 1_000,
    lakh: 100_000,
    lac: 100_000,
    lakhs: 100_000,
    crore: 10_000_000,
    crores: 10_000_000,
  };

  for (const [word, mult] of Object.entries(multipliers)) {
    if (str.includes(word)) {
      const numPart = str.replace(word, "").replace(/[₹,\s]/g, "");
      const base = parseFloat(numPart);
      if (!isNaN(base)) return base * mult;
    }
  }

  const cleaned = str.replace(/[₹,\s]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? NaN : num;
};

const BrowseNoLogin = () => {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filters, setFilters] = useState({
    category: "All Categories",
    goal: "Goal Amount",
    location: "Location",
    sort: "Most Popular",
    timing: "Ending Soon",
  });
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // new

  const options = {
    category: [
      "All Categories",
      "Education",
      "Environment",
      "Health & Medical",
      "Animal Welfare",
      "Disaster Relief",
    ],
    goal: ["Goal Amount", "Under ₹5 Lakh", "₹5 Lakh - ₹10 Lakh", "Over ₹10 Lakh"],
    location: ["Location", "Mumbai", "Delhi", "Bangalore", "Pune", "Rural India"],
    sort: ["Most Popular", "Trending", "Newest First", "Highest Funded"],
    timing: ["Ending Soon", "Ending Today", "Ending this Week", "Ending this Month"],
  };

  const filterKeys = [
    { key: "category", icon: LayoutGrid, fill: false },
    { key: "goal", icon: Heart, fill: true },
    { key: "location", icon: MapPin, fill: false },
    { key: "sort", icon: Clock, fill: false },
    { key: "timing", icon: Calendar, fill: false },
  ];

  const requireLogin = (e) => {
    if (e) e.stopPropagation();
    setShowLoginModal(true);
  };
  const closeLoginModal = () => setShowLoginModal(false);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const res = await getAllActiveCampaigns();
        if (res.success && res.data) {
          setCampaigns(res.data);
        }
      } catch (err) {
        setError("Failed to load campaigns.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  // ---------- Smart filtering & sorting ----------
  const filteredCampaigns = useMemo(() => {
    let result = [...campaigns];

    // --- Category ---
    if (filters.category !== "All Categories") {
      result = result.filter((c) => c.category === filters.category);
    }

    // --- Goal ---
    if (filters.goal !== "Goal Amount") {
      result = result.filter((c) => {
        const goalNum = parseIndianNumber(c.goal);
        if (isNaN(goalNum)) return true;
        switch (filters.goal) {
          case "Under ₹5 Lakh":
            return goalNum < 500_000;
          case "₹5 Lakh - ₹10 Lakh":
            return goalNum >= 500_000 && goalNum <= 1_000_000;
          case "Over ₹10 Lakh":
            return goalNum > 1_000_000;
          default:
            return true;
        }
      });
    }

    // --- Location ---
    if (filters.location !== "Location") {
      result = result.filter((c) => c.location === filters.location);
    }

    // --- Timing ---
    if (filters.timing !== "Ending Soon") {
      result = result.filter((c) => {
        const days = Number(c.daysLeft);
        if (isNaN(days)) return true;
        switch (filters.timing) {
          case "Ending Today":
            return days === 0;
          case "Ending this Week":
            return days <= 7 && days >= 0;
          case "Ending this Month":
            return days <= 30 && days >= 0;
          default:
            return true;
        }
      });
    }

    // --- Search by title (new) ---
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((c) => c.title.toLowerCase().includes(query));
    }

    // --- Sort ---
    switch (filters.sort) {
      case "Most Popular":
      case "Trending":
        result.sort((a, b) => (b.progress || 0) - (a.progress || 0));
        break;
      case "Newest First":
        result.sort((a, b) => {
          const da = new Date(a.createdAt || 0);
          const db = new Date(b.createdAt || 0);
          return db - da;
        });
        break;
      case "Highest Funded":
        result.sort((a, b) => {
          const aRaised = parseIndianNumber(a.raised);
          const bRaised = parseIndianNumber(b.raised);
          if (isNaN(aRaised) || isNaN(bRaised)) return 0;
          return bRaised - aRaised;
        });
        break;
      default:
        break;
    }

    return result;
  }, [campaigns, filters, searchQuery]); // added searchQuery dependency

  // Reset page on filter or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE) || 1;
  const paginatedCampaigns = filteredCampaigns.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 text-gray-900">
      {/* Background decorative blobs (minimal) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-lg shadow-sm md:px-10 lg:px-16">
        <button
          onClick={() => navigate("/")}
          className="text-3xl font-black tracking-tight bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent"
        >
          ELPIS
        </button>
        <div className="flex items-center gap-4">
          <span
            onClick={() => navigate("/login")}
            className="hidden cursor-pointer text-base font-medium text-gray-700 hover:text-emerald-600 transition-all md:inline"
          >
            Login
          </span>
          <button
            onClick={() => navigate("/signup")}
            className="rounded-full bg-[#6FD06B] px-6 py-2.5 text-base font-semibold text-black transition-all hover:bg-[#5ab556] hover:shadow-lg hover:scale-105 active:scale-95"
          >
            Sign up
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-8 space-y-6 sm:space-y-8">
        {/* Header + Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 leading-tight tracking-tight">
              Explore Campaigns
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-2">
              Discover meaningful campaigns and support causes that create real impact.
            </p>
            {!loading && (
              <p className="text-xs text-emerald-700 font-semibold mt-1">
                Showing {filteredCampaigns.length} campaign
                {filteredCampaigns.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          {/* Search input */}
          <div className="relative w-full sm:w-72">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search campaigns…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-3">
          {filterKeys.map(({ key, icon: Icon, fill }) => (
            <div key={key} className="relative shrink-0">
              <button
                onClick={() => setActiveDropdown(activeDropdown === key ? null : key)}
                className="flex items-center gap-2 bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-sm rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap cursor-pointer transition-all active:scale-[0.98]"
              >
                <Icon
                  size={16}
                  className={`text-emerald-600 ${fill ? "fill-emerald-600" : ""}`}
                />
                <span>{filters[key]}</span>
                <ChevronDown size={14} className="text-gray-400 ml-1" />
              </button>
              {activeDropdown === key && (
                <div className="absolute left-0 mt-2 w-52 bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl shadow-xl shadow-emerald-500/5 py-2 z-50 animate-fadeIn">
                  {options[key].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setFilters((prev) => ({ ...prev, [key]: opt }));
                        setActiveDropdown(null);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                        filters[key] === opt
                          ? "text-emerald-700 bg-emerald-50/70"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Campaign grid */}
        {loading ? (
          <div className="flex justify-center items-center py-28">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
            </div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 font-semibold py-10 bg-red-50/50 rounded-2xl">
            {error}
          </div>
        ) : paginatedCampaigns.length === 0 ? (
          <div className="text-center text-gray-500 font-semibold py-10 bg-gray-50/50 rounded-2xl">
            No campaigns match your filters.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCampaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="bg-white border border-gray-100 rounded-3xl overflow-hidden hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col group cursor-pointer"
                  onClick={requireLogin}
                >
                  <div className="h-48 w-full overflow-hidden relative bg-gray-100">
                    <img
                      src={camp.image}
                      alt={camp.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-black text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors leading-snug">
                        {camp.title}
                      </h3>
                      <p className="text-xs font-semibold text-gray-500 mt-1">
                        by {camp.creator}
                      </p>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-2">
                        <span className="text-emerald-600">{camp.progress}% funded</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={13} className="text-gray-400" />
                          {camp.daysLeft} days left
                        </span>
                      </div>
                      <div className="w-full bg-emerald-50 h-2 rounded-full overflow-hidden mb-4">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500"
                          style={{ width: `${camp.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-5">
                      <div>
                        <span className="text-gray-900 font-black text-sm">
                          {typeof camp.raised === "number"
                            ? `₹${camp.raised.toLocaleString("en-IN")}`
                            : camp.raised}
                        </span>{" "}
                        raised
                      </div>
                      <div className="text-right">
                        <span className="text-gray-900 font-black text-sm">
                          {typeof camp.goal === "number"
                            ? `₹${camp.goal.toLocaleString("en-IN")}`
                            : camp.goal}
                        </span>{" "}
                        Goal
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={requireLogin}
                        className="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-black text-sm rounded-2xl transition-all cursor-pointer text-center active:scale-[0.98]"
                      >
                        View
                      </button>
                      <button
                        onClick={requireLogin}
                        className="flex-1 py-2.5 border border-emerald-300 hover:bg-emerald-50/30 text-emerald-700 font-black text-sm rounded-2xl transition-all cursor-pointer text-center bg-white active:scale-[0.98]"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1.5 pt-6">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-700 flex items-center justify-center cursor-pointer transition-all active:scale-95 disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold cursor-pointer select-none transition-all active:scale-95 ${
                      currentPage === page
                        ? "bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-md shadow-emerald-200"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-700 flex items-center justify-center cursor-pointer transition-all active:scale-95 disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeLoginModal}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl shadow-emerald-500/10 p-8 w-full max-w-sm text-center transform scale-100 animate-scaleIn">
            <button
              onClick={closeLoginModal}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
            >
              <X size={16} />
            </button>
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-400 flex items-center justify-center">
              <Heart size={28} className="text-white fill-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Login to Proceed</h2>
            <p className="text-sm text-gray-500 mt-2 mb-6">
              Please login or create an account to view campaign details and support the cause.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all active:scale-[0.98] shadow-md shadow-emerald-200"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="w-full py-3 rounded-2xl border border-emerald-300 hover:bg-emerald-50 text-emerald-700 font-bold text-sm transition-all active:scale-[0.98]"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.25s ease-out; }
      `}</style>
    </div>
  );
};

export default BrowseNoLogin;