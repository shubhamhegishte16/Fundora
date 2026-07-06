import React, { useState } from 'react';
import { Icon } from '../../icons.jsx';
import Avatar from '../ui/Avatar.jsx';
import { getDashboardSummary } from '../../../../services/dashboardService.js';

function buildReportText(creatorName, summary) {
  const stat = (id) => summary.statCards.find((s) => s.id === id)?.value || '—';
  const topCampaign = summary.campaignPreview?.[0];

  const lines = [
    `📊 Fundora Campaign Report — ${creatorName || 'Creator'}`,
    `Generated ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`,
    '',
    `💰 Total Funds Raised: ${stat('funds')}`,
    `🎯 Total Donations: ${stat('donations')}`,
    `📢 Active Campaigns: ${stat('campaigns')}`,
    `📁 Total Campaigns: ${stat('total-campaigns')}`,
  ];

  if (topCampaign) {
    lines.push('', `Top Campaign: "${topCampaign.title}" — ${topCampaign.fundedPct}% funded`);
  }

  lines.push('', 'Shared via Fundora');
  return lines.join('\n');
}

/**
 * TopBar
 * Greeting/title on the left, bell + profile chip + the two campaign
 * CTAs on the right. `title`/`subtitle` swap per page; the CTAs and
 * profile chip stay constant since they're global app actions.
 * `creatorName`/`creatorRole`/`creatorAvatarUrl` come from the logged-in
 * creator's real profile (fetched once in CreatorPanelApp) rather than
 * being hardcoded.
 */
export default function TopBar({ title, subtitle, onMenuClick, creatorName, creatorRole, creatorAvatarUrl }) {
  const [sharing, setSharing] = useState(false);
  const [shareMsg, setShareMsg] = useState(null);

  const handleShare = async () => {
    setSharing(true);
    setShareMsg(null);
    try {
      const data = await getDashboardSummary();
      const reportText = buildReportText(creatorName, data);

      if (navigator.share) {
        await navigator.share({ title: 'Fundora Campaign Report', text: reportText });
      } else {
        await navigator.clipboard.writeText(reportText);
        setShareMsg('Report copied to clipboard!');
      }
    } catch (err) {
      // AbortError fires when the user just closes the native share sheet — not a real failure.
      if (err?.name !== 'AbortError') {
        setShareMsg('Could not prepare the report. Please try again.');
      }
    } finally {
      setSharing(false);
      setTimeout(() => setShareMsg(null), 3000);
    }
  };

  return (
    <header className="flex flex-col gap-4 px-4 pb-2 pt-4 sm:px-6 sm:pt-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex items-start gap-3">
        <button onClick={onMenuClick} className="mt-1 rounded-md p-1.5 text-slate-700 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
          <Icon.Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 lg:justify-end">
        <div className="flex items-center gap-3">
          <button className="relative rounded-full p-2 text-slate-700 hover:bg-slate-100" aria-label="Notifications">
            <Icon.Bell className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Avatar name={creatorName} src={creatorAvatarUrl} size="lg" tint="dark" />
            <div className="hidden text-sm sm:block">
              <p className="font-semibold text-slate-900">{creatorName || 'Loading…'}</p>
              <p className="text-xs text-slate-500">{creatorRole || 'Creator'}</p>
            </div>
          </div>
        </div>

        <div className="relative flex items-center gap-2">
          <button
            onClick={handleShare}
            disabled={sharing}
            className="flex items-center gap-1.5 rounded-full border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
          >
            <Icon.Share className="h-4 w-4" />
            {sharing ? 'Preparing…' : 'Share Campaign'}
          </button>
          <button className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
            <Icon.Plus className="h-4 w-4" />
            Create Campaign
          </button>

          {shareMsg && (
            <div className="absolute -bottom-9 right-0 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
              {shareMsg}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}