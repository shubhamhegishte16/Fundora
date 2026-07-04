import Donation from '../models/Donation.js';
import Campaign from '../models/Campaign.js';
import Creator from '../models/Creator.js';
import Donor from '../models/Donor.js';

// Period -> { windowDays, granularity, buckets }
// 7D/30D group by day, 7M/1Y group by month. `windowDays` also defines the
// "previous period" comparison window used for the KPI % change figures.
const PERIOD_CONFIG = {
  '7D': { days: 7, granularity: 'day', buckets: 7 },
  '30D': { days: 30, granularity: 'day', buckets: 30 },
  '7M': { days: 210, granularity: 'month', buckets: 7 },
  '1Y': { days: 365, granularity: 'month', buckets: 12 },
};

const pctChange = (current, previous) => {
  if (!previous) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

// ─── GET /api/admin/analytics/overview ─────────────────────────────────────
// Query params: period (7D | 30D | 7M | 1Y), default 7M
export const getAnalyticsOverview = async (req, res) => {
  try {
    const period = PERIOD_CONFIG[req.query.period] ? req.query.period : '7M';
    const { days, granularity, buckets } = PERIOD_CONFIG[period];

    const now = new Date();
    const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const prevPeriodStart = new Date(periodStart.getTime() - days * 24 * 60 * 60 * 1000);

    const dateFormat = granularity === 'day' ? '%d %b' : '%b %Y';

    // ── KPI figures: current period vs immediately preceding period of equal length ──
    const [
      currentDonations, previousDonations,
      currentNewCreators, previousNewCreators,
      currentNewDonors, previousNewDonors,
      activeCampaignsCount,
      previousActiveCampaignsCount,
    ] = await Promise.all([
      Donation.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: periodStart } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Donation.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: prevPeriodStart, $lt: periodStart } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Creator.countDocuments({ createdAt: { $gte: periodStart } }),
      Creator.countDocuments({ createdAt: { $gte: prevPeriodStart, $lt: periodStart } }),
      Donor.countDocuments({ createdAt: { $gte: periodStart } }),
      Donor.countDocuments({ createdAt: { $gte: prevPeriodStart, $lt: periodStart } }),
      Campaign.countDocuments({ status: 'active' }),
      Campaign.countDocuments({ status: 'active', createdAt: { $lt: periodStart } }),
    ]);

    const revenueNow = currentDonations[0]?.total || 0;
    const revenuePrev = previousDonations[0]?.total || 0;
    const countNow = currentDonations[0]?.count || 0;
    const countPrev = previousDonations[0]?.count || 0;
    const avgNow = countNow ? revenueNow / countNow : 0;
    const avgPrev = countPrev ? revenuePrev / countPrev : 0;
    const newUsersNow = currentNewCreators + currentNewDonors;
    const newUsersPrev = previousNewCreators + previousNewDonors;

    const kpis = {
      totalRevenue: { value: revenueNow, change: pctChange(revenueNow, revenuePrev) },
      newUsers: { value: newUsersNow, change: pctChange(newUsersNow, newUsersPrev) },
      activeCampaigns: { value: activeCampaignsCount, change: pctChange(activeCampaignsCount, previousActiveCampaignsCount) },
      avgDonation: { value: Math.round(avgNow), change: pctChange(avgNow, avgPrev) },
    };

    // ── Main trend chart: donations, new campaigns, new users per bucket ──
    // Grouped by formatted label (day or month) with a separate min-date
    // sortKey, mirroring the pattern already used in
    // adminDonationController.getDonationsSummary — avoids relying on
    // $dateTrunc, which needs a newer MongoDB version.
    const groupByLabel = (dateField) => ({
      _id: { $dateToString: { format: dateFormat, date: dateField } },
      sortKey: { $min: dateField },
    });

    const [donationTrend, campaignTrend, creatorTrend, donorTrend] = await Promise.all([
      Donation.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: periodStart } } },
        { $group: { ...groupByLabel('$createdAt'), donations: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { sortKey: 1 } },
      ]),
      Campaign.aggregate([
        { $match: { createdAt: { $gte: periodStart } } },
        { $group: { ...groupByLabel('$createdAt'), campaigns: { $sum: 1 } } },
      ]),
      Creator.aggregate([
        { $match: { createdAt: { $gte: periodStart } } },
        { $group: { ...groupByLabel('$createdAt'), users: { $sum: 1 } } },
      ]),
      Donor.aggregate([
        { $match: { createdAt: { $gte: periodStart } } },
        { $group: { ...groupByLabel('$createdAt'), users: { $sum: 1 } } },
      ]),
    ]);

    // Merge the four series into one map keyed by formatted label
    const bucketMap = new Map();

    donationTrend.forEach((r) => {
      bucketMap.set(r._id, { label: r._id, sortKey: r.sortKey, donations: r.donations, avgDonation: r.count ? Math.round(r.donations / r.count) : 0, campaigns: 0, users: 0 });
    });
    campaignTrend.forEach((r) => {
      const existing = bucketMap.get(r._id) || { label: r._id, sortKey: r.sortKey, donations: 0, avgDonation: 0, campaigns: 0, users: 0 };
      existing.campaigns = r.campaigns;
      bucketMap.set(r._id, existing);
    });
    [...creatorTrend, ...donorTrend].forEach((r) => {
      const existing = bucketMap.get(r._id) || { label: r._id, sortKey: r.sortKey, donations: 0, avgDonation: 0, campaigns: 0, users: 0 };
      existing.users = (existing.users || 0) + r.users;
      bucketMap.set(r._id, existing);
    });

    const trend = Array.from(bucketMap.values())
      .sort((a, b) => new Date(a.sortKey) - new Date(b.sortKey))
      .slice(-buckets)
      .map(({ label, donations, campaigns, users, avgDonation }) => ({ label, donations, campaigns, users, avgDonation }));

    // ── This week: daily donation totals for the last 7 days (always daily, regardless of period) ──
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekTrendRaw = await Donation.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: weekStart } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          amount: { $sum: '$amount' },
          sortKey: { $min: '$createdAt' },
        },
      },
      { $sort: { sortKey: 1 } },
    ]);
    const weekly = weekTrendRaw.map((r) => ({
      day: new Date(r.sortKey).toLocaleDateString('en-US', { weekday: 'short' }),
      amount: r.amount,
    }));

    // ── Category distribution: share of total raised funds by campaign category ──
    const categoryRaw = await Campaign.aggregate([
      { $match: { raisedAmount: { $gt: 0 } } },
      { $group: { _id: '$category', amount: { $sum: '$raisedAmount' } } },
      { $sort: { amount: -1 } },
    ]);
    const categoryTotal = categoryRaw.reduce((sum, c) => sum + c.amount, 0);
    const category = categoryRaw.map((c) => ({
      name: c._id,
      amount: c.amount,
      value: categoryTotal ? Math.round((c.amount / categoryTotal) * 1000) / 10 : 0,
    }));

    // ── Top performing campaigns by funded percentage (active/completed only) ──
    const topCampaignsRaw = await Campaign.find({ status: { $in: ['active', 'completed'] }, goalAmount: { $gt: 0 } })
      .sort({ raisedAmount: -1 })
      .limit(5)
      .select('title raisedAmount goalAmount');
    const topCampaigns = topCampaignsRaw.map((c) => ({
      name: c.title,
      raised: c.raisedAmount,
      goal: c.goalAmount,
      pct: Math.min(100, Math.round((c.raisedAmount / c.goalAmount) * 100)),
    }));

    res.json({
      success: true,
      period,
      kpis,
      trend,
      weekly,
      category,
      topCampaigns,
    });
  } catch (error) {
    console.error('getAnalyticsOverview error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch analytics' });
  }
};