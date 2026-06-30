import React, { useState } from "react";
import { Search, Filter, MoreHorizontal, UserCheck, UserX, Mail, Shield, ChevronLeft, ChevronRight, Download } from "lucide-react";

const allUsers = [
  { id: 1, name: "Ananya Sharma", email: "ananya@email.com", role: "Campaign Creator", status: "Active", kyc: "Verified", joined: "12 Jan 2024", donations: "₹12,400", campaigns: 3, avatar: "AS" },
  { id: 2, name: "Rohan Verma", email: "rohan@email.com", role: "Donor", status: "Active", kyc: "N/A", joined: "18 Feb 2024", donations: "₹8,200", campaigns: 0, avatar: "RV" },
  { id: 3, name: "Meera Iyer", email: "meera@email.com", role: "Campaign Creator", status: "Active", kyc: "Pending", joined: "03 Mar 2024", donations: "₹0", campaigns: 1, avatar: "MI" },
  { id: 4, name: "Arjun Nair", email: "arjun@email.com", role: "Donor", status: "Suspended", kyc: "N/A", joined: "27 Mar 2024", donations: "₹3,500", campaigns: 0, avatar: "AN" },
  { id: 5, name: "Pooja Khanna", email: "pooja@email.com", role: "Campaign Creator", status: "Active", kyc: "Verified", joined: "05 Apr 2024", donations: "₹0", campaigns: 2, avatar: "PK" },
  { id: 6, name: "Karan Mehta", email: "karan@email.com", role: "Donor", status: "Active", kyc: "N/A", joined: "11 Apr 2024", donations: "₹21,000", campaigns: 0, avatar: "KM" },
  { id: 7, name: "Divya Patel", email: "divya@email.com", role: "Campaign Creator", status: "Active", kyc: "Verified", joined: "15 May 2024", donations: "₹0", campaigns: 4, avatar: "DP" },
  { id: 8, name: "Nikhil Gupta", email: "nikhil@email.com", role: "Donor", status: "Inactive", kyc: "N/A", joined: "22 May 2024", donations: "₹500", campaigns: 0, avatar: "NG" },
];

const RoleBadge = ({ role }) => {
  const map = {
    "Campaign Creator": "bg-purple-100 text-purple-700",
    "Donor": "bg-blue-100 text-blue-700",
    "Admin": "bg-[#D8F3DC] text-[#2D6A4F]",
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${map[role] || "bg-gray-100 text-gray-600"}`}>{role}</span>;
};

const StatusBadge = ({ status }) => {
  const map = {
    Active: "bg-green-100 text-green-700",
    Suspended: "bg-red-100 text-red-700",
    Inactive: "bg-gray-100 text-gray-500",
  };
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${map[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "Active" ? "bg-green-500" : status === "Suspended" ? "bg-red-500" : "bg-gray-400"}`} />
      {status}
    </div>
  );
};

const KYCBadge = ({ kyc }) => {
  const map = {
    Verified: "bg-[#D8F3DC] text-[#2D6A4F]",
    Pending: "bg-amber-100 text-amber-700",
    "N/A": "bg-gray-100 text-gray-400",
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[kyc]}`}>{kyc}</span>;
};

export default function ManageUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);

  const filtered = allUsers.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    const matchStatus = statusFilter === "All" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332]">Manage Users</h1>
          <p className="text-gray-500 text-sm mt-0.5">{allUsers.length} total registered users</p>
        </div>
        <button className="flex items-center gap-2 bg-[#2D6A4F] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1B4332] transition-colors">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: "12,482", color: "text-[#2D6A4F]" },
          { label: "Campaign Creators", value: "1,240", color: "text-purple-600" },
          { label: "Donors", value: "10,890", color: "text-blue-600" },
          { label: "Suspended", value: "352", color: "text-red-500" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 bg-[#F0F7F4] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#52B788]/40"
          />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-[#F0F7F4] rounded-xl text-sm text-gray-600 outline-none border-none">
          <option value="All">All Roles</option>
          <option>Campaign Creator</option>
          <option>Donor</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-[#F0F7F4] rounded-xl text-sm text-gray-600 outline-none border-none">
          <option value="All">All Status</option>
          <option>Active</option>
          <option>Suspended</option>
          <option>Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-gray-50 hover:bg-[#F9FFFE] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#52B788] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><RoleBadge role={u.role} /></td>
                  <td className="px-4 py-3.5"><StatusBadge status={u.status} /></td>
                  <td className="px-4 py-3.5"><KYCBadge kyc={u.kyc} /></td>
                  <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">{u.joined}</td>
                  <td className="px-4 py-3.5 font-medium text-[#2D6A4F]">{u.donations}</td>
                  <td className="px-4 py-3.5 text-center text-gray-700 font-medium">{u.campaigns}</td>
                  <td className="px-4 py-3.5">
                    <div className="relative">
                      <button
                        onClick={() => setActionMenu(actionMenu === u.id ? null : u.id)}
                        className="text-gray-400 hover:text-[#2D6A4F] p-1 rounded-lg hover:bg-[#F0F7F4]"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {actionMenu === u.id && (
                        <div className="absolute right-0 top-8 z-20 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 overflow-hidden">
                          {[
                            { icon: Mail, label: "Send Email" },
                            { icon: UserCheck, label: "Activate" },
                            { icon: Shield, label: "Make Admin" },
                            { icon: UserX, label: "Suspend", danger: true },
                          ].map((action) => (
                            <button key={action.label}
                              className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors
                                ${action.danger ? "text-red-500 hover:bg-red-50" : "text-gray-700 hover:bg-[#F0F7F4]"}`}
                              onClick={() => setActionMenu(null)}
                            >
                              <action.icon className="w-4 h-4" />
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
          <p className="text-sm text-gray-500">Showing <span className="font-medium text-gray-700">{filtered.length}</span> of <span className="font-medium text-gray-700">{allUsers.length}</span> users</p>
          <div className="flex items-center gap-1.5">
            <button className="p-1.5 rounded-lg hover:bg-[#F0F7F4] text-gray-500"><ChevronLeft className="w-4 h-4" /></button>
            {[1, 2, 3].map((p) => (
              <button key={p} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === 1 ? "bg-[#2D6A4F] text-white" : "text-gray-600 hover:bg-[#F0F7F4]"}`}>{p}</button>
            ))}
            <button className="p-1.5 rounded-lg hover:bg-[#F0F7F4] text-gray-500"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}