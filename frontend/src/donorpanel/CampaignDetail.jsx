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
  Check,
  ChevronDown,
  ChevronUp,
  Receipt,
  Download,
  Printer,
  X,
  CheckCircle,
  Cross
} from "lucide-react";
import { toggleSaveCampaign } from "../../services/donorCampaignService.js";
import { processDonation, getAllDonations, getCampaignDonations, getDonationByTransactionId, getCampaignStats } from "../../services/MockDonationServices.js";

const CampaignDetail = ({ campaign, onBack, onDonationComplete }) => {
  const data = campaign;
  const donationRef = useRef(null);

  // Donation state
  const [showDonation, setShowDonation] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("Google Pay");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [receiveUpdates, setReceiveUpdates] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [campaignData, setCampaignData] = useState(data);
  const [user, setUser] = useState(null);

  // Safe fallback for numbers
  const safeNumber = (value, fallback = 0) => {
    return value !== undefined && value !== null ? value : fallback;
  };

  const refreshCampaignStats = async () => {
    try {
      const response = await getCampaignStats(data.id);
      if (response.success && response.stats) {
        setCampaignData(prev => ({
          ...prev,
          raised: response.stats.totalRaised || prev.raised || 0,
          donorCount: response.stats.totalDonors || prev.donorCount || 0,
          progress: response.stats.progress || prev.progress || 0
        }));
      }
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  useEffect(() => {
    // Get user from localStorage on component mount
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    refreshCampaignStats();
  }, [data.id]);

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

  const calculateDonation = () => {
    const amount = parseFloat(donationAmount) || 0;
    const tip = amount * 0.05;
    const total = amount + tip;
    return { amount, tip, total };
  };

  const { amount, tip, total } = calculateDonation();

  const paymentMethods = [
    { id: "Google Pay", icon: Smartphone, label: "Google Pay" },
    { id: "Bank Transfer", icon: Smartphone, label: "Bank Transfer" },
    { id: "Credit or Debit", icon: CreditCard, label: "Credit or Debit" },
    { id: "PhonePay", icon: Smartphone, label: "PhonePay" }
  ];

  const handleDonateClick = () => {
    setShowDonation(!showDonation);
    setTimeout(() => {
      if (donationRef.current) {
        donationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleSave = async () => {
    try {
      await toggleSaveCampaign(data.id);
      alert("Campaign saved status updated!");
    } catch (err) {
      console.error("Failed to save campaign", err);
      alert("Failed to update save status.");
    }
  };

  const handlePay = async () => {
    if (total === 0) {
      alert("Amount must be more than 0");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get donor name from user
      let donorName = "Anonymous";
      if (!isAnonymous && user) {
        donorName = user.name || user.displayName || user.fullName || "User";
      }

      const donationData = {
        campaignId: data.id,
        donorName: donorName,
        donorEmail: user?.email || "user@example.com",
        amount: amount,
        tip: tip,
        paymentMethod: selectedPayment,
        isAnonymous: isAnonymous,
        receiveUpdates: receiveUpdates
      };

      // console.log('Sending donation:', donationData);

      const response = await processDonation(donationData);

      // console.log('Full response:', response);
      // console.log('Receipt data:', response.receipt);

      if (response.success) {
        // Update local campaign data immediately
        setCampaignData(prev => {
          const newRaised = (prev.raised || 0) + amount;
          const newDonorCount = (prev.donorCount || 0) + 1;
          const newProgress = Math.min(Math.round((newRaised / prev.goal) * 100), 100);
          
          return {
            ...prev,
            raised: newRaised,
            donorCount: newDonorCount,
            progress: newProgress
          };
        });

        // Refresh stats from server
        await refreshCampaignStats();

        // Notify parent to refresh the campaign list
        if (onDonationComplete) {
          onDonationComplete();
        }

        // Set receipt data
        setReceiptData(response.receipt);
        setShowReceipt(true);
        setShowDonation(false);
        setDonationAmount("");
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setReceiptData(null);
    setDonationAmount("");
  };

  const handleDownloadReceipt = () => {
    window.print();
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const displayData = campaignData;

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return "User";
    return user.name || user.displayName || user.fullName || "User";
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "U";
    const name = user.name || user.displayName || user.fullName || "User";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-brand-secondary hover:text-brand-text transition-colors mb-4 font-semibold text-sm"
      >
        <ArrowLeft size={18} />
        Back to Campaigns
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium animate-shake">
          <Cross />{error}
        </div>
      )}

      <div className="bg-white border border-brand-border/60 rounded-3xl overflow-hidden">
        <div className="relative h-64 w-full overflow-hidden">
          <img
            src={displayData.image}
            alt={displayData.title}
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

        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-black text-brand-text leading-tight">
                {displayData.title || "Campaign Title"}
              </h2>
              <p className="text-sm text-brand-secondary font-medium mt-1">
                By {displayData.creator || "Unknown Creator"}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-primary-green font-black text-base">
                {displayData.creatorInitials || "?"}
              </div>
              <div>
                <p className="text-sm font-bold text-brand-text">{displayData.creator || "Unknown"}</p>
                <p className="text-xs text-brand-secondary font-medium flex items-center gap-1">
                  <MapPin size={12} />
                  {displayData.creatorLocation || "Location"}
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-brand-secondary leading-relaxed mb-6 max-w-3xl">
            {displayData.description || "No description available."}
          </p>

          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-slate-50/80 rounded-xl p-3 text-center transition-all hover:scale-105">
              <p className="text-lg font-black text-brand-text">{formatCurrency(displayData.raised)}</p>
              <p className="text-xs font-semibold text-brand-secondary">raised</p>
            </div>
            <div className="bg-slate-50/80 rounded-xl p-3 text-center transition-all hover:scale-105">
              <p className="text-lg font-black text-brand-text">{formatCurrency(displayData.goal)}</p>
              <p className="text-xs font-semibold text-brand-secondary">goal</p>
            </div>
            <div className="bg-slate-50/80 rounded-xl p-3 text-center transition-all hover:scale-105">
              <p className="text-lg font-black text-brand-text">{safeNumber(displayData.progress, 0)}%</p>
              <p className="text-xs font-semibold text-brand-secondary">funded</p>
            </div>
            <div className="bg-slate-50/80 rounded-xl p-3 text-center transition-all hover:scale-105">
              <p className="text-lg font-black text-brand-text flex items-center justify-center gap-0.5">
                {safeNumber(displayData.daysLeft, 0)}
                <span className="text-xs font-bold text-brand-secondary">d</span>
              </p>
              <p className="text-xs font-semibold text-brand-secondary">left</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="w-full bg-[#E1FDEC]/40 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-green rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${Math.min(safeNumber(displayData.progress, 0), 100)}%`,
                  transition: 'width 1s cubic-bezier(0.22, 1, 0.36, 1)'
                }}
              />
            </div>
            <div className="flex justify-between text-xs font-semibold text-brand-secondary mt-1.5">
              <span className="text-primary-green">{safeNumber(displayData.progress, 0)}% funded</span>
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                {safeNumber(displayData.daysLeft, 0)} days left
              </span>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={handleDonateClick}
              className="flex-1 py-3 bg-primary-green hover:bg-emerald-700 text-white font-black text-sm rounded-2xl transition-all cursor-pointer text-center active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
            >
              {showDonation ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              {showDonation ? "Close Donation" : "Donate"}
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 border border-[#059669] hover:bg-emerald-50/20 text-[#059669] font-black text-sm rounded-2xl transition-all cursor-pointer text-center bg-white active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Bookmark size={16} />
              Save
            </button>
          </div>

          <div className="border-t border-brand-border/40 pt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-primary-green font-black text-sm">
                  {displayData.creatorInitials || "?"}
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-text">{displayData.creator || "Unknown"}</p>
                  <p className="text-xs text-brand-secondary font-medium flex items-center gap-1">
                    <MapPin size={12} />
                    {displayData.creatorLocation || "Location"}
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
                  {safeNumber(displayData.donorCount, 0).toLocaleString()} donors
                </span>
                <span className="font-semibold text-brand-secondary flex items-center gap-1.5">
                  <Heart size={16} className="text-primary-green fill-primary-green" />
                  {safeNumber(displayData.followers, 0).toLocaleString()} followers
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDonation && (
        <div
          ref={donationRef}
          className="mt-6 bg-white border border-brand-border/60 rounded-3xl p-6 animate-fadeIn"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-primary-green font-black text-sm">
              {isAnonymous ? 'A' : getUserInitials()}
            </div>
            <div>
              <p className="text-sm font-bold text-brand-text">
                {isAnonymous ? 'Anonymous' : getUserDisplayName()}
              </p>
              <p className="text-xs text-brand-secondary font-medium">Donor</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl font-black text-primary-green">{displayData.progress}%</span>
            <h3 className="text-lg font-black text-brand-text">{displayData.title}</h3>
          </div>
          <p className="text-sm text-brand-secondary mb-4">
            Still ${(displayData.goal - displayData.raised).toLocaleString()} to go. Help us build momentum.
          </p>

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
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-sm font-semibold ${isSelected
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
                Show My name on receipt as well as on donors list.
              </span>
            </label>
          </div>

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

          <button
            onClick={handlePay}
            disabled={total === 0 || loading}
            className={`w-full py-3.5 font-black text-sm rounded-2xl transition-all cursor-pointer text-center ${total === 0 || loading
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-primary-green hover:bg-emerald-700 text-white active:scale-[0.98] shadow-sm"
            }`}
          >
            {loading ? 'Processing...' : `Pay ($${total.toFixed(1)})`}
          </button>
        </div>
      )}

      {showReceipt && receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-brand-border/40 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt size={20} className="text-primary-green" />
                <h3 className="text-lg font-black text-brand-text">Donation Receipt</h3>
              </div>
              <button
                onClick={handleCloseReceipt}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle size={32} className="text-primary-green" />
                </div>
              </div>

              <p className="text-center text-sm font-semibold text-primary-green mb-6">
                Payment Successful!
              </p>

              <div className="space-y-4">
                <div className="flex justify-between text-sm border-b border-brand-border/40 pb-2">
                  <span className="text-brand-secondary">Receipt ID</span>
                  <span className="font-bold text-brand-text">{receiptData.receiptId || 'N/A'}</span>
                </div>

                <div className="flex justify-between text-sm border-b border-brand-border/40 pb-2">
                  <span className="text-brand-secondary">Date</span>
                  <span className="font-bold text-brand-text">{receiptData.date || new Date().toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm border-b border-brand-border/40 pb-2">
                  <span className="text-brand-secondary">Transaction ID</span>
                  <span className="font-bold text-brand-text text-xs">{receiptData.transactionId || 'N/A'}</span>
                </div>

                <div className="flex justify-between text-sm border-b border-brand-border/40 pb-2">
                  <span className="text-brand-secondary">Campaign</span>
                  <span className="font-bold text-brand-text text-right max-w-[60%]">
                    {receiptData.campaign?.title || 'Unknown Campaign'}
                  </span>
                </div>

                <div className="flex justify-between text-sm border-b border-brand-border/40 pb-2">
                  <span className="text-brand-secondary">Creator</span>
                  <span className="font-bold text-brand-text">
                    {receiptData.campaign?.creator || 'Unknown Creator'}
                  </span>
                </div>

                <div className="flex justify-between text-sm border-b border-brand-border/40 pb-2">
                  <span className="text-brand-secondary">Donor</span>
                  <span className="font-bold text-brand-text">
                    {receiptData.isAnonymous ? 'Anonymous Donor' : (receiptData.donor || getUserDisplayName())}
                  </span>
                </div>

                <div className="flex justify-between text-sm border-b border-brand-border/40 pb-2">
                  <span className="text-brand-secondary">Email</span>
                  <span className="font-bold text-brand-text text-xs">{receiptData.donorEmail || user?.email || 'N/A'}</span>
                </div>

                <div className="flex justify-between text-sm border-b border-brand-border/40 pb-2">
                  <span className="text-brand-secondary">Payment Method</span>
                  <span className="font-bold text-brand-text">{receiptData.paymentMethod || 'Google Pay'}</span>
                </div>

                <div className="flex justify-between text-sm border-b border-brand-border/40 pb-2">
                  <span className="text-brand-secondary">Anonymous</span>
                  <span className="font-bold text-brand-text">{receiptData.isAnonymous ? 'Yes' : 'No'}</span>
                </div>

                <div className="bg-emerald-50/50 rounded-xl p-4 mt-2 border border-emerald-100">
                  <p className="text-xs font-bold text-brand-text mb-2">Amount Breakdown</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-secondary">Donation Amount</span>
                      <span className="font-bold text-brand-text">
                        ${(receiptData.donation?.amount || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-secondary">Elpis Tip</span>
                      <span className="font-bold text-brand-text">
                        ${(receiptData.donation?.tip || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-1.5 border-t border-emerald-200">
                      <span className="font-bold text-brand-text">Total</span>
                      <span className="font-bold text-brand-text text-primary-green text-lg">
                        ${(receiptData.donation?.total || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={handleDownloadReceipt}
                  className="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-primary-green font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Download
                </button>
                <button
                  onClick={handlePrintReceipt}
                  className="flex-1 py-2.5 border border-brand-border/60 hover:border-brand-border text-brand-text font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Printer size={16} />
                  Print
                </button>
              </div>

              <button
                onClick={() => {
                  handleCloseReceipt();
                }}
                className="w-full mt-2 py-2.5 bg-primary-green hover:bg-emerald-700 text-white font-black text-sm rounded-xl transition-all"
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

export default CampaignDetail;