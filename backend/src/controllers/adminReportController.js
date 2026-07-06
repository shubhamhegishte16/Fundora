import Donation from '../models/Donation.js';
import Campaign from '../models/Campaign.js';
import User from '../models/User.js';
import Creator from '../models/Creator.js';
import Donor from '../models/Donor.js';
import FraudAlert from '../models/FraudAlert.js';
import PlatformSettings from '../models/PlatformSettings.js';

// Report "types" map 1:1 to the data already shown on other admin pages
// (Donations, Manage Campaigns, Manage Users, Fraud Alerts, KYC Verification) —
// this page is a consolidated view/export layer on top of them, not a
// separate data source.
const REPORT_TYPES = [
  { key: 'donations', title: 'Donation Report', desc: 'All donations with donor, campaign, amount, method and status', sourcePage: 'Donations' },
  { key: 'campaigns', title: 'Campaign Performance Report', desc: 'Campaign funding progress, status and creator details', sourcePage: 'Manage Campaigns' },
  { key: 'users', title: 'User Activity Report', desc: 'Creators and donors, signup dates, status and KYC state', sourcePage: 'Manage Users' },
  { key: 'fraud', title: 'Fraud & Risk Report', desc: 'Flagged donations/campaigns/users and resolution status', sourcePage: 'Fraud Alerts' },
  { key: 'kyc', title: 'KYC Compliance Report', desc: 'Creator verification status and review audit trail', sourcePage: 'KYC Verification' },
  { key: 'fund-utilization', title: 'Fund Utilization Report', desc: 'Funds raised per campaign category', sourcePage: 'Analytics' },
];

const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const monthLabel = (d) => d.toLocaleDateString('en-US', { month: 'short' });

// ─── GET /api/admin/reports/overview ───────────────────────────────────────
export const getReportsOverview = async (req, res) => {
  try {
    const settings = await PlatformSettings.findById('platform');
    const feePercent = settings?.payments?.platformFeePercent ?? 5;

    const [
      raisedAgg,
      completedCampaigns,
      totalDonors,
      donationCount,
      campaignCount,
      userCount,
      openFraudCount,
      pendingKycCount,
      latestDonation,
      latestCampaign,
      latestFraud,
      latestKycReview,
    ] = await Promise.all([
      Donation.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Campaign.countDocuments({ status: 'completed' }),
      Donor.countDocuments(),
      Donation.countDocuments(),
      Campaign.countDocuments(),
      User.countDocuments(),
      FraudAlert.countDocuments({ status: { $in: ['open', 'investigating'] } }),
      Creator.countDocuments({ kycStatus: 'pending' }),
      Donation.findOne().sort({ createdAt: -1 }).select('createdAt'),
      Campaign.findOne().sort({ updatedAt: -1 }).select('updatedAt'),
      FraudAlert.findOne().sort({ updatedAt: -1 }).select('updatedAt'),
      Creator.findOne({ kycReviewedAt: { $ne: null } }).sort({ kycReviewedAt: -1 }).select('kycReviewedAt'),
    ]);

    const totalRaised = raisedAgg[0]?.total || 0;
    const platformFee = Math.round(totalRaised * (feePercent / 100));

    // ── Monthly revenue for the last 7 months (real donation totals) ──
    const now = new Date();
    const rangeStart = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const monthlyRaw = await Donation.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: rangeStart } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
          sortKey: { $min: '$createdAt' },
        },
      },
      { $sort: { sortKey: 1 } },
    ]);
    const monthlyMap = new Map(monthlyRaw.map((r) => [r._id, r.revenue]));
    const monthlyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const revenue = monthlyMap.get(monthKey(d)) || 0;
      monthlyRevenue.push({
        month: monthLabel(d),
        revenue,
        expenses: Math.round(revenue * (feePercent / 100)), // platform fee stands in for "expenses" here — there's no separate expense ledger
      });
    }

    const lastGenMap = {
      donations: latestDonation?.createdAt || null,
      campaigns: latestCampaign?.updatedAt || null,
      users: null, // set below from whichever of creator/donor is newer
      fraud: latestFraud?.updatedAt || null,
      kyc: latestKycReview?.kycReviewedAt || null,
      'fund-utilization': null,
    };
    const countMap = {
      donations: donationCount,
      campaigns: campaignCount,
      users: userCount,
      fraud: openFraudCount,
      kyc: pendingKycCount,
      'fund-utilization': campaignCount,
    };

    const timeAgo = (date) => {
      if (!date) return 'No data yet';
      const diffMs = Date.now() - new Date(date).getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins} min ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs} hr ago`;
      const days = Math.floor(hrs / 24);
      if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
      return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const reportCards = REPORT_TYPES.map((r) => ({
      ...r,
      count: countMap[r.key] ?? 0,
      lastGenerated: timeAgo(lastGenMap[r.key]),
    }));

    // ── Recent activity across all report sources, used as "Recent Reports" ──
    const recentDonations = await Donation.find({ status: 'completed' })
      .sort({ createdAt: -1 }).limit(3).select('amount createdAt');
    const recentCampaigns = await Campaign.find()
      .sort({ updatedAt: -1 }).limit(3).select('title status updatedAt');
    const recentFraud = await FraudAlert.find()
      .sort({ updatedAt: -1 }).limit(2).select('title status updatedAt');

    const recentReports = [
      ...recentDonations.map((d) => ({
        name: `Donation of ₹${d.amount.toLocaleString('en-IN')}`,
        type: 'Donations',
        date: d.createdAt,
        status: 'Ready',
      })),
      ...recentCampaigns.map((c) => ({
        name: `Campaign: ${c.title}`,
        type: 'Campaigns',
        date: c.updatedAt,
        status: c.status === 'completed' ? 'Ready' : 'In Progress',
      })),
      ...recentFraud.map((f) => ({
        name: f.title,
        type: 'Fraud',
        date: f.updatedAt,
        status: f.status === 'resolved' || f.status === 'dismissed' ? 'Ready' : 'In Progress',
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6)
      .map((r) => ({ ...r, date: new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }));

    res.status(200).json({
      success: true,
      summary: {
        totalRaised,
        platformFee,
        campaignsCompleted: completedCampaigns,
        totalDonors,
      },
      monthlyRevenue,
      reportCards,
      recentReports,
    });
  } catch (error) {
    console.error('getReportsOverview error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to load reports overview' });
  }
};

// ─── Helpers to build CSV text from arrays of plain objects ────────────────
const toCsv = (rows, columns) => {
  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const header = columns.map((c) => c.label).join(',');
  const body = rows.map((row) => columns.map((c) => escape(c.get(row))).join(',')).join('\n');
  return `${header}\n${body}`;
};

const sendCsv = (res, filename, csv) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.status(200).send(csv);
};

// ─── GET /api/admin/reports/download/:type ─────────────────────────────────
// Streams a CSV export built straight from the same collections that back
// the Donations / Manage Campaigns / Manage Users / Fraud / KYC pages.
export const downloadReport = async (req, res) => {
  try {
    const { type } = req.params;
    const dateStamp = new Date().toISOString().slice(0, 10);

    switch (type) {
      case 'donations': {
        const rows = await Donation.find().populate('donor', 'name email').populate('campaign', 'title').sort({ createdAt: -1 }).limit(2000);
        const csv = toCsv(rows, [
          { label: 'Receipt ID', get: (r) => r.receiptId },
          { label: 'Donor', get: (r) => (r.isAnonymous ? 'Anonymous' : r.donor?.name) },
          { label: 'Campaign', get: (r) => r.campaign?.title },
          { label: 'Amount', get: (r) => r.amount },
          { label: 'Method', get: (r) => r.method },
          { label: 'Status', get: (r) => r.status },
          { label: 'Date', get: (r) => new Date(r.createdAt).toISOString() },
        ]);
        return sendCsv(res, `donation-report-${dateStamp}.csv`, csv);
      }

      case 'campaigns': {
        const rows = await Campaign.find().populate('creator', 'name email').sort({ createdAt: -1 }).limit(2000);
        const csv = toCsv(rows, [
          { label: 'Title', get: (r) => r.title },
          { label: 'Creator', get: (r) => r.creator?.name },
          { label: 'Category', get: (r) => r.category },
          { label: 'Goal', get: (r) => r.goalAmount },
          { label: 'Raised', get: (r) => r.raisedAmount },
          { label: 'Donors', get: (r) => r.donorCount },
          { label: 'Status', get: (r) => r.status },
          { label: 'Created', get: (r) => new Date(r.createdAt).toISOString() },
        ]);
        return sendCsv(res, `campaign-report-${dateStamp}.csv`, csv);
      }

      case 'users': {
        const [creators, donors] = await Promise.all([
          Creator.find().sort({ createdAt: -1 }).limit(2000),
          Donor.find().sort({ createdAt: -1 }).limit(2000),
        ]);
        const rows = [
          ...creators.map((c) => ({ name: c.name, email: c.email, role: 'creator', status: c.status, kyc: c.kycStatus, createdAt: c.createdAt })),
          ...donors.map((d) => ({ name: d.name, email: d.email, role: 'donor', status: 'active', kyc: 'n/a', createdAt: d.createdAt })),
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const csv = toCsv(rows, [
          { label: 'Name', get: (r) => r.name },
          { label: 'Email', get: (r) => r.email },
          { label: 'Role', get: (r) => r.role },
          { label: 'Status', get: (r) => r.status },
          { label: 'KYC', get: (r) => r.kyc },
          { label: 'Joined', get: (r) => new Date(r.createdAt).toISOString() },
        ]);
        return sendCsv(res, `user-report-${dateStamp}.csv`, csv);
      }

      case 'fraud': {
        const rows = await FraudAlert.find().sort({ createdAt: -1 }).limit(2000);
        const csv = toCsv(rows, [
          { label: 'Title', get: (r) => r.title },
          { label: 'Type', get: (r) => r.type },
          { label: 'Severity', get: (r) => r.severity },
          { label: 'Status', get: (r) => r.status },
          { label: 'Entity Type', get: (r) => r.entityType },
          { label: 'Created', get: (r) => new Date(r.createdAt).toISOString() },
          { label: 'Resolved', get: (r) => (r.resolvedAt ? new Date(r.resolvedAt).toISOString() : '') },
        ]);
        return sendCsv(res, `fraud-report-${dateStamp}.csv`, csv);
      }

      case 'kyc': {
        const rows = await Creator.find().sort({ kycReviewedAt: -1, createdAt: -1 }).limit(2000);
        const csv = toCsv(rows, [
          { label: 'Name', get: (r) => r.name },
          { label: 'Email', get: (r) => r.email },
          { label: 'ID Type', get: (r) => r.idType },
          { label: 'KYC Status', get: (r) => r.kycStatus },
          { label: 'Rejection Reason', get: (r) => r.kycRejectionReason },
          { label: 'Reviewed At', get: (r) => (r.kycReviewedAt ? new Date(r.kycReviewedAt).toISOString() : '') },
        ]);
        return sendCsv(res, `kyc-report-${dateStamp}.csv`, csv);
      }

      case 'fund-utilization': {
        const rows = await Campaign.aggregate([
          { $match: { raisedAmount: { $gt: 0 } } },
          { $group: { _id: '$category', totalRaised: { $sum: '$raisedAmount' }, campaigns: { $sum: 1 } } },
          { $sort: { totalRaised: -1 } },
        ]);
        const csv = toCsv(rows, [
          { label: 'Category', get: (r) => r._id },
          { label: 'Total Raised', get: (r) => r.totalRaised },
          { label: 'Campaign Count', get: (r) => r.campaigns },
        ]);
        return sendCsv(res, `fund-utilization-report-${dateStamp}.csv`, csv);
      }

      default:
        return res.status(400).json({ success: false, message: `Unknown report type: ${type}` });
    }
  } catch (error) {
    console.error('downloadReport error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to generate report' });
  }
};
