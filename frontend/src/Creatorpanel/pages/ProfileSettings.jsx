import React, { useState, useEffect } from 'react';
import { Icon } from '../icons.jsx';
import Card, { CardHeader } from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { getMyProfile, updateMyProfile, updateNotificationPrefs, changePassword } from '../../../services/profileService.js';

const inputClass = 'w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100';
const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700';

const PREF_META = [
  { id: 'donations', label: 'New donations', desc: 'Get notified when someone donates to your campaign' },
  { id: 'milestones', label: 'Funding milestones', desc: 'Get notified when a campaign crosses a funding milestone' },
  { id: 'followers', label: 'New followers', desc: 'Get notified when someone follows you' },
  { id: 'community', label: 'Community activity', desc: 'Comments and likes on your posts' },
];

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
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', location: '', bio: '' });
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getMyProfile();
        const c = data.creator;
        if (isMounted) {
          setProfile(c);
          setForm({
            name: c.name || '',
            email: c.email || '',
            phone: c.phone || '',
            location: c.location || '',
            bio: c.bio || '',
          });
          setPrefs(c.notificationPrefs || { donations: true, milestones: true, followers: false, community: true });
        }
      } catch (err) {
        if (isMounted) setError('Could not load your profile. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const updateField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSaveProfile = async () => {
    setProfileMsg(null);
    setSavingProfile(true);
    try {
      await updateMyProfile({ name: form.name, phone: form.phone, location: form.location, bio: form.bio });
      setProfileMsg({ type: 'success', text: 'Profile updated.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: 'Could not save changes. Please try again.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const togglePref = async (id) => {
    const prevPrefs = prefs;
    const nextPrefs = { ...prefs, [id]: !prefs[id] };
    setPrefs(nextPrefs);
    try {
      await updateNotificationPrefs({ [id]: nextPrefs[id] });
    } catch (err) {
      setPrefs(prevPrefs);
    }
  };

  const handleChangePassword = async () => {
    setPwMsg(null);
    if (!pwForm.current || !pwForm.next) {
      setPwMsg({ type: 'error', text: 'Please fill in all password fields.' });
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setSavingPw(true);
    try {
      await changePassword(pwForm.current, pwForm.next);
      setPwMsg({ type: 'success', text: 'Password updated.' });
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err?.response?.data?.message || 'Could not update password.' });
    } finally {
      setSavingPw(false);
    }
  };

  if (loading) {
    return (
      <Card className="flex flex-col items-center gap-2 py-12 text-center">
        <p className="text-sm font-medium text-slate-500">Loading profile…</p>
      </Card>
    );
  }

  if (error || !profile) {
    return (
      <Card className="flex flex-col items-center gap-2 py-12 text-center">
        <p className="text-sm font-medium text-rose-500">{error || 'Something went wrong.'}</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <Card>
          <CardHeader title="Profile Information" />
          <div className="mt-4 flex items-center gap-4">
            <Avatar name={form.name} size="xl" tint="dark" />
            <div>
              <Button variant="outline" size="sm" icon={Icon.Camera} disabled>Change Photo</Button>
              <p className="mt-1.5 text-xs text-slate-400">Photo upload isn't wired up yet.</p>
            </div>
          </div>

          {profileMsg && (
            <p className={`mt-4 text-sm ${profileMsg.type === 'success' ? 'text-emerald-700' : 'text-rose-500'}`}>{profileMsg.text}</p>
          )}

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Full Name</label>
              <input className={inputClass} value={form.name} onChange={updateField('name')} />
            </div>
            <div>
              <label className={labelClass}>Role</label>
              <input className={inputClass} value={profile.role} disabled />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input className={inputClass} value={form.email} disabled />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input className={inputClass} value={form.phone} onChange={updateField('phone')} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Location</label>
              <input className={inputClass} value={form.location} onChange={updateField('location')} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Bio</label>
              <textarea className={`${inputClass} min-h-[90px] resize-none`} value={form.bio} onChange={updateField('bio')} />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <Button disabled={savingProfile} onClick={handleSaveProfile}>{savingProfile ? 'Saving…' : 'Save Changes'}</Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Change Password" />
          {pwMsg && (
            <p className={`mt-2 text-sm ${pwMsg.type === 'success' ? 'text-emerald-700' : 'text-rose-500'}`}>{pwMsg.text}</p>
          )}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Current Password</label>
              <input
                type="password"
                className={inputClass}
                placeholder="••••••••"
                value={pwForm.current}
                onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>New Password</label>
              <input
                type="password"
                className={inputClass}
                placeholder="••••••••"
                value={pwForm.next}
                onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>Confirm New Password</label>
              <input
                type="password"
                className={inputClass}
                placeholder="••••••••"
                value={pwForm.confirm}
                onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
              />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <Button variant="outline" icon={Icon.Lock} disabled={savingPw} onClick={handleChangePassword}>
              {savingPw ? 'Updating…' : 'Update Password'}
            </Button>
          </div>
        </Card>
      </div>

      <Card className="h-fit">
        <CardHeader title="Notification Preferences" />
        <div className="mt-4 space-y-4">
          {PREF_META.map((p) => (
            <div key={p.id} className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{p.label}</p>
                <p className="text-xs text-slate-500">{p.desc}</p>
              </div>
              <Toggle enabled={prefs[p.id]} onChange={() => togglePref(p.id)} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
