import React from 'react';
import { Icon } from '../icons.jsx';
import Card from '../components/ui/Card.jsx';
import { notifications } from '../data.js';

const TYPE_ICON = { donation: 'HeartHand', milestone: 'TrendingUp', follow: 'UserPlus', comment: 'MessageCircle', reward: 'Award' };
const TYPE_TINT = { donation: 'bg-emerald-50 text-emerald-700', milestone: 'bg-blue-50 text-blue-700', follow: 'bg-violet-50 text-violet-700', comment: 'bg-amber-50 text-amber-700', reward: 'bg-amber-50 text-amber-600' };

export default function Notifications() {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Card padded={false}>
      <div className="flex items-center justify-between p-5">
        <h2 className="text-base font-bold text-slate-900">Notifications</h2>
        {unreadCount > 0 && (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{unreadCount} new</span>
        )}
      </div>

      <ul className="divide-y divide-slate-100">
        {notifications.map((n) => {
          const NIcon = Icon[TYPE_ICON[n.type]];
          return (
            <li key={n.id} className={`flex items-start gap-3 px-5 py-4 ${!n.read ? 'bg-emerald-50/30' : ''}`}>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${TYPE_TINT[n.type] || 'bg-slate-100 text-slate-500'}`}>
                <NIcon className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                <p className="mt-0.5 truncate text-sm text-slate-500">{n.detail}</p>
                <p className="mt-1 text-[11px] text-slate-400">{n.time}</p>
              </div>
              {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-600" />}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
