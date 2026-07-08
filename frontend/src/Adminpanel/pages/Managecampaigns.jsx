import React, { useState, useEffect, useCallback } from "react";
import { Search, CheckCircle, XCircle, Eye, MoreHorizontal, Clock, Megaphone, Trash2, X, ImageOff, Calendar, Target, Users, Mail } from "lucide-react";
import adminAxios from "../utils/adminAxios";

// Uploaded cover images come back as relative paths like /uploads/campaigns/xxx.jpg
// (served by the backend's static /uploads mount) — resolve those against the
// API origin; leave already-absolute URLs (e.g. Cloudinary) untouched.
const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
function resolveImageUrl(url) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${API_ORIGIN}${url}`;
}

const categoryColors = {
  Education: "bg-blue-50 text-blue-600",
  Environment: "bg-emerald-50 text-emerald-600",
  Health: "bg-rose-50 text-rose-600",
  "Disaster Relief": "bg-orange-50 text-orange-600",
  "Animal Welfare": "bg-purple-50 text-purple-600",
  Community: "bg-cyan-50 text-cyan-600",
};

const statusColors = {
  active: "bg-emerald-50 text-emerald-600",
  pending_review: "bg-amber-50 text-amber-600",
  draft: "bg-gray-100 text-gray-500",
  completed: "bg-blue-50 text-blue-600",
};

const statusLabels = {
  active: "Active",
  pending_review: "Pending",
  draft: "Draft",
  completed: "Completed",
};

const FILTERS = ["All", "active", "pending_review", "draft", "completed"];
const filterLabels = { All: "All", active: "Active", pending_review: "Pending", draft: "Draft", completed: "Completed" };

// RejectModal collects the required reason before calling the reject endpoint.
function RejectModal({ campaign, onClose, onConfirm, submitting }) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-5">
        <h3 className="font-semibold text-gray-800 text-[15px]">Reject "{campaign.title}"</h3>
        <p className="text-[12px] text-gray-400 mt-1 mb-3">
          This sends the campaign back to the creator as a draft with your reason attached so they can fix and resubmit.
        </p>
        <textarea
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain what needs to change..."
          rows={4}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-100 resize-none"
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2 rounded-xl text-[13px] font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={submitting || !reason.trim()}
            className="flex-1 py-2 rounded-xl text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Rejecting…" : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

// DeleteModal confirms permanent removal before calling the delete endpoint.
function DeleteModal({ campaign, onClose, onConfirm, submitting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-5">
        <h3 className="font-semibold text-gray-800 text-[15px]">Delete "{campaign.title}"?</h3>
        <p className="text-[12px] text-gray-400 mt-1 mb-4">
          This permanently removes the campaign, regardless of its current status. This action cannot be undone.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2 rounded-xl text-[13px] font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 py-2 rounded-xl text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Deleting…" : "Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ViewModal shows the full campaign — cover image, description, funding progress,
// and creator info — pulled straight from the same record backing the card.
function ViewModal({ campaign, onClose }) {
  const [imgFailed, setImgFailed] = useState(false);
  const goal = campaign.goalAmount || 0;
  const raised = campaign.raisedAmount || 0;
  const pct = goal ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  const imgSrc = resolveImageUrl(campaign.coverImageUrl);
  const creatorName = campaign.creator?.name || "Unknown creator";
  const creatorEmail = campaign.creator?.email || "—";

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover image */}
        <div className="relative h-48 w-full bg-gray-100 flex-shrink-0">
          {imgSrc && !imgFailed ? (
            <img
              src={imgSrc}
              alt={campaign.title}
              className="h-full w-full object-cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center text-gray-300">
              <ImageOff className="w-8 h-8 mb-1" />
              <span className="text-[12px]">No cover image</span>
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <span className={`absolute top-3 left-3 text-[11px] font-medium px-2.5 py-1 rounded-full ${statusColors[campaign.status]}`}>
            {statusLabels[campaign.status]}
          </span>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto">
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${categoryColors[campaign.category] || "bg-gray-50 text-gray-500"}`}>
            {campaign.category}
          </span>
          <h2 className="font-bold text-gray-800 text-lg mt-2 leading-snug">{campaign.title}</h2>

          <p className="text-[13px] text-gray-500 mt-2 leading-relaxed whitespace-pre-line">
            {campaign.description || "No description provided."}
          </p>

          {campaign.status === "draft" && campaign.rejectionReason && (
            <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5">
              <p className="text-[11px] font-semibold text-red-600 mb-0.5">Rejection reason</p>
              <p className="text-[12px] text-red-500">{campaign.rejectionReason}</p>
            </div>
          )}

          {/* Funding progress */}
          <div className="mt-4">
            <div className="flex justify-between text-[13px] mb-1.5">
              <span className="font-semibold text-[#2D6A4F]">₹{raised.toLocaleString("en-IN")} raised</span>
              <span className="text-gray-400">{pct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${pct >= 70 ? "bg-[#52B788]" : pct >= 40 ? "bg-amber-400" : "bg-gray-300"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">of ₹{goal.toLocaleString("en-IN")} goal</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3.5 py-2.5">
              <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-gray-700">{campaign.donorCount || 0}</p>
                <p className="text-[11px] text-gray-400">Donors</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3.5 py-2.5">
              <Target className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-gray-700">₹{goal.toLocaleString("en-IN")}</p>
                <p className="text-[11px] text-gray-400">Goal</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3.5 py-2.5">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-gray-700">{formatDate(campaign.startDate)}</p>
                <p className="text-[11px] text-gray-400">Start date</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3.5 py-2.5">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-gray-700">{formatDate(campaign.endDate)}</p>
                <p className="text-[11px] text-gray-400">End date</p>
              </div>
            </div>
          </div>

          {/* Creator */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#52B788] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {creatorName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-gray-700 truncate">{creatorName}</p>
              <p className="text-[11px] text-gray-400 flex items-center gap-1 truncate">
                <Mail className="w-3 h-3 flex-shrink-0" /> {creatorEmail}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManageCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [actionMenu, setActionMenu] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null); // campaign being rejected
  const [deleteTarget, setDeleteTarget] = useState(null); // campaign being deleted
  const [viewTarget, setViewTarget] = useState(null); // campaign being viewed in detail
  const [actioningId, setActioningId] = useState(null); // campaign currently being approved/rejected/deleted

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await adminAxios.get("/campaigns");
      setCampaigns(data.campaigns || []);
    } catch (err) {
      setError("Could not load campaigns. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleApprove = async (campaign) => {
    setActioningId(campaign._id);
    try {
      await adminAxios.patch(`/campaigns/${campaign._id}/approve`);
      setCampaigns((prev) => prev.filter((c) => c._id !== campaign._id));
    } catch (err) {
      setError("Could not approve this campaign. Please try again.");
    } finally {
      setActioningId(null);
      setActionMenu(null);
    }
  };

  const handleReject = async (reason) => {
    if (!rejectTarget) return;
    setActioningId(rejectTarget._id);
    try {
      await adminAxios.patch(`/campaigns/${rejectTarget._id}/reject`, { reason });
      setCampaigns((prev) => prev.filter((c) => c._id !== rejectTarget._id));
      setRejectTarget(null);
    } catch (err) {
      setError("Could not reject this campaign. Please try again.");
    } finally {
      setActioningId(null);
      setActionMenu(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActioningId(deleteTarget._id);
    try {
      await adminAxios.delete(`/campaigns/${deleteTarget._id}`);
      setCampaigns((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      setError("Could not delete this campaign. Please try again.");
    } finally {
      setActioningId(null);
      setActionMenu(null);
    }
  };

  const filtered = campaigns.filter((c) => {
    const creatorName = c.creator?.name || "";
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) || creatorName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pending = campaigns.filter((c) => c.status === "pending_review").length;

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Campaigns</h1>
          <p className="text-gray-400 text-sm mt-0.5">{campaigns.length} campaign{campaigns.length === 1 ? "" : "s"} total</p>
        </div>
        {pending > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-700 px-4 py-2 rounded-xl text-sm">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{pending} awaiting review</span>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-100 shadow-sm"
          />
        </div>
        <div className="flex gap-2 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
          {FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                statusFilter === s ? "bg-[#2D6A4F] text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {filterLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400">Loading campaigns…</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400">
          <Megaphone className="w-6 h-6 mx-auto mb-2 text-gray-300" />
          No campaigns to show here.
        </div>
      ) : (
        /* Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const goal = c.goalAmount || 0;
            const raised = c.raisedAmount || 0;
            const pct = goal ? Math.round((raised / goal) * 100) : 0;
            const creatorName = c.creator?.name || "Unknown creator";
            const isBusy = actioningId === c._id;
            const thumbSrc = resolveImageUrl(c.coverImageUrl);

            return (
              <div
                key={c._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div
                  className={`h-1.5 w-full ${
                    c.status === "active"
                      ? "bg-gradient-to-r from-[#2D6A4F] to-[#52B788]"
                      : c.status === "pending_review"
                      ? "bg-amber-300"
                      : "bg-gray-200"
                  }`}
                />

                {/* Cover image */}
                <button
                  onClick={() => setViewTarget(c)}
                  className="block h-32 w-full bg-gray-100 overflow-hidden group relative"
                >
                  {thumbSrc ? (
                    <img
                      src={thumbSrc}
                      alt={c.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }}
                    />
                  ) : null}
                  <div className={`h-full w-full ${thumbSrc ? "hidden" : "flex"} flex-col items-center justify-center text-gray-300`}>
                    <ImageOff className="w-6 h-6 mb-1" />
                    <span className="text-[11px]">No image</span>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-[12px] font-medium flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> View details
                    </span>
                  </div>
                </button>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-start gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-[14px] leading-snug">{c.title}</h3>
                        <p className="text-[12px] text-gray-400 mt-0.5">by {creatorName}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setActionMenu(actionMenu === c._id ? null : c._id)}
                        className="text-gray-300 hover:text-gray-500 p-1"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {actionMenu === c._id && (
                        <div className="absolute right-0 top-7 z-20 w-36 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden">
                          <button
                            onClick={() => {
                              setViewTarget(c);
                              setActionMenu(null);
                            }}
                            className="w-full flex items-center gap-2 px-3.5 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          {c.status === "pending_review" && (
                            <>
                              <button
                                onClick={() => handleApprove(c)}
                                disabled={isBusy}
                                className="w-full flex items-center gap-2 px-3.5 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setRejectTarget(c);
                                  setActionMenu(null);
                                }}
                                disabled={isBusy}
                                className="w-full flex items-center gap-2 px-3.5 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              setDeleteTarget(c);
                              setActionMenu(null);
                            }}
                            disabled={isBusy}
                            className="w-full flex items-center gap-2 px-3.5 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 border-t border-gray-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${categoryColors[c.category] || "bg-gray-50 text-gray-500"}`}>
                      {c.category}
                    </span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusColors[c.status]}`}>
                      {statusLabels[c.status]}
                    </span>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-[12px] mb-1.5">
                      <span className="font-semibold text-[#2D6A4F]">₹{raised.toLocaleString("en-IN")}</span>
                      <span className="text-gray-400">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pct >= 70 ? "bg-[#52B788]" : pct >= 40 ? "bg-amber-400" : "bg-gray-300"}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">of ₹{goal.toLocaleString("en-IN")} goal</p>
                  </div>

                  {c.status === "pending_review" && (
                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-50">
                      <button
                        onClick={() => handleApprove(c)}
                        disabled={isBusy}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-[#F0F7F4] text-[#2D6A4F] py-2 rounded-xl text-[12px] font-semibold hover:bg-[#D8F3DC] transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> {isBusy ? "Approving…" : "Approve"}
                      </button>
                      <button
                        onClick={() => setRejectTarget(c)}
                        disabled={isBusy}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 text-red-500 py-2 rounded-xl text-[12px] font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}

                  {c.status !== "pending_review" && (
                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-50">
                      <button
                        onClick={() => setDeleteTarget(c)}
                        disabled={isBusy}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 text-red-600 py-2 rounded-xl text-[12px] font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> {isBusy ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewTarget && (
        <ViewModal campaign={viewTarget} onClose={() => setViewTarget(null)} />
      )}

      {rejectTarget && (
        <RejectModal
          campaign={rejectTarget}
          submitting={actioningId === rejectTarget._id}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleReject}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          campaign={deleteTarget}
          submitting={actioningId === deleteTarget._id}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
