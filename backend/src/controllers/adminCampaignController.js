import Campaign from '../models/Campaign.js';
import Notification from '../models/Notification.js';
import Follow from '../models/Follow.js';
import { createDonorNotification } from '../services/donorNotificationService.js';

// ─── GET /api/admin/campaigns/pending ──────────────────────────────────────
// All campaigns currently awaiting admin review.
export const getPendingCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: 'pending_review' })
      .populate('creator', 'name email')
      .sort({ createdAt: 1 }); // oldest submissions first
    res.json({ success: true, campaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/admin/campaigns ───────────────────────────────────────────────
// Every campaign regardless of status, for the full "Manage Campaigns" view.
export const getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({})
      .populate('creator', 'name email')
      .sort({ createdAt: -1 }); // newest first
    res.json({ success: true, campaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE /api/admin/campaigns/:id ────────────────────────────────────────
// Admin can remove any campaign regardless of status (active, draft, etc).
export const deleteCampaignAdmin = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    await Notification.create({
      creator: campaign.creator,
      type: 'milestone',
      title: 'Campaign removed',
      detail: `Your campaign "${campaign.title}" was removed by an administrator.`,
      relatedCampaign: campaign._id,
    });

    res.json({ success: true, message: 'Campaign deleted' });
  } catch (error) {
    console.error('deleteCampaignAdmin error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PATCH /api/admin/campaigns/:id/approve ────────────────────────────────
// pending_review -> active. Sets the live window and stamps the review trail.
export const approveCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    if (campaign.status !== 'pending_review') {
      return res.status(400).json({
        success: false,
        message: `Only campaigns pending review can be approved (current status: ${campaign.status})`,
      });
    }

    const { durationDays } = req.body || {};
    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + (Number(durationDays) || 30));

    campaign.status = 'active';
    campaign.startDate = campaign.startDate || start;
    campaign.endDate = campaign.endDate || end;
    campaign.rejectionReason = null;
    campaign.reviewedBy = req.admin._id;
    campaign.reviewedAt = new Date();

    await campaign.save();

    await Notification.create({
      creator: campaign.creator,
      type: 'milestone',
      title: 'Campaign approved',
      detail: `Your campaign "${campaign.title}" has been approved and is now live.`,
      relatedCampaign: campaign._id,
    });

    // Notify all followers
    const followers = await Follow.find({ creator: campaign.creator });
    for (const f of followers) {
      if (f.donor) {
        await createDonorNotification({
          donorId: f.donor,
          type: 'new_campaign',
          title: 'New Campaign from a Creator You Follow',
          detail: `A new campaign "${campaign.title}" is now live!`,
          category: 'Activity',
          relatedCampaign: campaign._id,
          relatedCreator: campaign.creator
        });
      }
    }

    res.json({ success: true, campaign });
  } catch (error) {
    console.error('approveCampaign error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PATCH /api/admin/campaigns/:id/reject ─────────────────────────────────
// pending_review -> draft, with a required reason so the creator can fix and resubmit.
export const rejectCampaign = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'A rejection reason is required' });
    }

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    if (campaign.status !== 'pending_review') {
      return res.status(400).json({
        success: false,
        message: `Only campaigns pending review can be rejected (current status: ${campaign.status})`,
      });
    }

    campaign.status = 'draft';
    campaign.rejectionReason = reason.trim();
    campaign.reviewedBy = req.admin._id;
    campaign.reviewedAt = new Date();

    await campaign.save();

    await Notification.create({
      creator: campaign.creator,
      type: 'milestone',
      title: 'Campaign rejected',
      detail: `Your campaign "${campaign.title}" was rejected: ${campaign.rejectionReason}`,
      relatedCampaign: campaign._id,
    });

    res.json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
