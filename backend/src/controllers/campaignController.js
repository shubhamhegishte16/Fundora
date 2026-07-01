import Campaign from '../models/Campaign.js';

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

    const campaign = await Campaign.create({
      creator: req.user._id,
      title,
      description,
      category,
      goalAmount,
      coverImageUrl,
      startDate,
      endDate,
      status: status || 'draft',
    });

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

    const fields = ['title', 'description', 'category', 'goalAmount', 'coverImageUrl', 'status', 'startDate', 'endDate'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) campaign[f] = req.body[f];
    });

    await campaign.save();
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
