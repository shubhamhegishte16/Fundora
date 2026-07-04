import Badge from '../models/Badge.js';
import Campaign from '../models/Campaign.js';
import Donation from '../models/Donation.js';
import Follow from '../models/Follow.js';

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
