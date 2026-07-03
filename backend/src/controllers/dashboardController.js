import Campaign from '../models/Campaign.js';
import Donation from '../models/Donation.js';

const CATEGORY_COLORS = {
  Education: '#059669',
  Environment: '#34d399',
  Health: '#3b82f6',
  'Disaster Relief': '#f97316',
  'Animal Welfare': '#a855f7',
  Community: '#eab308',
};

const DAY_MS = 24 * 60 * 60 * 1000;

function formatRelativeTime(date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? '' : 's'} ago`;
}

function pctChange(current, previous) {
  if (previous === 0) return current > 0 ? null : 0; // no baseline to compare against
  return Math.round(((current - previous) / previous) * 100);
}

// ─── GET /api/creator/dashboard ─────────────────────────────────────────────
// Single aggregated payload for the whole dashboard page: stat cards, the
// 7-day funding chart, the category donation breakdown donut, a 3-campaign
// preview, and a 4-donation preview. Kept as one endpoint since the page
// renders all of it together and the underlying reads share the same
// creator-scoped Campaign/Donation queries.
export const getDashboardSummary = async (req, res) => {
  try {
    const creatorId = req.user._id;

    const [campaigns, donations] = await Promise.all([
      Campaign.find({ creator: creatorId }).sort({ createdAt: -1 }),
      Donation.find({ creator: creatorId, status: 'completed' })
        .sort({ createdAt: -1 })
        .populate('donor', 'name')
        .populate('campaign', 'title category'),
    ]);

    // ─ Stat cards ─
    const now = Date.now();
    const last30 = donations.filter((d) => now - new Date(d.createdAt).getTime() <= 30 * DAY_MS);
    const prev30 = donations.filter((d) => {
      const age = now - new Date(d.createdAt).getTime();
      return age > 30 * DAY_MS && age <= 60 * DAY_MS;
    });

    const totalFundsRaised = donations.reduce((sum, d) => sum + d.amount, 0);
    const fundsLast30 = last30.reduce((sum, d) => sum + d.amount, 0);
    const fundsPrev30 = prev30.reduce((sum, d) => sum + d.amount, 0);
    const fundsDelta = pctChange(fundsLast30, fundsPrev30);

    const totalDonations = donations.length;
    const donationsDelta = pctChange(last30.length, prev30.length);

    const activeCampaigns = campaigns.filter((c) => c.status === 'active').length;

    const statCards = [
      {
        id: 'funds',
        label: 'Total Funds raised',
        value: `₹${totalFundsRaised.toLocaleString('en-IN')}`,
        delta: fundsDelta === null ? null : `${fundsDelta >= 0 ? '+' : ''}${fundsDelta}% than last month`,
        icon: 'HeartHand',
        tint: 'bg-emerald-50 text-emerald-700',
      },
      {
        id: 'donations',
        label: 'Total Donations',
        value: String(totalDonations),
        delta: donationsDelta === null ? null : `${donationsDelta >= 0 ? '+' : ''}${donationsDelta}% than last month`,
        icon: 'Users',
        tint: 'bg-emerald-50 text-emerald-700',
      },
      {
        id: 'campaigns',
        label: 'Active campaign',
        value: String(activeCampaigns),
        delta: null,
        icon: 'Leaf',
        tint: 'bg-slate-100 text-slate-500',
      },
      {
        id: 'total-campaigns',
        label: 'Total campaigns',
        value: String(campaigns.length),
        delta: null,
        icon: 'Flag',
        tint: 'bg-slate-100 text-slate-500',
      },
    ];

    // ─ 7-day funding chart ─
    const fundingPoints = [];
    const fundingLabels = [];
    for (let i = 6; i >= 0; i -= 1) {
      const dayStart = new Date(now - i * DAY_MS);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + DAY_MS);

      const total = donations
        .filter((d) => {
          const t = new Date(d.createdAt).getTime();
          return t >= dayStart.getTime() && t < dayEnd.getTime();
        })
        .reduce((sum, d) => sum + d.amount, 0);

      fundingPoints.push(total);
      fundingLabels.push(i % 2 === 0 ? dayStart.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '');
    }

    // ─ Donation breakdown by category (donut) ─
    const byCategory = {};
    donations.forEach((d) => {
      const category = d.campaign?.category || 'Other';
      byCategory[category] = (byCategory[category] || 0) + d.amount;
    });
    const donationSegments = Object.entries(byCategory)
      .filter(([, value]) => value > 0)
      .map(([label, value]) => ({
        id: label.toLowerCase().replace(/\s+/g, '-'),
        label,
        value,
        color: CATEGORY_COLORS[label] || '#94a3b8',
      }));
    const donationDisplayTotal = donationSegments.reduce((sum, s) => sum + s.value, 0);

    // ─ Campaign preview (3 most recent) ─
    const campaignPreview = campaigns.slice(0, 3).map((c) => ({
      id: c._id,
      title: c.title,
      org: req.user.foundationName || req.user.name,
      category: c.category,
      status: c.status,
      fundedPct: c.fundedPct,
      theme: 'from-emerald-400 to-teal-500',
    }));

    // ─ Recent donations preview (4 most recent) ─
    const recentDonations = donations.slice(0, 4).map((d) => ({
      id: d._id,
      name: d.isAnonymous ? 'Anonymous' : d.donor?.name || 'Anonymous',
      campaign: d.campaign?.title || 'Untitled campaign',
      amount: d.amount,
      time: formatRelativeTime(d.createdAt),
    }));

    res.json({
      success: true,
      statCards,
      fundingPoints,
      fundingLabels,
      donationSegments,
      donationDisplayTotal,
      campaignPreview,
      recentDonations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
