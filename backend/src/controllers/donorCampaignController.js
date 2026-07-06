import Campaign from '../models/Campaign.js';
import DonorProfile from '../models/DonorProfile.js';
import { createDonorNotification } from '../services/donorNotificationService.js';

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

export const toggleSaveCampaign = async (req, res) => {
  try {
    const campaignId = req.params.id;
    let donorProfile = await DonorProfile.findOne({ user: req.user._id });
    
    if (!donorProfile) {
      donorProfile = await DonorProfile.create({ user: req.user._id });
    }

    const savedIndex = donorProfile.savedCampaigns.indexOf(campaignId);
    let isSaved = false;
    
    if (savedIndex === -1) {
      donorProfile.savedCampaigns.push(campaignId);
      isSaved = true;
    } else {
      donorProfile.savedCampaigns.splice(savedIndex, 1);
    }
    
    await donorProfile.save();

    if (isSaved) {
      await createDonorNotification({
        donorId: req.user._id,
        type: 'saved_campaign',
        title: 'Campaign Saved',
        detail: 'You have successfully saved a campaign to your list.',
        category: 'Activity',
        relatedCampaign: campaignId
      });
    }

    res.status(200).json({
      success: true,
      message: isSaved ? 'Campaign saved' : 'Campaign removed from saved',
      isSaved
    });
  } catch (error) {
    console.error('Error toggling save campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Server error saving campaign'
    });
  }
};

export const getSavedCampaigns = async (req, res) => {
  try {
    const donorProfile = await DonorProfile.findOne({ user: req.user._id })
      .populate({
        path: 'savedCampaigns',
        populate: {
          path: 'creator',
          select: 'foundationName name address'
        }
      });

    if (!donorProfile || !donorProfile.savedCampaigns) {
      return res.status(200).json({ success: true, data: [] });
    }

    const campaigns = donorProfile.savedCampaigns;

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
        category: c.category || 'Others',
        saved: true
      };
    });

    res.status(200).json({
      success: true,
      data: formattedCampaigns
    });
  } catch (error) {
    console.error('Error fetching saved campaigns:', error);
    res.status(500).json({
      success: false,
      message: 'Server error loading saved campaigns'
    });
  }
};
