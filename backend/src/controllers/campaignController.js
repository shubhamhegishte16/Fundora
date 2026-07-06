import Campaign from '../models/Campaign.js';
import { notifyAdmins } from '../utils/notifyAdmins.js';

// Creators may only ever place a campaign into one of these states directly.
// 'active' is admin-only (via approveCampaign); 'completed' is system-driven.
const CREATOR_ALLOWED_STATUSES = ['draft', 'pending_review'];

// ─── GET /api/creator/campaigns ────────────────────────────────────────────
// List all campaigns belonging to the logged-in creator
export const getMyCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ creator: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, campaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/creator/campaigns/:id ────────────────────────────────────────
export const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, creator: req.user._id });
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    res.json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/creator/campaigns ───────────────────────────────────────────
export const createCampaign = async (req, res) => {
  try {
    const { title, description, category, goalAmount, coverImageUrl, startDate, endDate, status } = req.body;

    if (!title || !category || !goalAmount) {
      return res.status(400).json({
        success: false,
        message: 'title, category, and goalAmount are required',
      });
    }

    if (status !== undefined && !CREATOR_ALLOWED_STATUSES.includes(status)) {
      return res.status(403).json({
        success: false,
        message: "Creators can only set status to 'draft' or 'pending_review'",
      });
    }

    // When a file is uploaded (multipart/form-data via multer), it takes
    // priority over any coverImageUrl string in the body.
    const resolvedCoverImageUrl = req.file ? `/uploads/campaigns/${req.file.filename}` : coverImageUrl;

    const campaign = await Campaign.create({
      creator: req.user._id,
      title,
      description,
      category,
      goalAmount,
      coverImageUrl: resolvedCoverImageUrl,
      startDate,
      endDate,
      status: status || 'draft',
    });

    if (campaign.status === 'pending_review') {
      await notifyAdmins({
        type: 'campaign_pending',
        title: 'New campaign pending approval',
        message: `"${campaign.title}" is awaiting review.`,
        priority: 'medium',
        relatedCampaign: campaign._id,
      });
    }

    res.status(201).json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PUT /api/creator/campaigns/:id ─────────────────────────────────────────
export const updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, creator: req.user._id });
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    if (req.body.status !== undefined && !CREATOR_ALLOWED_STATUSES.includes(req.body.status)) {
      return res.status(403).json({
        success: false,
        message: "Creators can only set status to 'draft' or 'pending_review'",
      });
    }

    const fields = ['title', 'description', 'category', 'goalAmount', 'coverImageUrl', 'status', 'startDate', 'endDate'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) campaign[f] = req.body[f];
    });

    // A newly uploaded file always wins over whatever coverImageUrl came in the body.
    if (req.file) {
      campaign.coverImageUrl = `/uploads/campaigns/${req.file.filename}`;
    }

    // Resubmitting for review clears any prior admin decision/trail.
    if (req.body.status === 'pending_review') {
      campaign.rejectionReason = null;
      campaign.reviewedBy = null;
      campaign.reviewedAt = null;
    }

    await campaign.save();

    if (req.body.status === 'pending_review') {
      await notifyAdmins({
        type: 'campaign_pending',
        title: 'New campaign pending approval',
        message: `"${campaign.title}" is awaiting review.`,
        priority: 'medium',
        relatedCampaign: campaign._id,
      });
    }

    res.json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE /api/creator/campaigns/:id ──────────────────────────────────────
export const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndDelete({ _id: req.params.id, creator: req.user._id });
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    res.json({ success: true, message: 'Campaign deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};