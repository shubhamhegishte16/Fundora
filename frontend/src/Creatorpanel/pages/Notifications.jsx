import React, { useState, useEffect } from 'react';
import { Icon } from '../icons.jsx';
import Card from '../components/ui/Card.jsx';
import { getMyNotifications, markNotificationRead, markAllNotificationsRead } from '../../../services/notificationService.js';

const TYPE_ICON = { donation: 'HeartHand', milestone: 'TrendingUp', follow: 'UserPlus', comment: 'MessageCircle', reward: 'Award' };
const TYPE_TINT = { donation: 'bg-emerald-50 text-emerald-700', milestone: 'bg-blue-50 text-blue-700', follow: 'bg-violet-50 text-violet-700', comment: 'bg-amber-50 text-amber-700', reward: 'bg-amber-50 text-amber-600' };

function relativeTime(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const data = await getMyNotifications();
      setNotifications(data.notifications || []);
    } catch (err) {
      setError('Could not load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleClick = async (n) => {
    if (n.read) return;
    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    try {
      await markNotificationRead(n.id);
    } catch (err) {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: false } : x)));
    }
  };

  const handleMarkAll = async () => {
    const prevState = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await markAllNotificationsRead();
    } catch (err) {
      setNotifications(prevState);
    }
  };

  return (
    <Card padded={false}>
      <div className="flex items-center justify-between p-5">
        <h2 className="text-base font-bold text-slate-900">Notifications</h2>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{unreadCount} new</span>
          )}
          {unreadCount > 0 && (
            <button onClick={handleMarkAll} className="text-xs font-medium text-slate-500 hover:text-emerald-700">Mark all read</button>
          )}
        </div>
      </div>

      {loading && <p className="border-t border-slate-100 px-5 py-10 text-center text-sm font-medium text-slate-500">Loading notifications…</p>}
      {!loading && error && <p className="border-t border-slate-100 px-5 py-10 text-center text-sm font-medium text-rose-500">{error}</p>}
      {!loading && !error && notifications.length === 0 && (
        <p className="border-t border-slate-100 px-5 py-10 text-center text-sm font-medium text-slate-500">You're all caught up.</p>
      )}

      {!loading && !error && notifications.length > 0 && (
        <ul className="divide-y divide-slate-100">
          {notifications.map((n) => {
            const NIcon = Icon[TYPE_ICON[n.type]] || Icon.Bell;
            return (
              <li
                key={n.id}
                onClick={() => handleClick(n)}
                className={`flex cursor-pointer items-start gap-3 px-5 py-4 ${!n.read ? 'bg-emerald-50/30' : ''}`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${TYPE_TINT[n.type] || 'bg-slate-100 text-slate-500'}`}>
                  <NIcon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                  <p className="mt-0.5 truncate text-sm text-slate-500">{n.detail}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{relativeTime(n.time)}</p>
                </div>
                {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-600" />}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
