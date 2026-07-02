import React, { useState, useEffect } from 'react';
import { Icon } from '../icons.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Pill from '../components/ui/Pill.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import { getMyCampaigns } from "../../../services/campaignService.js";

const STATUS_TINT = { active: 'emerald', completed: 'blue', draft: 'slate' };
const STATUS_LABEL = { active: 'Active', completed: 'Completed', draft: 'Draft' };
const FILTERS = ['all', 'active', 'completed', 'draft'];
const DEFAULT_THEME = 'from-emerald-400 to-teal-500';

function CampaignCard({ campaign, onEdit }) {
  return (
    <Card>
      <div className={`relative h-32 w-full overflow-hidden rounded-lg bg-gradient-to-br ${campaign.theme || DEFAULT_THEME}`}>
        {campaign.coverImageUrl && (
          <img src={campaign.coverImageUrl} alt={campaign.title} className="h-full w-full object-cover" />
        )}
        <Pill tint={STATUS_TINT[campaign.status]} className="absolute left-2 top-2 bg-white/90">
          {STATUS_LABEL[campaign.status]}
        </Pill>
        <button className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-700 hover:text-rose-500" aria-label={`Save ${campaign.title}`}>
          <Icon.Heart className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="mt-3 truncate text-sm font-semibold text-slate-900">{campaign.title}</p>
      <p className="text-xs text-slate-500">{campaign.category}</p>

      <ProgressBar value={campaign.fundedPct} className="mt-3" />
      <div className="mt-1.5 flex items-center justify-between text-[11px]">
        <span className="font-medium text-emerald-700">{campaign.fundedPct}% funded</span>
        <span className="text-slate-400">₹{campaign.raisedAmount.toLocaleString('en-IN')} / ₹{campaign.goalAmount.toLocaleString('en-IN')}</span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1"><Icon.Users className="h-3.5 w-3.5" />{campaign.donorCount} donors</span>
        {campaign.daysLeft !== null && campaign.status === 'active' && (
          <span className="flex items-center gap-1"><Icon.Clock className="h-3.5 w-3.5" />{campaign.daysLeft}d left</span>
        )}
      </div>

      <button
        onClick={() => onEdit(campaign._id)}
        className="mt-3 w-full rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
      >
        Edit Campaign
      </button>
    </Card>
  );
}

export default function MyCampaigns({ onNavigate }) {
  const [filter, setFilter] = useState('all');
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getMyCampaigns();
        if (isMounted) setCampaigns(data.campaigns || []);
      } catch (err) {
        if (isMounted) setError('Could not load campaigns. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const filtered = filter === 'all' ? campaigns : campaigns.filter((c) => c.status === filter);

  const goToEdit = (campaignId) => onNavigate?.('create', { campaignId });
  const goToCreate = () => onNavigate?.('create');

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === f ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f === 'all' ? 'All' : STATUS_LABEL[f]}
            </button>
          ))}
        </div>
        <Button icon={Icon.Plus} onClick={goToCreate}>Create Campaign</Button>
      </div>

      {loading && (
        <Card className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="text-sm font-medium text-slate-500">Loading campaigns…</p>
        </Card>
      )}

      {!loading && error && (
        <Card className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="text-sm font-medium text-rose-500">{error}</p>
        </Card>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => <CampaignCard key={c._id} campaign={c} onEdit={goToEdit} />)}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <Card className="flex flex-col items-center gap-2 py-12 text-center">
          <Icon.Flag className="h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">No campaigns in this category yet.</p>
        </Card>
      )}
    </>
  );
}
