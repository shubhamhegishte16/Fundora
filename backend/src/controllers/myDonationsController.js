import MockDonation from '../models/MockDonation.js';
import Campaign from '../models/Campaign.js';
import mongoose from 'mongoose';

export const getMyDonations = async (req, res) => {
  try {
    const email = req.user.email;
    const donations = await MockDonation.find({ donorEmail: email }).sort({ createdAt: -1 }).lean();

    const formattedDonations = await Promise.all(
      donations.map(async (donation) => {
        let campaignTitle = 'Unknown Campaign';
        let creatorName = 'Unknown Creator';
        let coverImageUrl = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&auto=format&fit=crop';
        
        try {
          if (donation.campaignId && mongoose.Types.ObjectId.isValid(donation.campaignId)) {
            const campaign = await Campaign.findById(donation.campaignId).populate('creator').lean();
            if (campaign) {
              campaignTitle = campaign.title;
              creatorName = campaign.creator?.foundationName || campaign.creator?.name || 'Unknown Creator';
              coverImageUrl = campaign.coverImageUrl || coverImageUrl;
            }
          }
        } catch(err) {
            console.error("Error fetching campaign for donation", err);
        }

        // Map status
        let mappedStatus = 'Completed';
        if (donation.status === 'pending') mappedStatus = 'In Progress';
        // You can add more status mappings here if needed, like Upcoming

        // Format date "25 Jun,2026"
        const d = new Date(donation.createdAt);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedDate = `${d.getDate()} ${months[d.getMonth()]},${d.getFullYear()}`;

        return {
          id: donation._id,
          title: campaignTitle,
          creator: creatorName,
          amount: `₹${donation.amount.toLocaleString('en-IN')}`,
          rawAmount: donation.amount,
          rawTip: donation.tip || 0,
          rawTotal: donation.total || donation.amount,
          status: mappedStatus,
          date: formattedDate,
          image: coverImageUrl,
          receiptId: donation.receiptId || `RCP-${donation._id.toString().substring(0,8)}`,
          transactionId: donation.transactionId || `TXN-${donation._id.toString().substring(0,8)}`,
          paymentMethod: donation.paymentMethod || 'N/A',
          isAnonymous: donation.isAnonymous || false,
          donorEmail: donation.donorEmail
        };
      })
    );

    res.status(200).json({
      success: true,
      data: formattedDonations
    });
  } catch (error) {
    console.error('Error fetching my donations:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
