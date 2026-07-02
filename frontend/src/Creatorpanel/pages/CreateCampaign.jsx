import React, { useState, useEffect } from 'react';
import { Icon } from '../icons.jsx';
import Card, { CardHeader } from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import { createCampaign, updateCampaign, getCampaignById } from '../../../services/campaignService.js';

const inputClass = 'w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100';
const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700';

const CATEGORIES = ['Education', 'Health', 'Environment', 'Disaster Relief', 'Animal Welfare', 'Community'];

const EMPTY_FORM = {
  title: '',
  organization: '',
  category: 'Education',
  description: '',
  goalAmount: '',
  durationDays: '',
  coverImageUrl: '',
};

// campaignId is passed in when editing an existing campaign (see CreatorPanelApp.jsx).
// onNavigate lets us jump back to the campaigns list after a successful save.
export default function CreateCampaign({ campaignId, onNavigate }) {
  const isEditing = Boolean(campaignId);

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEditing) {
      setForm(EMPTY_FORM);
      setLoading(false);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getCampaignById(campaignId);
        const c = data.campaign;
        if (isMounted && c) {
          setForm({
            title: c.title || '',
            organization: c.organization || '',
            category: c.category || 'Education',
            description: c.description || '',
            goalAmount: c.goalAmount != null ? String(c.goalAmount) : '',
            durationDays: c.endDate
              ? String(Math.max(0, Math.ceil((new Date(c.endDate) - new Date(c.startDate || c.createdAt)) / (1000 * 60 * 60 * 24))))
              : '',
            coverImageUrl: c.coverImageUrl || '',
          });
        }
      } catch (err) {
        if (isMounted) setError('Could not load this campaign. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [campaignId, isEditing]);

  const updateField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const buildPayload = (status) => {
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      goalAmount: Number(form.goalAmount) || 0,
      coverImageUrl: form.coverImageUrl || undefined,
      status,
    };

    if (status === 'pending_review') {
      // startDate/endDate get finalized by the admin on approval, but we
      // still pass the creator's requested duration through as endDate so
      // it's available for reference during review.
      const start = new Date();
      const end = new Date(start);
      end.setDate(end.getDate() + (Number(form.durationDays) || 30));
      payload.startDate = start.toISOString();
      payload.endDate = end.toISOString();
    }

    return payload;
  };

  const handleSave = async (status) => {
    setError(null);

    if (!form.title.trim() || !form.category || !form.goalAmount) {
      setError('Campaign title, category, and target amount are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload(status);
      if (isEditing) {
        await updateCampaign(campaignId, payload);
      } else {
        await createCampaign(payload);
      }
      onNavigate?.('campaigns');
    } catch (err) {
      setError('Could not save this campaign. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const fundedPct = 0; // new/edited campaigns start unfunded in this preview

  if (loading) {
    return (
      <Card className="flex flex-col items-center gap-2 py-12 text-center">
        <p className="text-sm font-medium text-slate-500">Loading campaign…</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        <Card>
          <CardHeader title="Campaign Details" />
          <div className="mt-4 space-y-4">
            <div>
              <label className={labelClass}>Campaign Title</label>
              <input
                className={inputClass}
                placeholder="e.g. Empower Rural Education"
                value={form.title}
                onChange={updateField('title')}
              />
            </div>
            <div>
              <label className={labelClass}>Organization Name</label>
              <input
                className={inputClass}
                placeholder="e.g. Teach India"
                value={form.organization}
                onChange={updateField('organization')}
              />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, category: c }))}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      form.category === c ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                className={`${inputClass} min-h-[120px] resize-none`}
                placeholder="Tell donors what this campaign is about and the impact it will create..."
                value={form.description}
                onChange={updateField('description')}
              />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Funding Goal" />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Target Amount (₹)</label>
              <input
                type="number"
                className={inputClass}
                placeholder="500000"
                value={form.goalAmount}
                onChange={updateField('goalAmount')}
              />
            </div>
            <div>
              <label className={labelClass}>Campaign Duration (days)</label>
              <input
                type="number"
                className={inputClass}
                placeholder="30"
                value={form.durationDays}
                onChange={updateField('durationDays')}
              />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Campaign Cover" />
          <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <Icon.Upload className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-slate-700">Drag and drop an image, or click to browse</p>
            <p className="text-xs text-slate-400">PNG or JPG, up to 5MB</p>
            <p className="text-xs text-slate-400">(Image upload isn't wired up yet — paste a cover image URL below in the meantime.)</p>
            <input
              className={`${inputClass} mt-2`}
              placeholder="https://example.com/cover.jpg"
              value={form.coverImageUrl}
              onChange={updateField('coverImageUrl')}
            />
          </div>
        </Card>
      </div>

      <div className="space-y-5">
        <Card>
          <CardHeader title="Preview" />
          <div className="mt-4">
            <div className="relative h-32 w-full overflow-hidden rounded-lg bg-gradient-to-br from-emerald-200 to-teal-300">
              {form.coverImageUrl ? (
                <img src={form.coverImageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-emerald-900/40">
                  <Icon.Image className="h-8 w-8" />
                </div>
              )}
            </div>
            <p className="mt-3 truncate text-sm font-semibold text-slate-900">{form.title || 'Your campaign title'}</p>
            <p className="text-xs text-slate-500">by {form.organization || 'Your organization'}</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-600" style={{ width: `${fundedPct}%` }} />
            </div>
            <p className="mt-1 text-[11px] font-medium text-emerald-700">{fundedPct}% funded</p>
          </div>
        </Card>

        <Card className="space-y-3">
          <Button className="w-full" disabled={saving} onClick={() => handleSave('pending_review')}>
            {saving ? 'Saving…' : isEditing ? 'Submit for Review' : 'Submit for Review'}
          </Button>
          <Button variant="outline" className="w-full" disabled={saving} onClick={() => handleSave('draft')}>
            {saving ? 'Saving…' : 'Save as Draft'}
          </Button>
        </Card>
      </div>
    </div>
  );
}