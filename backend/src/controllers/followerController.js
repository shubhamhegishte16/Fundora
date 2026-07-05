import Follow from '../models/Follow.js';
import Donation from '../models/Donation.js';

// ─── GET /api/creator/followers ──────────────────────────────────────────────
export const getMyFollowers = async (req, res) => {
  try {
    const creatorId = req.user._id;

    const follows = await Follow.find({ creator: creatorId })
      .sort({ createdAt: -1 })
      .populate('donor', 'name email avatarUrl');

    const donorIds = follows.map((f) => f.donor?._id).filter(Boolean);

    // Total donated per follower, so the card can show more than just "follows you".
    const donationTotals = await Donation.aggregate([
      { $match: { creator: creatorId, donor: { $in: donorIds }, status: 'completed' } },
      { $group: { _id: '$donor', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    const totalsByDonor = new Map(donationTotals.map((d) => [String(d._id), d]));

    const followers = follows
      .filter((f) => f.donor) // guard against a dangling ref if a Donor doc was ever removed
      .map((f) => {
        const totals = totalsByDonor.get(String(f.donor._id));
        return {
          id: f.donor._id,
          name: f.donor.name,
          avatarUrl: f.donor.avatarUrl || null,
          followingSince: f.createdAt,
          totalDonated: totals?.total || 0,
          donationCount: totals?.count || 0,
        };
      });

    res.json({ success: true, followers, totalFollowers: followers.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
