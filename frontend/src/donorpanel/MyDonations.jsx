import React, { useState, useEffect } from "react";
import { LayoutGrid, CheckCircle, Clock, Calendar, Download, ChevronLeft, ChevronRight, Loader, Receipt, X, Printer } from "lucide-react";
import { getDonorMyDonations } from "../../services/donorDashboardService";

const TABS = [
  { label: "All Saved",   icon: LayoutGrid,   filter: null },
  { label: "Completed",  icon: CheckCircle,  filter: "Completed" },
  { label: "In Progress",icon: Clock,        filter: "In Progress" },
  { label: "Upcoming",   icon: Calendar,     filter: "Upcoming" },
];

const STATUS_STYLE = {
  "Completed":  "bg-emerald-100 text-emerald-700",
  "In Progress":"bg-blue-100 text-blue-700",
  "Upcoming":   "bg-amber-100 text-amber-700",
};

const PER_PAGE = 5;

export default function MyDonations() {
  const [tab, setTab]   = useState(0);
  const [page, setPage] = useState(1);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await getDonorMyDonations();
        if (res.success) {
          setDonations(res.data || []);
        }
      } catch (err) {
        console.error("Failed to load donations", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  const filtered   = TABS[tab].filter ? donations.filter(d => d.status === TABS[tab].filter) : donations;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const rows       = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const switchTab = (i) => { setTab(i); setPage(1); };

  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const handleViewReceipt = (donation) => {
    setReceiptData(donation);
    setShowReceipt(true);
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setReceiptData(null);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900">My Donations</h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">Track all your contributions and download receipts.</p>
      </div>

      {/* Card */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden p-6">

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(({ label, icon: Icon }, i) => {
            const isActive = tab === i;
            const count = (TABS[i].filter ? donations.filter(d => d.status === TABS[i].filter) : donations).length;
            return (
            <button
              key={label}
              onClick={() => switchTab(i)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition-all border ${
                isActive
                  ? "bg-white border-gray-300 text-gray-900 shadow-sm"
                  : "bg-white border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300"
              }`}
            >
              <Icon size={16} className={isActive ? "text-emerald-500" : "text-gray-400"} />
              {label}
              <span className={`ml-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                isActive ? "bg-emerald-500 text-white" : "border border-gray-200 text-gray-400"
              }`}>{count}</span>
            </button>
            )
          })}
        </div>

        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 pb-4 text-xs font-bold text-gray-900 border-b border-gray-200">
          {["Campaign","Amount","Status","Date","Receipt"].map(h => <span key={h}>{h}</span>)}
        </div>

        {/* Rows */}
        {loading ? (
          <div className="py-16 text-center text-gray-400">
             <Loader size={36} className="mx-auto mb-3 animate-spin text-gray-300" />
             <p className="text-sm font-semibold">Loading donations...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 mt-2">
            {rows.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <CheckCircle size={36} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-semibold">No donations in this category</p>
              </div>
            ) : rows.map(d => (
              <div key={d.id} className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 items-center py-4 hover:bg-gray-50/60 transition-colors rounded-xl px-2 -mx-2">
                {/* Campaign */}
                <div className="flex items-center gap-3 min-w-0">
                  <img src={d.image} alt={d.title} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-100" />
                  <div className="min-w-0">
                    <p className="text-sm font-black text-gray-900 truncate">{d.title}</p>
                    <p className="text-xs text-gray-500 font-medium">by {d.creator}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-800">{d.amount}</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full w-fit ${STATUS_STYLE[d.status] || "bg-gray-100 text-gray-700"}`}>{d.status}</span>
                <span className="text-xs text-gray-500 font-bold">{d.date}</span>
                {/* Download */}
                <button 
                  onClick={() => handleViewReceipt(d)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-all cursor-pointer w-fit"
                >
                  <Receipt size={14} /> View Receipt
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-1.5 pt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center justify-center cursor-pointer transition-all active:scale-95">
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-semibold cursor-pointer transition-all active:scale-95 ${page === p ? "bg-[#10B981] text-white shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>{p}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center justify-center cursor-pointer transition-all active:scale-95">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {showReceipt && receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt size={20} className="text-[#10B981]" />
                <h3 className="text-lg font-black text-gray-900">Donation Receipt</h3>
              </div>
              <button onClick={handleCloseReceipt} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle size={32} className="text-[#10B981]" />
                </div>
              </div>

              <p className="text-center text-sm font-semibold text-[#10B981] mb-6">Payment Successful! 🎉</p>

              <div className="space-y-4">
                <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Receipt ID</span>
                  <span className="font-bold text-gray-900">{receiptData.receiptId}</span>
                </div>
                <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Date</span>
                  <span className="font-bold text-gray-900">{receiptData.date}</span>
                </div>
                <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="font-bold text-gray-900 text-xs">{receiptData.transactionId}</span>
                </div>
                <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Campaign</span>
                  <span className="font-bold text-gray-900 text-right max-w-[60%]">{receiptData.title}</span>
                </div>
                <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Creator</span>
                  <span className="font-bold text-gray-900">{receiptData.creator}</span>
                </div>
                <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Donor</span>
                  <span className="font-bold text-gray-900">
                    {receiptData.isAnonymous ? 'Anonymous Donor' : 'You'}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Email</span>
                  <span className="font-bold text-gray-900 text-xs">{receiptData.donorEmail}</span>
                </div>
                <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Payment Method</span>
                  <span className="font-bold text-gray-900">{receiptData.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Anonymous</span>
                  <span className="font-bold text-gray-900">{receiptData.isAnonymous ? 'Yes' : 'No'}</span>
                </div>

                <div className="bg-emerald-50/50 rounded-xl p-4 mt-2 border border-emerald-100">
                  <p className="text-xs font-bold text-gray-900 mb-2">Amount Breakdown</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Donation Amount</span>
                      <span className="font-bold text-gray-900">₹{(receiptData.rawAmount || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Elpis Tip</span>
                      <span className="font-bold text-gray-900">₹{(receiptData.rawTip || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-1.5 border-t border-emerald-200">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-[#10B981] text-lg">₹{(receiptData.rawTotal || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={handlePrintReceipt}
                  className="flex-1 py-2.5 border border-gray-200 hover:border-gray-300 text-gray-900 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer size={16} />
                  Print / Save as PDF
                </button>
              </div>

              <button
                onClick={handleCloseReceipt}
                className="w-full mt-2 py-2.5 bg-[#10B981] hover:bg-emerald-700 text-white font-black text-sm rounded-xl transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

