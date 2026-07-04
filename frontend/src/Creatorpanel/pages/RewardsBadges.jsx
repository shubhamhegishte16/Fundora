import React, { useState, useEffect } from 'react';
import { Icon } from '../icons.jsx';
import Card, { CardHeader } from '../components/ui/Card.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import { getMyBadges } from '../../../services/badgeService.js';

function BadgeTile({ badge }) {
  const BadgeIcon = Icon[badge.icon] || Icon.Award;
  return (
    <div className={`rounded-xl border p-4 text-center ${badge.earned ? 'border-emerald-100 bg-emerald-50/40' : 'border-slate-100 bg-white'}`}>
      <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${badge.earned ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
        {badge.earned ? <BadgeIcon className="h-6 w-6" /> : <Icon.Lock className="h-5 w-5" />}
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-900">{badge.label}</p>
      <p className="mt-1 text-xs text-slate-500">{badge.desc}</p>
      {!badge.earned && (
        <div className="mt-3">
          <ProgressBar value={badge.progressPct} fillClassName="bg-slate-400" />
          <p className="mt-1 text-[11px] text-slate-400">{badge.progressPct}% there</p>
        </div>
      )}
      {badge.earned && (
        <p className="mt-3 flex items-center justify-center gap-1 text-[11px] font-medium text-emerald-700">
          <Icon.CheckCircle className="h-3.5 w-3.5" /> Earned
        </p>
      )}
    </div>
  );
}

export default function RewardsBadges() {
  const [badges, setBadges] = useState([]);
  const [rewardTier, setRewardTier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getMyBadges();
        if (isMounted) {
          setBadges(data.badges || []);
          setRewardTier(data.rewardTier || null);
        }
      } catch (err) {
        if (isMounted) setError('Could not load rewards. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <Card className="flex flex-col items-center gap-2 py-12 text-center">
        <p className="text-sm font-medium text-slate-500">Loading rewards…</p>
      </Card>
    );
  }

  if (error || !rewardTier) {
    return (
      <Card className="flex flex-col items-center gap-2 py-12 text-center">
        <p className="text-sm font-medium text-rose-500">{error || 'Something went wrong.'}</p>
      </Card>
    );
  }

  const atMaxTier = !rewardTier.nextTier;
  const pct = atMaxTier ? 100 : Math.round((rewardTier.points / rewardTier.pointsToNext) * 100);

  return (
    <>
      <Card>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <Icon.Trophy className="h-7 w-7" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{rewardTier.name}</p>
              <p className="text-sm text-slate-500">
                {rewardTier.points.toLocaleString('en-IN')} pts
                {!atMaxTier && ` · ${(rewardTier.pointsToNext - rewardTier.points).toLocaleString('en-IN')} pts to ${rewardTier.nextTier}`}
                {atMaxTier && ' · Highest tier reached'}
              </p>
            </div>
          </div>
          <div className="w-full sm:w-64">
            <ProgressBar value={pct} fillClassName="bg-amber-500" />
            <p className="mt-1 text-right text-[11px] text-slate-400">
              {atMaxTier ? 'Top tier' : `${pct}% to ${rewardTier.nextTier}`}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Your Badges" />
        {badges.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No badges configured yet.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {badges.map((b) => <BadgeTile key={b.id} badge={b} />)}
          </div>
        )}
      </Card>
    </>
  );
}
