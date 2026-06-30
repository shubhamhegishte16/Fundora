import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useState } from "react";

export default function AdminLayout() {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-[#F7F9F8]">
      <Sidebar open={open} setOpen={setOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header sidebarOpen={open} setSidebarOpen={setOpen} />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}