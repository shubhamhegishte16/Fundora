import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Search, MoreHorizontal, UserCheck, UserX, Mail, Shield, ChevronLeft, ChevronRight, Download, X, Check, RotateCcw, Loader2, AlertTriangle, Filter } from "lucide-react";
import adminAxios from "../utils/adminAxios";

// Extracts the backend's error message the same way the old apiRequest() did
// (data.message from the JSON body), falling back to axios's own message.
const errMsg = (err) => err.response?.data?.message || err.message || "Request failed";

// ---------------------------------------------------------------------------
// Mapping between backend values (lowercase, from the Mongo schema) and the
// labels this UI displays.
// ---------------------------------------------------------------------------
const ROLE_LABEL = { donor: "Donor", creator: "Campaign Creator", admin: "Admin" };
const STATUS_LABEL = { active: "Active", suspended: "Suspended", inactive: "Inactive" };
const KYC_LABEL = { verified: "Verified", pending: "Pending", rejected: "Rejected", "n/a": "N/A" };

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const normalizeUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: ROLE_LABEL[u.role] || u.role,
  rawRole: u.role,
  status: STATUS_LABEL[u.status] || "Active",
  rawStatus: u.status || "active",
  kyc: KYC_LABEL[u.kyc] || "N/A",
  rawKyc: u.kyc || "n/a",
  joined: formatDate(u.createdAt),
  donations: u.donations || 0,
  campaigns: u.campaigns || 0,
});

const inr = (n) => `₹${n.toLocaleString("en-IN")}`;
const initials = (name = "") => name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

const RoleBadge = ({ role }) => {
  const map = {
    "Campaign Creator": "bg-purple-100 text-purple-700",
    Donor: "bg-blue-100 text-blue-700",
    Admin: "bg-[#D8F3DC] text-[#2D6A4F]",
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${map[role] || "bg-gray-100 text-gray-600"}`}>{role}</span>;
};

const StatusBadge = ({ status }) => {
  const map = {
    Active: "bg-green-100 text-green-700",
    Suspended: "bg-red-100 text-red-700",
    Inactive: "bg-gray-100 text-gray-500",
  };
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${map[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status === "Active" ? "bg-green-500" : status === "Suspended" ? "bg-red-500" : "bg-gray-400"}`} />
      {status}
    </div>
  );
};

const KYCBadge = ({ kyc, onClick }) => {
  const map = {
    Verified: "bg-[#D8F3DC] text-[#2D6A4F]",
    Pending: "bg-amber-100 text-amber-700 cursor-pointer hover:bg-amber-200",
    Rejected: "bg-red-100 text-red-600",
    "N/A": "bg-gray-100 text-gray-400",
  };
  return (
    <span onClick={kyc === "Pending" ? onClick : undefined} className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${map[kyc]}`}>
      {kyc}
    </span>
  );
};

// Shared dropdown of row actions — used by both the desktop table row and the mobile card.
const ActionMenu = ({ u, onClose, onEmail, onToggleActive, onMakeAdmin, onDelete, align = "right" }) => (
  <div
    className={`absolute ${align === "right" ? "right-0" : "left-0"} top-9 z-30 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 overflow-hidden`}
  >
    <button
      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-[#F0F7F4] active:bg-[#F0F7F4]"
      onClick={() => {
        onEmail(u);
        onClose();
      }}
    >
      <Mail className="w-4 h-4 flex-shrink-0" /> Send Email
    </button>

    {u.status !== "Active" ? (
      <button
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-[#F0F7F4] active:bg-[#F0F7F4]"
        onClick={() => {
          onToggleActive(u);
          onClose();
        }}
      >
        <UserCheck className="w-4 h-4 flex-shrink-0" /> {u.status === "Suspended" ? "Reinstate" : "Activate"}
      </button>
    ) : (
      <button
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-500 hover:bg-red-50 active:bg-red-50"
        onClick={() => {
          onToggleActive(u);
          onClose();
        }}
      >
        <UserX className="w-4 h-4 flex-shrink-0" /> Suspend
      </button>
    )}

    {u.role !== "Admin" && (
      <button
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-[#F0F7F4] active:bg-[#F0F7F4]"
        onClick={() => {
          onMakeAdmin(u);
          onClose();
        }}
      >
        <Shield className="w-4 h-4 flex-shrink-0" /> Make Admin
      </button>
    )}

    <div className="my-1 border-t border-gray-50" />

    <button
      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-500 hover:bg-red-50 active:bg-red-50"
      onClick={() => {
        onDelete(u);
        onClose();
      }}
    >
      <X className="w-4 h-4 flex-shrink-0" /> Delete User
    </button>
  </div>
);

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [actionMenu, setActionMenu] = useState(null);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [lastAction, setLastAction] = useState(null);
  const pageSize = 5;
  const menuRef = useRef(null);

  const notify = (message, undo) => {
    setToast({ message });
    setLastAction(undo || null);
    clearTimeout(notify._t);
    notify._t = setTimeout(() => setToast(null), 4000);
  };

  const markPending = (id, on) =>
    setPendingIds((cur) => {
      const next = new Set(cur);
      on ? next.add(id) : next.delete(id);
      return next;
    });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await adminAxios.get("/users");
      setUsers((data.users || []).map(normalizeUser));
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Close any open action menu on outside click or Escape.
  useEffect(() => {
    if (!actionMenu) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setActionMenu(null);
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setActionMenu(null);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [actionMenu]);

  // Sends a PATCH to the backend, then reconciles local state with what the
  // server actually returns. Rolls back and shows an error toast on failure.
  const patchUser = async (id, backendPatch, successMessage) => {
    const prev = users.find((u) => u.id === id);
    if (!prev) return;
    markPending(id, true);
    try {
      const { data } = await adminAxios.patch(`/users/${id}`, backendPatch);
      const updated = normalizeUser(data.user);
      setUsers((cur) => cur.map((u) => (u.id === id ? updated : u)));
      notify(successMessage, () => rollback(id, prev));
    } catch (err) {
      notify(`Failed: ${errMsg(err)}`, null);
    } finally {
      markPending(id, false);
    }
  };

  // Undo re-issues a PATCH with the previous raw values.
  const rollback = async (id, prevUser) => {
    markPending(id, true);
    try {
      const { data } = await adminAxios.patch(`/users/${id}`, {
        status: prevUser.rawStatus,
        role: prevUser.rawRole,
        kyc: prevUser.rawKyc,
      });
      setUsers((cur) => cur.map((u) => (u.id === id ? normalizeUser(data.user) : u)));
      notify(`Reverted ${prevUser.name}`, null);
    } catch (err) {
      notify(`Undo failed: ${errMsg(err)}`, null);
    } finally {
      markPending(id, false);
    }
  };

  const removeUser = async (id, name) => {
    markPending(id, true);
    try {
      await adminAxios.delete(`/users/${id}`);
      setUsers((cur) => cur.filter((u) => u.id !== id));
      notify(`${name} deleted`, null); // no undo — deletion isn't reversible via this API
    } catch (err) {
      notify(`Failed to delete: ${errMsg(err)}`, null);
    } finally {
      markPending(id, false);
    }
  };

  const activate = (u) => patchUser(u.id, { status: "active" }, `${u.name} activated`);
  const suspend = (u) => patchUser(u.id, { status: "suspended" }, `${u.name} suspended`);
  const reinstate = (u) => patchUser(u.id, { status: "active" }, `${u.name} reinstated`);
  const toggleActive = (u) => (u.status === "Suspended" ? reinstate(u) : u.status === "Active" ? suspend(u) : activate(u));
  const makeAdmin = (u) => patchUser(u.id, { role: "admin" }, `${u.name} is now an Admin`);
  const verifyKyc = (u) => patchUser(u.id, { kyc: "verified" }, `${u.name}'s KYC verified`);
  const sendEmail = (u) => notify(`Email queued for ${u.email}`, null);
  const handleDelete = (u) => removeUser(u.id, u.name);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "All" || u.role === roleFilter;
      const matchStatus = statusFilter === "All" || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const pageItems = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  const activeFilterCount = (roleFilter !== "All" ? 1 : 0) + (statusFilter !== "All" ? 1 : 0);

  const stats = useMemo(() => {
    const total = users.length;
    const creators = users.filter((u) => u.role === "Campaign Creator").length;
    const donors = users.filter((u) => u.role === "Donor").length;
    const suspended = users.filter((u) => u.status === "Suspended").length;
    return { total, creators, donors, suspended };
  }, [users]);

  const exportCsv = () => {
    const header = ["Name", "Email", "Role", "Status", "KYC", "Joined", "Donations", "Campaigns"];
    const rows = filtered.map((u) => [u.name, u.email, u.role, u.status, u.kyc, u.joined, u.donations, u.campaigns]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    URL.revokeObjectURL(url);
    notify(`Exported ${filtered.length} users`, null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 gap-2 px-4 text-center">
        <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" /> Loading users…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-4">
        <AlertTriangle className="w-8 h-8 text-red-400" />
        <p className="text-gray-600 text-sm">Couldn't load users: {error}</p>
        <button
          onClick={loadUsers}
          className="px-4 py-2 bg-[#2D6A4F] text-white rounded-xl text-sm font-medium hover:bg-[#1B4332]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 relative max-w-full">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between flex-wrap gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-[#1B4332] truncate">Manage Users</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">{stats.total} total registered users</p>
        </div>
        <button
          onClick={exportCsv}
          className="flex items-center gap-2 bg-[#2D6A4F] text-white px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm font-medium hover:bg-[#1B4332] active:bg-[#1B4332] transition-colors flex-shrink-0"
        >
          <Download className="w-4 h-4" /> <span className="hidden xs:inline">Export</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {[
          { label: "Total Users", value: stats.total, color: "text-[#2D6A4F]" },
          { label: "Campaign Creators", value: stats.creators, color: "text-purple-600" },
          { label: "Donors", value: stats.donors, color: "text-blue-600" },
          { label: "Suspended", value: stats.suspended, color: "text-red-500" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-gray-100 min-w-0">
            <p className="text-xs text-gray-500 truncate">{c.label}</p>
            <p className={`text-xl sm:text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-gray-100 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 bg-[#F0F7F4] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#52B788]/40"
            />
          </div>
          {/* Mobile filter toggle */}
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={`sm:hidden relative flex items-center justify-center px-3 py-2 rounded-xl text-sm font-medium flex-shrink-0 ${
              filtersOpen ? "bg-[#2D6A4F] text-white" : "bg-[#F0F7F4] text-gray-600"
            }`}
          >
            <Filter className="w-4 h-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
        <div className={`${filtersOpen ? "flex" : "hidden"} sm:flex flex-wrap gap-3`}>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="flex-1 sm:flex-none px-3 py-2 bg-[#F0F7F4] rounded-xl text-sm text-gray-600 outline-none border-none min-w-0"
          >
            <option value="All">All Roles</option>
            <option>Campaign Creator</option>
            <option>Donor</option>
            <option>Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="flex-1 sm:flex-none px-3 py-2 bg-[#F0F7F4] rounded-xl text-sm text-gray-600 outline-none border-none min-w-0"
          >
            <option value="All">All Status</option>
            <option>Active</option>
            <option>Suspended</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* Desktop / tablet table (md and up) */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F0F7F4] border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">KYC</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Donations</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Campaigns</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-gray-400 text-sm">
                    No users match these filters.
                  </td>
                </tr>
              )}
              {pageItems.map((u) => {
                const isPending = pendingIds.has(u.id);
                return (
                  <tr key={u.id} className={`border-t border-gray-50 hover:bg-[#F9FFFE] transition-colors ${isPending ? "opacity-50" : ""}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#52B788] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {initials(u.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate">{u.name}</p>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <KYCBadge kyc={u.kyc} onClick={() => verifyKyc(u)} />
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">{u.joined}</td>
                    <td className="px-4 py-3.5 font-medium text-[#2D6A4F] whitespace-nowrap">{inr(u.donations)}</td>
                    <td className="px-4 py-3.5 text-center text-gray-700 font-medium">{u.campaigns}</td>
                    <td className="px-4 py-3.5">
                      <div className="relative" ref={actionMenu === u.id ? menuRef : null}>
                        <button
                          disabled={isPending}
                          onClick={() => setActionMenu(actionMenu === u.id ? null : u.id)}
                          className="text-gray-400 hover:text-[#2D6A4F] p-1 rounded-lg hover:bg-[#F0F7F4] disabled:opacity-40"
                        >
                          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4" />}
                        </button>
                        {actionMenu === u.id && !isPending && (
                          <ActionMenu
                            u={u}
                            onClose={() => setActionMenu(null)}
                            onEmail={sendEmail}
                            onToggleActive={toggleActive}
                            onMakeAdmin={makeAdmin}
                            onDelete={handleDelete}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card list (below md) */}
      <div className="md:hidden space-y-3">
        {pageItems.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 px-5 py-10 text-center text-gray-400 text-sm">
            No users match these filters.
          </div>
        )}
        {pageItems.map((u) => {
          const isPending = pendingIds.has(u.id);
          return (
            <div
              key={u.id}
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 ${isPending ? "opacity-50" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#52B788] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {initials(u.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">{u.name}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                </div>
                <div className="relative flex-shrink-0" ref={actionMenu === u.id ? menuRef : null}>
                  <button
                    disabled={isPending}
                    onClick={() => setActionMenu(actionMenu === u.id ? null : u.id)}
                    className="text-gray-400 hover:text-[#2D6A4F] p-1.5 rounded-lg hover:bg-[#F0F7F4] disabled:opacity-40"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4" />}
                  </button>
                  {actionMenu === u.id && !isPending && (
                    <ActionMenu
                      u={u}
                      onClose={() => setActionMenu(null)}
                      onEmail={sendEmail}
                      onToggleActive={toggleActive}
                      onMakeAdmin={makeAdmin}
                      onDelete={handleDelete}
                      align="right"
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                <RoleBadge role={u.role} />
                <StatusBadge status={u.status} />
                <KYCBadge kyc={u.kyc} onClick={() => verifyKyc(u)} />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-50 text-xs">
                <div>
                  <p className="text-gray-400">Joined</p>
                  <p className="text-gray-600 font-medium mt-0.5">{u.joined}</p>
                </div>
                <div>
                  <p className="text-gray-400">Donations</p>
                  <p className="text-[#2D6A4F] font-medium mt-0.5">{inr(u.donations)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Campaigns</p>
                  <p className="text-gray-600 font-medium mt-0.5">{u.campaigns}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="bg-white md:bg-transparent rounded-2xl md:rounded-none border md:border-0 border-gray-100 flex items-center justify-between px-4 sm:px-5 py-3.5 md:border-t-0 flex-wrap gap-3">
        <p className="text-xs sm:text-sm text-gray-500">
          Showing <span className="font-medium text-gray-700">{pageItems.length}</span> of{" "}
          <span className="font-medium text-gray-700">{filtered.length}</span> users
        </p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={pageSafe === 1}
            className="p-1.5 rounded-lg hover:bg-[#F0F7F4] text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                p === pageSafe ? "bg-[#2D6A4F] text-white" : "text-gray-600 hover:bg-[#F0F7F4]"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={pageSafe === totalPages}
            className="p-1.5 rounded-lg hover:bg-[#F0F7F4] text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-4 sm:bottom-5 left-4 right-4 sm:left-auto sm:right-5 z-50 flex items-center gap-3 bg-[#1B4332] text-white px-4 py-3 rounded-xl shadow-xl text-sm sm:w-auto sm:max-w-md">
          <Check className="w-4 h-4 text-[#95D5B2] flex-shrink-0" />
          <span className="flex-1 min-w-0">{toast.message}</span>
          {lastAction && (
            <button
              onClick={() => {
                lastAction();
                setToast(null);
                setLastAction(null);
              }}
              className="flex items-center gap-1 text-[#95D5B2] hover:text-white ml-1 font-medium flex-shrink-0"
            >
              <RotateCcw className="w-3 h-3" /> <span className="hidden xs:inline">Undo</span>
            </button>
          )}
          <button onClick={() => setToast(null)} className="text-white/60 hover:text-white ml-1 flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}