import Donation from '../models/Donation.js';

// ─── GET /api/creator/donations ─────────────────────────────────────────────
// Returns every donation across the creator's campaigns (all statuses) plus
// a small summary block. Filtering by status is done client-side, same
// pattern as MyCampaigns filtering campaigns by status.
export const getMyDonations = async (req, res) => {
  try {
    const creatorId = req.user._id;

    const donations = await Donation.find({ creator: creatorId })
      .sort({ createdAt: -1 })
      .populate('donor', 'name')
      .populate('campaign', 'title');

    const formatted = donations.map((d) => ({
      id: d._id,
      name: d.isAnonymous ? 'Anonymous' : d.donor?.name || 'Anonymous',
      campaign: d.campaign?.title || 'Untitled campaign',
      amount: d.amount,
      date: new Date(d.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: d.status,
      message: d.message || null,
    }));

    const completed = formatted.filter((d) => d.status === 'completed');
    const totalReceived = completed.reduce((sum, d) => sum + d.amount, 0);
    const averageDonation = completed.length ? Math.round(totalReceived / completed.length) : 0;

    res.json({
      success: true,
      donations: formatted,
      summary: {
        totalReceived,
        totalDonations: formatted.length,
        averageDonation,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
