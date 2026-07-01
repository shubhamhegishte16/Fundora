import Donor from '../models/Donor.js';
import Donation from '../models/Donation.js';
import Campaign from '../models/Campaign.js';
import DonorProfile from '../models/DonorProfile.js';

export const getDashboardData = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const userName = req.user.name;

    // Resolve or create Donor reference document
    let donor = await Donor.findOne({ email: userEmail });
    if (!donor) {
      donor = await Donor.create({
        name: userName,
        email: userEmail
      });
    }

    // Get donor profile (if any) to fetch points/rewards
    let donorProfile = await DonorProfile.findOne({ user: req.user._id });
    if (!donorProfile) {
      donorProfile = await DonorProfile.create({
        user: req.user._id
      });
    }

    // Calculate stats
    // 1. All completed donations for this donor
    const donations = await Donation.find({ donor: donor._id, status: 'completed' })
      .populate('campaign');

    const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);

    // 2. Campaigns supported count (unique campaigns)
    const supportedCampaignIds = [...new Set(donations.map(d => d.campaign?._id?.toString()).filter(Boolean))];
    const campaignsSupported = supportedCampaignIds.length;

    // 3. Rewards earned (unlocked badges count)
    // Let's calculate badge unlocks dynamically or return fallback
    let badgesCount = 0;
    if (totalDonated > 0) badgesCount += 1; // Sprout Supporter
    if (campaignsSupported >= 2) badgesCount += 1; // Canopy Champion
    if (totalDonated >= 20000) badgesCount += 1; // Luminary
    if (badgesCount === 0 && totalDonated > 0) badgesCount = 1;

    // 4. Impact Score
    const impactScore = Math.floor(totalDonated / 10) + (campaignsSupported * 50);

    // 5. Recent donations (last 5)
    const recentDonations = await Donation.find({ donor: donor._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: 'campaign',
        select: 'title coverImageUrl creator category',
        populate: {
          path: 'creator',
          select: 'foundationName name'
        }
      });

    // Format recent donations for the frontend matching Figma keys
    const formattedRecentDonations = recentDonations.map(d => {
      const campaign = d.campaign || {};
      const creator = campaign.creator || {};
      return {
        id: d._id,
        title: campaign.title || 'Unknown Project',
        creator: creator.foundationName || creator.name || 'Unknown Foundation',
        status: d.status === 'completed' ? 'Completed' : d.status,
        date: new Date(d.createdAt).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }),
        image: campaign.coverImageUrl || 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=120&auto=format&fit=crop',
        amount: d.amount
      };
    });

    // 6. Category breakdown for Donut Chart
    const breakdown = {
      Education: 0,
      Environment: 0,
      Health: 0,
      Others: 0
    };

    donations.forEach(d => {
      if (d.campaign) {
        const cat = d.campaign.category;
        if (cat === 'Education' || cat === 'Environment' || cat === 'Health') {
          breakdown[cat] += d.amount;
        } else {
          breakdown.Others += d.amount;
        }
      }
    });

    // 7. Recommended Campaigns (active campaigns, limit to 3)
    const recommended = await Campaign.find({
      status: 'active',
      _id: { $nin: supportedCampaignIds }
    })
      .limit(3)
      .populate('creator', 'foundationName name');

    let recommendedCampaignsList = recommended;
    if (recommendedCampaignsList.length < 3) {
      const extra = await Campaign.find({ status: 'active' })
        .limit(3)
        .populate('creator', 'foundationName name');
      const seen = new Set(recommendedCampaignsList.map(c => c._id.toString()));
      extra.forEach(c => {
        if (!seen.has(c._id.toString()) && recommendedCampaignsList.length < 3) {
          recommendedCampaignsList.push(c);
        }
      });
    }

    const formattedRecommended = recommendedCampaignsList.map(c => {
      const creator = c.creator || {};
      return {
        id: c._id,
        title: c.title,
        creator: creator.foundationName || creator.name || 'Unknown Foundation',
        progress: c.fundedPct || 0,
        raised: `₹${c.raisedAmount.toLocaleString('en-IN')}`,
        goal: `₹${c.goalAmount.toLocaleString('en-IN')}`,
        image: c.coverImageUrl || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&auto=format&fit=crop'
      };
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalDonated,
          campaignsSupported,
          rewardsEarned: badgesCount,
          impactScore
        },
        recentDonations: formattedRecentDonations,
        categoryBreakdown: breakdown,
        recommendedCampaigns: formattedRecommended
      }
    });

  } catch (error) {
    console.error('Error fetching donor dashboard data:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error loading dashboard'
    });
  }
};
