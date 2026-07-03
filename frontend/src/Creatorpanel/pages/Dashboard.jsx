import React, { useState, useEffect } from 'react';
import { Icon } from '../icons.jsx';
import Card, { CardHeader } from '../components/ui/Card.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import FundingChart from '../components/charts/FundingChart.jsx';
import Donut from '../components/charts/Donut.jsx';
import { getDashboardSummary } from '../../../services/dashboardService.js';

function StatCardGrid({ statCards }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const StatIcon = Icon[stat.icon];
        return (
          <div key={stat.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${stat.tint}`}>
              <StatIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-slate-500">{stat.label}</p>
              <p className="text-lg font-bold leading-tight text-slate-900">{stat.value}</p>
              {stat.delta && <p className="truncate text-[11px] font-medium text-emerald-700">{stat.delta}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getDashboardSummary();
        if (isMounted) setSummary(data);
      } catch (err) {
        if (isMounted) setError('Could not load your dashboard. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <Card className="flex flex-col items-center gap-2 py-12 text-center">
        <p className="text-sm font-medium text-slate-500">Loading dashboard…</p>
      </Card>
    );
  }

  if (error || !summary) {
    return (
      <Card className="flex flex-col items-center gap-2 py-12 text-center">
        <p className="text-sm font-medium text-rose-500">{error || 'Something went wrong.'}</p>
      </Card>
    );
  }

  const {
    statCards,
    fundingPoints,
    fundingLabels,
    donationSegments,
    donationDisplayTotal,
    campaignPreview,
    recentDonations,
  } = summary;

  return (
    <>
      <StatCardGrid statCards={statCards} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Funding Overview" />
          <div className="mt-4 w-full overflow-hidden">
            <FundingChart points={fundingPoints} labels={fundingLabels} />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Donation Overview"
            action={
              <button className="flex items-center gap-1 rounded-full border border-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                This Month
                <Icon.ChevronDown className="h-3.5 w-3.5" />
              </button>
            }
          />
          {donationSegments.length === 0 ? (
            <p className="mt-6 text-center text-sm text-slate-400">No donations yet.</p>
          ) : (
            <div className="mt-4 flex flex-1 flex-col items-center gap-5 sm:flex-row">
              <Donut segments={donationSegments} centerLabel={`₹${donationDisplayTotal.toLocaleString('en-IN')}`} centerSub="Total Donation Recieved" />
              <ul className="w-full space-y-2.5">
                {donationSegments.map((seg) => (
                  <li key={seg.id} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-700">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                      {seg.label}
                    </span>
                    <span className="font-semibold text-slate-900">₹{seg.value.toLocaleString('en-IN')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="My Campaigns" action={<button onClick={() => onNavigate('campaigns')} className="text-sm font-medium text-emerald-700 hover:underline">View All →</button>} />
          {campaignPreview.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">You haven't created any campaigns yet.</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {campaignPreview.map((c) => (
                <div key={c.id}>
                  <div className={`relative h-28 w-full overflow-hidden rounded-lg bg-gradient-to-br ${c.theme}`}>
                    <button className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-700 hover:text-rose-500" aria-label={`Save ${c.title}`}>
                      <Icon.Heart className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-2 truncate text-sm font-semibold text-slate-900">{c.title}</p>
                  <p className="text-xs text-slate-500">{c.org}</p>
                  <ProgressBar value={c.fundedPct} className="mt-2" />
                  <p className="mt-1 text-[11px] font-medium text-emerald-700">{c.fundedPct}% funded</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Recent Donations" action={<button onClick={() => onNavigate('donations')} className="text-sm font-medium text-emerald-700 hover:underline">View All</button>} />
          {recentDonations.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No donations yet.</p>
          ) : (
            <ul className="mt-2 divide-y divide-slate-100">
              {recentDonations.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Avatar name={d.name} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{d.name}</p>
                      <p className="truncate text-xs text-slate-500">Donated to "{d.campaign}"</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-slate-900">₹{d.amount.toLocaleString('en-IN')}</p>
                    <p className="text-[11px] text-slate-400">{d.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
