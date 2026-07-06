import mongoose from 'mongoose';
import Donation from '../models/Donation.js';
import Campaign from '../models/Campaign.js';
import Donor from '../models/Donor.js';
import { notifyAdmins } from '../utils/notifyAdmins.js';
import { createDonorNotification } from '../services/donorNotificationService.js';

// Donations at or above this amount trigger a "large donation" admin notification.
const LARGE_DONATION_THRESHOLD = 10000;

function buildReceipt(donation, campaign, donor) {
  const creatorName = campaign.creator?.foundationName || campaign.creator?.name || 'Unknown Creator';
  return {
    receiptId: donation.receiptId,
    date: new Date(donation.createdAt).toLocaleString(),
    transactionId: donation.transactionId,
    campaign: {
      title: campaign.title || 'Unknown Campaign',
      creator: creatorName,
    },
    donation: {
      amount: donation.amount,
      tip: donation.tip || 0,
      total: donation.amount + (donation.tip || 0),
    },
    paymentMethod: donation.method,
    isAnonymous: donation.isAnonymous,
    donor: donation.isAnonymous ? 'Anonymous Donor' : (donor.name || 'User'),
    donorEmail: donor.email,
    campaignId: campaign._id,
    status: donation.status,
    createdAt: donation.createdAt,
  };
}

// ─── POST /api/mock-donations ───────────────────────────────────────────────
// Kept at the same path/name the donor frontend already calls
// (MockDonationServices.js) — internally this now writes a real Donation
// document instead of the old MockDonation collection, so it actually flows
// into the creator dashboard, donations list, badges, and campaign totals
// via Donation's post-save hook.
export const processDonation = async (req, res) => {
  try {
    const {
      campaignId,
      donorName,
      donorEmail,
      amount,
      tip = 0,
      paymentMethod,
      isAnonymous = false,
    } = req.body;

    if (!campaignId || !mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ success: false, error: 'A valid campaign ID is required' });
    }
    if (!donorEmail) {
      return res.status(400).json({ success: false, error: 'Donor email is required' });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Valid donation amount is required' });
    }

    const campaign = await Campaign.findById(campaignId).populate('creator', 'foundationName name');
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    // Resolve or create the Donor reference doc (the actual authenticated
    // identity lives on User; Donor is the lightweight display record that
    // Donation/Follow/Community reference).
    let donor = await Donor.findOne({ email: donorEmail.toLowerCase() });
    if (!donor) {
      donor = await Donor.create({
        name: isAnonymous ? 'Anonymous' : (donorName || 'Anonymous'),
        email: donorEmail,
      });
    }

    const donation = await Donation.create({
      donor: donor._id,
      campaign: campaign._id,
      creator: campaign.creator?._id || campaign.creator,
      amount: Number(amount),
      tip: Number(tip) || 0,
      isAnonymous: Boolean(isAnonymous),
      method: paymentMethod || 'Other',
      status: 'completed',
    });

    await createDonorNotification({
      donorId: donor._id,
      type: 'donation',
      title: 'Donation Successful',
      detail: `Your donation of ₹${donation.amount.toLocaleString('en-IN')} to "${campaign.title}" was successful.`,
      category: 'Receipt',
      relatedCampaign: campaign._id
    });

    if (donation.amount >= LARGE_DONATION_THRESHOLD) {
      const donorLabel = isAnonymous ? 'An anonymous donor' : (donor.name || 'A donor');
      await notifyAdmins({
        type: 'large_donation',
        title: 'Large donation received',
        message: `${donorLabel} donated ₹${donation.amount.toLocaleString('en-IN')} on "${campaign.title}".`,
        priority: 'medium',
        relatedDonation: donation._id,
        relatedCampaign: campaign._id,
      });
    }

    res.status(201).json({
      success: true,
      receipt: buildReceipt(donation, campaign, donor),
      donationId: donation._id,
    });
  } catch (error) {
    console.error('Donation processing error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to process donation' });
  }
};

// ─── GET /api/mock-donations ─────────────────────────────────────────────────
export const getAllDonationsList = async (req, res) => {
  try {
    const donations = await Donation.find()
      .sort({ createdAt: -1 })
      .populate('donor', 'name email')
      .populate('campaign', 'title');
    res.json({ success: true, donations });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch donations' });
  }
};

// ─── GET /api/mock-donations/campaign/:campaignId ───────────────────────────
export const getCampaignDonationsList = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const filter = { campaign: campaignId, status: 'completed' };
    const [donations, total] = await Promise.all([
      Donation.find(filter).sort({ createdAt: -1 }).limit(20).populate('donor', 'name'),
      Donation.countDocuments(filter),
    ]);
    res.json({ success: true, donations, total });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch donations' });
  }
};

// ─── GET /api/mock-donations/stats/:campaignId ──────────────────────────────
export const getCampaignDonationStats = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }
    res.json({
      success: true,
      stats: {
        totalRaised: campaign.raisedAmount || 0,
        totalDonors: campaign.donorCount || 0,
        progress: campaign.fundedPct || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
};

// ─── GET /api/mock-donations/transaction/:transactionId ─────────────────────
export const getDonationByTransaction = async (req, res) => {
  try {
    const donation = await Donation.findOne({ transactionId: req.params.transactionId })
      .populate('donor', 'name email')
      .populate('campaign', 'title');
    if (!donation) {
      return res.status(404).json({ success: false, error: 'Donation not found' });
    }
    res.json({ success: true, donation });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch donation' });
  }
};