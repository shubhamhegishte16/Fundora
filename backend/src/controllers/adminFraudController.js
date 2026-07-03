import FraudAlert from '../models/FraudAlert.js';

const SEVERITY_MAP = { Critical: 'critical', High: 'high', Medium: 'medium', Low: 'low' };
const STATUS_MAP = { Open: 'open', 'Under Review': 'investigating', Resolved: 'resolved', Dismissed: 'dismissed' };
const STATUS_LABEL = { open: 'Open', investigating: 'Under Review', resolved: 'Resolved', dismissed: 'Dismissed' };
const SEVERITY_LABEL = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };

const timeAgo = (date) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

const formatAlert = (a) => {
  const campaign = a.relatedCampaign;
  const creator = a.relatedCreator || campaign?.creator;
  const creatorName = creator?.foundationName || creator?.name || 'Unknown';

  return {
    id: a._id,
    campaign: campaign?.title || a.title,
    creator: creatorName,
    reason: a.description,
    severity: SEVERITY_LABEL[a.severity],
    reported: timeAgo(a.createdAt),
    status: STATUS_LABEL[a.status],
    donations: campaign?.donorCount || 0,
    amount: campaign?.raisedAmount != null ? `₹${campaign.raisedAmount.toLocaleString('en-IN')}` : '—',
    // Simple heuristic score: lower severity/older alerts trust the entity more.
    trust: a.status === 'resolved' ? 70 : a.status === 'dismissed' ? 60 : a.severity === 'critical' ? 20 : a.severity === 'high' ? 35 : a.severity === 'medium' ? 50 : 65,
  };
};

// ─── GET /api/admin/fraud ───────────────────────────────────────────────────
// Query params: search, status (Open/Under Review/Resolved/Dismissed/All), severity (Critical/High/Medium/Low/All)
export const getFraudAlerts = async (req, res) => {
  try {
    const { search = '', status = 'All', severity = 'All' } = req.query;

    const filter = {};
    if (status !== 'All') filter.status = STATUS_MAP[status];
    if (severity !== 'All') filter.severity = SEVERITY_MAP[severity];

    let alerts = await FraudAlert.find(filter)
      .populate({ path: 'relatedCampaign', select: 'title raisedAmount donorCount creator', populate: { path: 'creator', select: 'name foundationName' } })
      .populate('relatedCreator', 'name foundationName')
      .sort({ createdAt: -1 });

    if (search) {
      const q = search.toLowerCase();
      alerts = alerts.filter((a) => {
        const campaignTitle = (a.relatedCampaign?.title || a.title || '').toLowerCase();
        const creatorName = (a.relatedCreator?.foundationName || a.relatedCreator?.name || a.relatedCampaign?.creator?.foundationName || a.relatedCampaign?.creator?.name || '').toLowerCase();
        return campaignTitle.includes(q) || creatorName.includes(q);
      });
    }

    res.json({ success: true, alerts: alerts.map(formatAlert) });
  } catch (error) {
    console.error('getFraudAlerts error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch fraud alerts' });
  }
};

// ─── GET /api/admin/fraud/stats ─────────────────────────────────────────────
export const getFraudStats = async (req, res) => {
  try {
    const [open, critical, underReview, resolved] = await Promise.all([
      FraudAlert.countDocuments({ status: 'open' }),
      FraudAlert.countDocuments({ severity: 'critical', status: { $nin: ['resolved', 'dismissed'] } }),
      FraudAlert.countDocuments({ status: 'investigating' }),
      FraudAlert.countDocuments({ status: { $in: ['resolved', 'dismissed'] } }),
    ]);
    res.json({ success: true, stats: { open, critical, underReview, resolved } });
  } catch (error) {
    console.error('getFraudStats error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch fraud stats' });
  }
};

// ─── GET /api/admin/fraud/:id ───────────────────────────────────────────────
export const getFraudAlertById = async (req, res) => {
  try {
    const alert = await FraudAlert.findById(req.params.id)
      .populate('relatedCampaign')
      .populate('relatedCreator', 'name foundationName email')
      .populate('relatedUser', 'name email')
      .populate('relatedDonation');

    if (!alert) return res.status(404).json({ success: false, message: 'Fraud alert not found' });
    res.json({ success: true, alert });
  } catch (error) {
    console.error('getFraudAlertById error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch fraud alert' });
  }
};

// ─── PATCH /api/admin/fraud/:id/status ──────────────────────────────────────
// Body: { status: 'investigating' | 'resolved' | 'dismissed', note? }
export const updateFraudStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const allowed = ['open', 'investigating', 'resolved', 'dismissed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `status must be one of: ${allowed.join(', ')}` });
    }

    const alert = await FraudAlert.findById(req.params.id);
    if (!alert) return res.status(404).json({ success: false, message: 'Fraud alert not found' });

    alert.status = status;
    if (status === 'resolved' || status === 'dismissed') {
      alert.resolvedBy = req.admin._id;
      alert.resolvedAt = new Date();
      if (note) alert.resolutionNote = note.trim();
    }
    await alert.save();

    res.json({ success: true, alert: formatAlert(await alert.populate({ path: 'relatedCampaign', select: 'title raisedAmount donorCount creator', populate: { path: 'creator', select: 'name foundationName' } })) });
  } catch (error) {
    console.error('updateFraudStatus error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update fraud alert' });
  }
};

// ─── POST /api/admin/fraud ───────────────────────────────────────────────────
// Manual flag raised by an admin. Body: { entityType, campaignId?, creatorId?, userId?, donationId?, title, description, severity? }
export const createFraudAlert = async (req, res) => {
  try {
    const { entityType, campaignId, creatorId, userId, donationId, title, description, severity = 'medium' } = req.body;

    if (!entityType || !title || !description) {
      return res.status(400).json({ success: false, message: 'entityType, title, and description are required' });
    }

    const alert = await FraudAlert.create({
      type: 'manual',
      severity,
      status: 'open',
      title,
      description,
      entityType,
      relatedCampaign: campaignId || null,
      relatedCreator: creatorId || null,
      relatedUser: userId || null,
      relatedDonation: donationId || null,
      flaggedBy: req.admin._id,
    });

    res.status(201).json({ success: true, alert });
  } catch (error) {
    console.error('createFraudAlert error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create fraud alert' });
  }
};