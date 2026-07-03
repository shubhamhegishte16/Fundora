import Donation from '../models/Donation.js';

// ─── GET /api/admin/donations ──────────────────────────────────────────────
// Query params: search, method, status, page, limit
export const getDonations = async (req, res) => {
  try {
    const { search = '', method = 'All', status = 'All' } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

    const match = {};
    if (method !== 'All') match.method = method;
    if (status !== 'All') match.status = status.toLowerCase();

    const pipeline = [
      { $match: match },
      {
        $lookup: { from: 'donors', localField: 'donor', foreignField: '_id', as: 'donorDoc' },
      },
      { $unwind: { path: '$donorDoc', preserveNullAndEmptyArrays: true } },
      {
        $lookup: { from: 'campaigns', localField: 'campaign', foreignField: '_id', as: 'campaignDoc' },
      },
      { $unwind: { path: '$campaignDoc', preserveNullAndEmptyArrays: true } },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'donorDoc.name': { $regex: search, $options: 'i' } },
            { 'donorDoc.email': { $regex: search, $options: 'i' } },
            { 'campaignDoc.title': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    pipeline.push({ $sort: { createdAt: -1 } });

    const countPipeline = [...pipeline, { $count: 'total' }];
    pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });

    const [rows, countRows] = await Promise.all([
      Donation.aggregate(pipeline),
      Donation.aggregate(countPipeline),
    ]);

    const total = countRows[0]?.total || 0;

    const donations = rows.map((d) => ({
      id: d._id,
      donor: d.isAnonymous ? 'Anonymous' : d.donorDoc?.name || 'Unknown',
      email: d.isAnonymous ? '—' : d.donorDoc?.email || '—',
      campaign: d.campaignDoc?.title || 'Unknown campaign',
      amount: d.amount,
      date: d.createdAt,
      method: d.method,
      status: d.status.charAt(0).toUpperCase() + d.status.slice(1),
      anonymous: d.isAnonymous,
      flagged: d.isFlagged,
    }));

    res.json({
      success: true,
      donations,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('getDonations error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch donations' });
  }
};

// ─── GET /api/admin/donations/summary ──────────────────────────────────────
export const getDonationsSummary = async (req, res) => {
  try {
    const [totals, byStatus, chart] = await Promise.all([
      Donation.aggregate([{ $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      Donation.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Donation.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) } } },
        {
          $group: {
            _id: { $dateToString: { format: '%d %b', date: '$createdAt' } },
            amount: { $sum: '$amount' },
            sortKey: { $min: '$createdAt' },
          },
        },
        { $sort: { sortKey: 1 } },
      ]),
    ]);

    const statusCounts = Object.fromEntries(byStatus.map((s) => [s._id, s.count]));
    const anonCount = await Donation.countDocuments({ isAnonymous: true });

    res.json({
      success: true,
      summary: {
        totalAmount: totals[0]?.total || 0,
        totalCount: totals[0]?.count || 0,
        completedCount: statusCounts.completed || 0,
        pendingCount: statusCounts.pending || 0,
        refundedCount: statusCounts.refunded || 0,
        anonymousCount: anonCount,
      },
      chart: chart.map((c) => ({ date: c._id, amount: c.amount })),
    });
  } catch (error) {
    console.error('getDonationsSummary error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch donation summary' });
  }
};

// ─── GET /api/admin/donations/:id ──────────────────────────────────────────
export const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email')
      .populate('campaign', 'title')
      .populate('creator', 'name foundationName email');

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    res.json({ success: true, donation });
  } catch (error) {
    console.error('getDonationById error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch donation' });
  }
};

// ─── PATCH /api/admin/donations/:id/refund ─────────────────────────────────
export const refundDonation = async (req, res) => {
  try {
    const { reason } = req.body || {};
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (donation.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: `Only completed donations can be refunded (current status: ${donation.status})`,
      });
    }

    donation.status = 'refunded';
    donation.refundedBy = req.admin._id;
    donation.refundedAt = new Date();
    donation.refundReason = reason?.trim() || null;
    await donation.save();

    // Reverse this donation's contribution to the campaign's running totals.
    const Campaign = (await import('../models/Campaign.js')).default;
    await Campaign.findByIdAndUpdate(donation.campaign, { $inc: { raisedAmount: -donation.amount } });

    res.json({ success: true, donation });
  } catch (error) {
    console.error('refundDonation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to refund donation' });
  }
};