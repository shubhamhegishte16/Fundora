import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Heart,
  Share2,
  MessageCircle,
  MapPin,
  Calendar,
  Users,
  Bookmark,
  CreditCard,
  Smartphone,
  Building,
  Check,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const CampaignDetail = ({ campaign, onBack }) => {
  const data = campaign;
  const donationRef = useRef(null);

  // Donation state
  const [showDonation, setShowDonation] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("Google Pay");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [receiveUpdates, setReceiveUpdates] = useState(true);

  // Safe fallback for numbers
  const safeNumber = (value, fallback = 0) => {
    return value !== undefined && value !== null ? value : fallback;
  };

  const formatCurrency = (amount) => {
    const safeAmount = safeNumber(amount, 0);
    if (safeAmount >= 100000) {
      return `₹${(safeAmount / 100000).toFixed(1)}L`;
    }
    if (safeAmount >= 1000) {
      return `₹${(safeAmount / 1000).toFixed(1)}K`;
    }
    return `₹${safeAmount.toLocaleString()}`;
  };

  const formatUSD = (amount) => {
    if (amount >= 100000) {
      return `$${(amount / 100000).toFixed(1)}k`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const calculateDonation = () => {
    const amount = parseFloat(donationAmount) || 0;
    const tip = amount * 0.05;
    const total = amount + tip;
    return { amount, tip, total };
  };

  const { amount, tip, total } = calculateDonation();

  const paymentMethods = [
    { id: "Google Pay", icon: Smartphone, label: "Google Pay" },
    { id: "G Pay", icon: Smartphone, label: "G Pay" },
    { id: "Credit or Debit", icon: CreditCard, label: "Credit or Debit" },
    { id: "PhonePay", icon: Smartphone, label: "PhonePay" }
  ];

  const handleDonateClick = () => {
    setShowDonation(!showDonation);
    // Scroll to donation section after a small delay
    setTimeout(() => {
      if (donationRef.current) {
        donationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handlePay = () => {
    if (total === 0) return;
    alert(`Processing payment of $${total.toFixed(2)}`);
  };

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-brand-secondary hover:text-brand-text transition-colors mb-4 font-semibold text-sm"
      >
        <ArrowLeft size={18} />
        Back to Campaigns
      </button>

      <div className="bg-white border border-brand-border/60 rounded-3xl overflow-hidden">
        {/* Campaign Image */}
        <div className="relative h-64 w-full overflow-hidden">
          <img
            src={data.image}
            alt={data.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <button className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full hover:bg-white transition-all shadow-md">
              <Heart size={20} className="text-brand-secondary hover:text-red-500 transition-colors" />
            </button>
            <button className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full hover:bg-white transition-all shadow-md">
              <Share2 size={20} className="text-brand-secondary" />
            </button>
          </div>
        </div>

        {/* Campaign Content */}
        <div className="p-6">
          {/* Title & Creator Section */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-black text-brand-text leading-tight">
                {data.title || "Campaign Title"}
              </h2>
              <p className="text-sm text-brand-secondary font-medium mt-1">
                By {data.creator || "Unknown Creator"}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-primary-green font-black text-base">
                {data.creatorInitials || "?"}
              </div>
              <div>
                <p className="text-sm font-bold text-brand-text">{data.creator || "Unknown"}</p>
                <p className="text-xs text-brand-secondary font-medium flex items-center gap-1">
                  <MapPin size={12} />
                  {data.creatorLocation || "Location"}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-brand-secondary leading-relaxed mb-6 max-w-3xl">
            {data.description || "No description available."}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-slate-50/80 rounded-xl p-3 text-center">
              <p className="text-lg font-black text-brand-text">{formatCurrency(data.raised)}</p>
              <p className="text-xs font-semibold text-brand-secondary">raised</p>
            </div>
            <div className="bg-slate-50/80 rounded-xl p-3 text-center">
              <p className="text-lg font-black text-brand-text">{formatCurrency(data.goal)}</p>
              <p className="text-xs font-semibold text-brand-secondary">goal</p>
            </div>
            <div className="bg-slate-50/80 rounded-xl p-3 text-center">
              <p className="text-lg font-black text-brand-text">{safeNumber(data.progress, 0)}%</p>
              <p className="text-xs font-semibold text-brand-secondary">funded</p>
            </div>
            <div className="bg-slate-50/80 rounded-xl p-3 text-center">
              <p className="text-lg font-black text-brand-text flex items-center justify-center gap-0.5">
                {safeNumber(data.daysLeft, 0)}
                <span className="text-xs font-bold text-brand-secondary">d</span>
              </p>
              <p className="text-xs font-semibold text-brand-secondary">left</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-[#E1FDEC]/40 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-green rounded-full transition-all duration-500"
                style={{ width: `${Math.min(safeNumber(data.progress, 0), 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-semibold text-brand-secondary mt-1.5">
              <span className="text-primary-green">{safeNumber(data.progress, 0)}% funded</span>
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                {safeNumber(data.daysLeft, 0)} days left
              </span>
            </div>
          </div>

          {/* Action Buttons - Donate and Save */}
          <div className="flex gap-3 mb-6">
            <button 
              onClick={handleDonateClick}
              className="flex-1 py-3 bg-primary-green hover:bg-emerald-700 text-white font-black text-sm rounded-2xl transition-all cursor-pointer text-center active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
            >
              {showDonation ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              {showDonation ? "Close Donation" : "Donate"}
            </button>
            <button className="flex-1 py-3 border border-[#059669] hover:bg-emerald-50/20 text-[#059669] font-black text-sm rounded-2xl transition-all cursor-pointer text-center bg-white active:scale-[0.98] flex items-center justify-center gap-2">
              <Bookmark size={16} />
              Save
            </button>
          </div>

          {/* Creator Section */}
          <div className="border-t border-brand-border/40 pt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-primary-green font-black text-sm">
                  {data.creatorInitials || "?"}
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-text">{data.creator || "Unknown"}</p>
                  <p className="text-xs text-brand-secondary font-medium flex items-center gap-1">
                    <MapPin size={12} />
                    {data.creatorLocation || "Location"}
                  </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-primary-green font-bold text-sm rounded-xl transition-all ml-2">
                  <MessageCircle size={16} />
                  Message
                </button>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <span className="font-semibold text-brand-secondary flex items-center gap-1.5">
                  <Users size={16} className="text-primary-green" />
                  {safeNumber(data.donorCount, 0).toLocaleString()} donors
                </span>
                <span className="font-semibold text-brand-secondary flex items-center gap-1.5">
                  <Heart size={16} className="text-primary-green fill-primary-green" />
                  {safeNumber(data.followers, 0).toLocaleString()} followers
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Process - Extends below when clicked */}
      {showDonation && (
        <div 
          ref={donationRef}
          className="mt-6 bg-white border border-brand-border/60 rounded-3xl p-6 animate-fadeIn"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-primary-green font-black text-sm">
              AS
            </div>
            <div>
              <p className="text-sm font-bold text-brand-text">Arjun Sharma</p>
              <p className="text-xs text-brand-secondary font-medium">Donor</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl font-black text-primary-green">{data.progress}%</span>
            <h3 className="text-lg font-black text-brand-text">{data.title}</h3>
          </div>
          <p className="text-sm text-brand-secondary mb-4">
            Still ${(data.goal - data.raised).toLocaleString()} to go. Help us build momentum.
          </p>

          {/* Donation Input */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-brand-text mb-2">
              Enter your Donation:
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-brand-secondary">
                $
              </span>
              <input
                type="number"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                placeholder=".00"
                className="w-full pl-8 pr-4 py-3 text-2xl font-bold border border-brand-border/60 rounded-2xl focus:outline-none focus:border-primary-green transition-colors"
              />
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-brand-text mb-3">
              Payment Method:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedPayment === method.id;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-sm font-semibold ${
                      isSelected 
                        ? "border-primary-green bg-emerald-50/50 text-primary-green" 
                        : "border-brand-border/60 text-brand-secondary hover:border-brand-border"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{method.label}</span>
                    {isSelected && <Check size={14} className="ml-auto text-primary-green" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 mb-6">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-brand-border/60 text-primary-green focus:ring-primary-green focus:ring-offset-2 cursor-pointer"
              />
              <span className="text-xs text-brand-secondary leading-relaxed">
                Don't display my name or profile publicly on the fundraiser.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={receiveUpdates}
                onChange={(e) => setReceiveUpdates(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-brand-border/60 text-primary-green focus:ring-primary-green focus:ring-offset-2 cursor-pointer"
              />
              <span className="text-xs text-brand-secondary leading-relaxed">
                Get occasional marketing updates from GoFundMe. You may unsubscribe at any time.
              </span>
            </label>
          </div>

          {/* Donation Summary */}
          <div className="bg-slate-50/80 rounded-2xl p-4 mb-6">
            <h4 className="text-sm font-bold text-brand-text mb-3">Your Donation:</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-brand-secondary">Your Donation:</span>
                <span className="font-bold text-brand-text">$ {amount.toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brand-secondary">Elpis tip:</span>
                <span className="font-bold text-brand-text">$ {tip.toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-brand-border/40">
                <span className="font-bold text-brand-text">Total donation:</span>
                <span className="font-bold text-brand-text text-primary-green">${total.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Pay Button */}
          <button 
            onClick={handlePay}
            disabled={total === 0}
            className={`w-full py-3.5 font-black text-sm rounded-2xl transition-all cursor-pointer text-center ${
              total === 0 
                ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                : "bg-primary-green hover:bg-emerald-700 text-white active:scale-[0.98] shadow-sm"
            }`}
          >
            Pay (${total.toFixed(1)})
          </button>
        </div>
      )}
    </div>
  );
};

export default CampaignDetail;