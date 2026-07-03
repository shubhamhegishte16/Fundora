import User from '../models/User.js';
import Creator from '../models/Creator.js';
import Campaign from '../models/Campaign.js';
import Donation from '../models/Donation.js';

const DAY_MS = 24 * 60 * 60 * 1000;

function pctChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

// ─── GET /api/admin/dashboard/stats ────────────────────────────────────────
// The 4 headline stat cards, each with a period-over-period % change.
export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalUsers,
      usersThisMonth,
      usersLastMonth,
      activeCampaigns,
      campaignsThisMonth,
      campaignsLastMonth,
      donationAggThis,
      donationAggLast,
      pendingCampaignReviews,
      pendingKyc,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } }),
      Campaign.countDocuments({ status: 'active' }),
      Campaign.countDocuments({ status: 'active', createdAt: { $gte: startOfThisMonth } }),
      Campaign.countDocuments({ status: 'active', createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } }),
      Donation.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: startOfThisMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Donation.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Campaign.countDocuments({ status: 'pending_review' }),
      Creator.countDocuments({ kycStatus: 'pending' }),
    ]);

    const donationsThisMonth = donationAggThis[0]?.total || 0;
    const donationsLastMonth = donationAggLast[0]?.total || 0;

    const totalDonationsAgg = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers: {
          value: totalUsers,
          change: pctChange(usersThisMonth, usersLastMonth),
          up: usersThisMonth >= usersLastMonth,
        },
        activeCampaigns: {
          value: activeCampaigns,
          change: pctChange(campaignsThisMonth, campaignsLastMonth),
          up: campaignsThisMonth >= campaignsLastMonth,
        },
        totalDonations: {
          value: totalDonationsAgg[0]?.total || 0,
          change: pctChange(donationsThisMonth, donationsLastMonth),
          up: donationsThisMonth >= donationsLastMonth,
        },
        pendingReviews: {
          value: pendingCampaignReviews + pendingKyc,
          campaigns: pendingCampaignReviews,
          kyc: pendingKyc,
        },
      },
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to load dashboard stats' });
  }
};

// ─── GET /api/admin/dashboard/donation-trend?months=6 ──────────────────────
export const getDonationTrend = async (req, res) => {
  try {
    const months = Math.min(24, Math.max(1, Number(req.query.months) || 6));
    const start = new Date();
    start.setMonth(start.getMonth() - (months - 1));
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const rows = await Donation.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: start } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          donations: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Fill in any months with zero donations so the chart has a continuous axis.
    const byKey = new Map(rows.map((r) => [`${r._id.year}-${r._id.month}`, r.donations]));
    const labels = [];
    const cursor = new Date(start);
    for (let i = 0; i < months; i++) {
      const key = `${cursor.getFullYear()}-${cursor.getMonth() + 1}`;
      labels.push({
        month: cursor.toLocaleString('en-US', { month: 'short' }),
        donations: byKey.get(key) || 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    res.json({ success: true, trend: labels });
  } catch (error) {
    console.error('getDonationTrend error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to load donation trend' });
  }
};

// ─── GET /api/admin/dashboard/category-breakdown ───────────────────────────
export const getCategoryBreakdown = async (req, res) => {
  try {
    const rows = await Campaign.aggregate([
      { $group: { _id: '$category', value: { $sum: 1 } } },
      { $sort: { value: -1 } },
    ]);

    const total = rows.reduce((s, r) => s + r.value, 0) || 1;
    const breakdown = rows.map((r) => ({
      name: r._id,
      count: r.value,
      value: Math.round((r.value / total) * 1000) / 10, // percentage
    }));

    res.json({ success: true, breakdown });
  } catch (error) {
    console.error('getCategoryBreakdown error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to load category breakdown' });
  }
};

// ─── GET /api/admin/dashboard/recent-campaigns?limit=5 ─────────────────────
export const getRecentCampaigns = async (req, res) => {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 5));
    const campaigns = await Campaign.find()
      .populate('creator', 'name foundationName')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      campaigns: campaigns.map((c) => ({
        id: c._id,
        name: c.title,
        creator: c.creator?.foundationName || c.creator?.name || 'Unknown',
        category: c.category,
        raised: c.raisedAmount,
        goal: c.goalAmount,
        pct: c.fundedPct,
        status: c.status,
      })),
    });
  } catch (error) {
    console.error('getRecentCampaigns error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to load recent campaigns' });
  }
};

// ─── GET /api/admin/dashboard/recent-donations?limit=5 ──────────────────────
export const getRecentDonations = async (req, res) => {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 5));
    const donations = await Donation.find()
      .populate('donor', 'name')
      .populate('campaign', 'title')
      .sort({ createdAt: -1 })
      .limit(limit);

    const now = Date.now();
    res.json({
      success: true,
      donations: donations.map((d) => {
        const donorName = d.isAnonymous ? 'Anonymous' : d.donor?.name || 'Unknown';
        const initials = d.isAnonymous
          ? '??'
          : donorName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
        const hours = Math.floor((now - new Date(d.createdAt).getTime()) / (60 * 60 * 1000));
        const time = hours < 1 ? 'just now' : hours < 24 ? `${hours} hr ago` : `${Math.floor(hours / 24)} day ago`;

        return {
          id: d._id,
          donor: donorName,
          campaign: d.campaign?.title || 'Unknown campaign',
          amount: d.amount,
          time,
          avatar: initials,
        };
      }),
    });
  } catch (error) {
    console.error('getRecentDonations error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to load recent donations' });
  }
};