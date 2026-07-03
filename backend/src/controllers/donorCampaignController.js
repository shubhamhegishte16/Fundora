import Campaign from '../models/Campaign.js';

export const getAllActiveCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: 'active' })
      .populate('creator', 'foundationName name address')
      .sort({ createdAt: -1 });

    const formattedCampaigns = campaigns.map(c => {
      const creator = c.creator || {};
      const creatorName = creator.foundationName || creator.name || 'Unknown';
      const initials = creatorName.substring(0, 2).toUpperCase();
      
      return {
        id: c._id,
        title: c.title,
        creator: creatorName,
        progress: c.fundedPct || 0,
        daysLeft: c.daysLeft || 0,
        raised: c.raisedAmount || 0,
        goal: c.goalAmount || 0,
        image: c.coverImageUrl || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&auto=format&fit=crop',
        description: c.description || 'No description provided.',
        creatorInitials: initials,
        creatorLocation: creator.address || 'India',
        donorCount: c.donorCount || 0,
        followers: 0 // Mocked for now, as we don't have this field
      };
    });

    res.status(200).json({
      success: true,
      data: formattedCampaigns
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error loading campaigns'
    });
  }
};
