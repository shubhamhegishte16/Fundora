import Badge from '../models/Badge.js';
import Campaign from '../models/Campaign.js';
import Donation from '../models/Donation.js';
import Follow from '../models/Follow.js';

import DonorProfile from '../models/DonorProfile.js';
import RecurringDonation from '../models/RecurringDonation.js';
import DonorBadge from '../models/DonorBadge.js';
import Donor from '../models/Donor.js';
import User from '../models/User.js'; 

// Tier thresholds for the points-based reward ladder. There's no points
// ledger in the schema yet, so points are derived from real metrics below.
// This formula is a reasonable starting point — tune freely once you decide
// how you actually want creators to be scored.
const TIERS = [
  { name: 'Bronze Creator', min: 0 },
  { name: 'Silver Creator', min: 1000 },
  { name: 'Gold Creator', min: 3000 },
  { name: 'Platinum Creator', min: 5000 },
];

function computePoints({ totalRaised, supporterCount, followerCount, campaignCount }) {
  return Math.round(totalRaised / 100 + supporterCount * 5 + followerCount * 2 + campaignCount * 50);
}

function computeTier(points) {
  let current = TIERS[0];
  let next = TIERS[1] || null;
  for (let i = 0; i < TIERS.length; i += 1) {
    if (points >= TIERS[i].min) {
      current = TIERS[i];
      next = TIERS[i + 1] || null;
    }
  }
  return { name: current.name, nextTier: next?.name || null, pointsToNext: next?.min ?? points, points };
}

function metricValue(metric, ctx) {
  switch (metric) {
    case 'campaignCount': return ctx.campaignCount;
    case 'supporterCount': return ctx.supporterCount;
    case 'followerCount': return ctx.followerCount;
    case 'totalRaised': return ctx.totalRaised;
    case 'activeStreakMonths': return ctx.activeStreakMonths;
    default: return 0;
  }
}

// ─── GET /api/creator/badges ─────────────────────────────────────────────────
export const getMyBadges = async (req, res) => {
  try {
    const creatorId = req.user._id;

    const [campaigns, donations, followerCount, badgeCatalog] = await Promise.all([
      Campaign.find({ creator: creatorId }),
      Donation.find({ creator: creatorId, status: 'completed' }),
      Follow.countDocuments({ creator: creatorId }),
      Badge.find(),
    ]);

    const totalRaised = donations.reduce((sum, d) => sum + d.amount, 0);
    const supporterCount = new Set(donations.map((d) => String(d.donor))).size;
    const campaignCount = campaigns.length;

    // Active streak: consecutive months (counting back from this month) with at least one donation.
    const monthsWithDonations = new Set(
      donations.map((d) => {
        const dt = new Date(d.createdAt);
        return `${dt.getFullYear()}-${dt.getMonth()}`;
      })
    );
    let activeStreakMonths = 0;
    const cursor = new Date();
    while (true) {
      const key = `${cursor.getFullYear()}-${cursor.getMonth()}`;
      if (!monthsWithDonations.has(key)) break;
      activeStreakMonths += 1;
      cursor.setMonth(cursor.getMonth() - 1);
    }

    const ctx = { totalRaised, supporterCount, campaignCount, followerCount, activeStreakMonths };

    const badges = badgeCatalog.map((b) => {
      const value = metricValue(b.criteria.metric, ctx);
      const earned = value >= b.criteria.target;
      return {
        id: b.key,
        label: b.label,
        desc: b.description,
        icon: b.icon,
        earned,
        progressPct: earned ? 100 : Math.min(99, Math.round((value / b.criteria.target) * 100)),
      };
    });

    const points = computePoints(ctx);
    const tier = computeTier(points);

    res.json({
      success: true,
      badges,
      rewardTier: tier,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// DONOR BADGE SYSTEM
// ============================================================

export const getBadgeData = async (req, res) => {
  try {
    const userId = req.user.id;
    // console.log('=== GET BADGE STATS ===');

    // Find donor
    let donor = await Donor.findOne({ user: userId });
    if (!donor) {
      const user = await User.findById(userId);
      if (user && user.email) {
        donor = await Donor.findOne({ email: user.email });
      }
    }

    if (!donor) {
      return res.status(200).json({
        success: true,
        data: {
          totalDonations: 0,
          donationCount: 0,
          monthsActive: 0,
          isRecurring: false
        }
      });
    }

    // Get donations
    const donations = await Donation.find({ 
      donor: donor._id, 
      status: 'completed' 
    });
    
    let totalDonations = 0;
    for (const d of donations) {
      totalDonations += (d.amount || 0);
    }
    const donationCount = donations.length;

    // Check recurring
    const recurring = await RecurringDonation.findOne({
      donor: donor._id,
      status: 'active'
    });
    const isRecurring = !!recurring;

    // Calculate months active
    let monthsActive = 0;
    if (donations.length > 0) {
      const sorted = [...donations].sort((a, b) => a.createdAt - b.createdAt);
      const first = sorted[0];
      const now = new Date();
      monthsActive = (now.getFullYear() - first.createdAt.getFullYear()) * 12;
      monthsActive += now.getMonth() - first.createdAt.getMonth();
      monthsActive = Math.max(0, monthsActive);
    }

    // console.log('Stats:', { totalDonations, donationCount, monthsActive, isRecurring });

    res.status(200).json({
      success: true,
      data: {
        totalDonations,
        donationCount,
        monthsActive,
        isRecurring
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(200).json({
      success: true,
      data: {
        totalDonations: 0,
        donationCount: 0,
        monthsActive: 0,
        isRecurring: false
      }
    });
  }
};

// Simple seed for recurring (optional)
export const seedRecurringDonation = async (req, res) => {
  try {
    const userId = req.user.id;
    const donor = await Donor.findOne({ user: userId });
    
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    await RecurringDonation.deleteMany({ donor: donor._id });

    await RecurringDonation.create({
      donor: donor._id,
      amount: 100,
      frequency: 'Monthly',
      paymentMethod: 'Credit Card',
      status: 'active',
      totalDonated: 1200,
      startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      nextPaymentDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    });

    res.status(201).json({
      success: true,
      message: 'Recurring donation created'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};