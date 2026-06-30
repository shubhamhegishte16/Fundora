import React, { useState } from 'react';
import { Icon } from '../icons.jsx';
import Card, { CardHeader } from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { profile, notificationPrefs } from '../data.js';

const inputClass = 'w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100';
const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700';

function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${enabled ? 'bg-emerald-600' : 'bg-slate-200'}`}
      aria-pressed={enabled}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

export default function ProfileSettings() {
  const [prefs, setPrefs] = useState(notificationPrefs);

  const togglePref = (id) => {
    setPrefs((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <Card>
          <CardHeader title="Profile Information" />
          <div className="mt-4 flex items-center gap-4">
            <Avatar name={profile.name} size="xl" tint="dark" />
            <div>
              <Button variant="outline" size="sm" icon={Icon.Camera}>Change Photo</Button>
              <p className="mt-1.5 text-xs text-slate-400">PNG or JPG, up to 2MB</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Full Name</label>
              <input className={inputClass} defaultValue={profile.name} />
            </div>
            <div>
              <label className={labelClass}>Role</label>
              <input className={inputClass} defaultValue={profile.role} disabled />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input className={inputClass} defaultValue={profile.email} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input className={inputClass} defaultValue={profile.phone} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Location</label>
              <input className={inputClass} defaultValue={profile.location} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Bio</label>
              <textarea className={`${inputClass} min-h-[90px] resize-none`} defaultValue={profile.bio} />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Change Password" />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Current Password</label>
              <input type="password" className={inputClass} placeholder="••••••••" />
            </div>
            <div>
              <label className={labelClass}>New Password</label>
              <input type="password" className={inputClass} placeholder="••••••••" />
            </div>
            <div>
              <label className={labelClass}>Confirm New Password</label>
              <input type="password" className={inputClass} placeholder="••••••••" />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <Button variant="outline" icon={Icon.Lock}>Update Password</Button>
          </div>
        </Card>
      </div>

      <Card className="h-fit">
        <CardHeader title="Notification Preferences" />
        <div className="mt-4 space-y-4">
          {prefs.map((p) => (
            <div key={p.id} className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{p.label}</p>
                <p className="text-xs text-slate-500">{p.desc}</p>
              </div>
              <Toggle enabled={p.enabled} onChange={() => togglePref(p.id)} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
