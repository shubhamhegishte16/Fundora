import Donation from '../models/Donation.js';
import Donor from '../models/Donor.js';

export const getMyDonations = async (req, res) => {
  try {
    const email = req.user.email;

    // Donation.donor references the Donor collection, not the User
    // collection req.user comes from — resolve that first.
    const donor = await Donor.findOne({ email: email.toLowerCase() });
    if (!donor) {
      return res.status(200).json({ success: true, data: [] });
    }

    const donations = await Donation.find({ donor: donor._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'campaign',
        select: 'title coverImageUrl creator',
        populate: { path: 'creator', select: 'foundationName name' },
      })
      .lean();

    const formattedDonations = donations.map((donation) => {
      const campaign = donation.campaign || {};
      const creator = campaign.creator || {};

      let mappedStatus = 'Completed';
      if (donation.status === 'pending') mappedStatus = 'In Progress';
      else if (donation.status === 'refunded') mappedStatus = 'Refunded';

      const d = new Date(donation.createdAt);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const formattedDate = `${d.getDate()} ${months[d.getMonth()]},${d.getFullYear()}`;

      return {
        id: donation._id,
        title: campaign.title || 'Unknown Campaign',
        creator: creator.foundationName || creator.name || 'Unknown Creator',
        amount: `₹${donation.amount.toLocaleString('en-IN')}`,
        rawAmount: donation.amount,
        rawTip: donation.tip || 0,
        rawTotal: donation.amount + (donation.tip || 0),
        status: mappedStatus,
        date: formattedDate,
        image: campaign.coverImageUrl || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&auto=format&fit=crop',
        receiptId: donation.receiptId,
        transactionId: donation.transactionId,
        paymentMethod: donation.method || 'N/A',
        isAnonymous: donation.isAnonymous || false,
        donorEmail: donor.email,
      };
    });

    res.status(200).json({ success: true, data: formattedDonations });
  } catch (error) {
    console.error('Error fetching my donations:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
