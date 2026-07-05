import React, { useState, useEffect } from 'react';
import { Icon } from '../icons.jsx';
import Card from '../components/ui/Card.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { getMyFollowers } from '../../../services/followerService.js';

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

export default function FollowingCreators() {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getMyFollowers();
        if (isMounted) setFollowers(data.followers || []);
      } catch (err) {
        if (isMounted) setError('Could not load your followers. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <Card className="flex flex-col items-center gap-2 py-12 text-center">
        <p className="text-sm font-medium text-slate-500">Loading followers…</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex flex-col items-center gap-2 py-12 text-center">
        <p className="text-sm font-medium text-rose-500">{error}</p>
      </Card>
    );
  }

  if (followers.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 py-12 text-center">
        <Icon.Users className="h-8 w-8 text-slate-300" />
        <p className="text-sm font-medium text-slate-500">No followers yet — they'll show up here once donors start following you.</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {followers.map((f) => (
        <Card key={f.id} className="flex flex-col">
          <div className="flex items-center gap-3">
            <Avatar name={f.name} size="xl" tint="dark" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{f.name}</p>
              <p className="text-xs text-slate-400">Following since {timeAgo(f.followingSince)}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Icon.HeartHand className="h-3.5 w-3.5" />
              ₹{f.totalDonated.toLocaleString('en-IN')} donated
            </span>
            <span className="flex items-center gap-1">
              <Icon.Coins className="h-3.5 w-3.5" />
              {f.donationCount} donation{f.donationCount === 1 ? '' : 's'}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
