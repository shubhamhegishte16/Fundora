import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../icons.jsx';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'Grid' },
  { id: 'campaigns', label: 'My Campaigns', icon: 'Flag' },
  { id: 'donations', label: 'Donations', icon: 'Coins' },
  { id: 'create', label: 'Create Campaigns', icon: 'Plus' },
  { id: 'rewards', label: 'Rewards & Badges', icon: 'Award' },
  { id: 'following', label: 'Following Creators', icon: 'UserPlus' },
  { id: 'community', label: 'Community', icon: 'Users' },
  { id: 'notifications', label: 'Notifications', icon: 'Bell' },
  { id: 'settings', label: 'Profile Settings', icon: 'Settings' },
];

/**
 * Sidebar
 * Brand header, primary nav (active state driven by `activePage`),
 * nature photo + logout. Renders as a fixed column on desktop
 * and a slide-in drawer on mobile.
 */
export default function Sidebar({ activePage, onNavigate, isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('creatorToken');
    localStorage.removeItem('creator');
    navigate('/signup');
  };

  const body = (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="relative bg-emerald-700 px-6 py-7">
        <p className="text-2xl font-extrabold leading-none text-white">Elpis.</p>
        <p className="mt-1 text-xs font-medium text-emerald-100">Creator Panel</p>
        <button onClick={onClose} className="absolute right-3 top-3 rounded-md p-1 text-white/80 hover:bg-white/10 lg:hidden" aria-label="Close menu">
          <Icon.X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
        {NAV_ITEMS.map((item) => {
          const ItemIcon = Icon[item.icon];
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); onClose(); }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                isActive ? 'text-emerald-700' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ItemIcon className="h-[18px] w-[18px] shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="relative m-4 mt-auto overflow-hidden rounded-2xl">
        <div className="h-36 w-full">
          <img
            src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&auto=format&fit=crop&q=60"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>
        <div className="absolute inset-x-0 bottom-3 flex justify-center">
          <button
            onClick={handleLogout}
            className="rounded-full bg-emerald-600 px-8 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden h-screen w-64 shrink-0 border-r border-slate-100 lg:sticky lg:top-0 lg:block">
        {body}
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <aside className="absolute left-0 top-0 h-full w-72 shadow-xl">{body}</aside>
        </div>
      )}
    </>
  );
}
