import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';

/**
 * AppShell
 * The persistent frame (sidebar + top bar) every page renders inside.
 * `title`/`subtitle` are passed through to TopBar per page so the
 * header text changes while the chrome around it stays identical.
 */
export default function AppShell({ activePage, onNavigate, title, subtitle, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activePage={activePage} onNavigate={onNavigate} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="min-w-0 flex-1">
        <TopBar title={title} subtitle={subtitle} onMenuClick={() => setSidebarOpen(true)} />
        <div className="space-y-5 p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
