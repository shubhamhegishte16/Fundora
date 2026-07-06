import Creator from '../models/Creator.js';
import Follow from '../models/Follow.js';
import Campaign from '../models/Campaign.js';
import mongoose from 'mongoose';

// Mock data generator for fields not yet in DB
const getMockStats = (creatorId) => {
  const seed = String(creatorId).charCodeAt(0) || 1;
  return {
    livesImpacted: (seed * 1234).toString() + "+",
    successRate: (80 + (seed % 15)) + "%"
  };
};

export const searchCreators = async (req, res) => {
  try {
    const { search, category } = req.query;
    
    // Find creators
    let matchQuery = { role: 'creator' };
    if (search) {
      matchQuery.name = { $regex: search, $options: 'i' };
    }
    
    const creators = await Creator.find(matchQuery).select('name avatarUrl bio');
    const creatorIds = creators.map(c => c._id);
    
    // Get their campaigns to calculate stats and determine category
    const campaigns = await Campaign.find({ creator: { $in: creatorIds }, status: { $in: ['active', 'completed'] } });
    
    // Calculate followers count
    const followersCounts = await Follow.aggregate([
      { $match: { creator: { $in: creatorIds } } },
      { $group: { _id: '$creator', count: { $sum: 1 } } }
    ]);
    const followerMap = new Map(followersCounts.map(f => [String(f._id), f.count]));
    
    // Check if the current donor follows them
    const donorId = req.user ? req.user._id : null;
    let followingSet = new Set();
    if (donorId) {
      const myFollows = await Follow.find({ donor: donorId, creator: { $in: creatorIds } });
      myFollows.forEach(f => followingSet.add(String(f.creator)));
    }
    
    let result = creators.map(creator => {
      const creatorCampaigns = campaigns.filter(c => String(c.creator) === String(creator._id));
      const activeCampaigns = creatorCampaigns.filter(c => c.status === 'active');
      
      const campaignsCount = creatorCampaigns.length;
      const totalRaised = creatorCampaigns.reduce((sum, c) => sum + (c.raisedAmount || 0), 0);
      
      // Determine primary category based on campaigns
      const categoryCounts = {};
      creatorCampaigns.forEach(c => {
        categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
      });
      let primaryCategory = 'Community';
      let maxCount = 0;
      for (const [cat, count] of Object.entries(categoryCounts)) {
        if (count > maxCount) {
          maxCount = count;
          primaryCategory = cat;
        }
      }
      
      const recentCampaign = activeCampaigns.sort((a, b) => b.createdAt - a.createdAt)[0] || creatorCampaigns.sort((a, b) => b.createdAt - a.createdAt)[0];
      
      const mockStats = getMockStats(creator._id);

      return {
        id: creator._id,
        name: creator.name,
        avatar: creator.avatarUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop",
        category: primaryCategory,
        bio: creator.bio || "Making a difference in the community.",
        campaigns: campaignsCount,
        followers: (followerMap.get(String(creator._id)) || 0) + "k", // mock 'k' for now to match UI or just the number
        rawFollowers: followerMap.get(String(creator._id)) || 0,
        totalRaised: "₹" + totalRaised.toLocaleString(),
        livesImpacted: mockStats.livesImpacted,
        successRate: mockStats.successRate,
        isFollowing: followingSet.has(String(creator._id)),
        recentCampaign: recentCampaign ? {
          title: recentCampaign.title,
          image: recentCampaign.coverImageUrl || "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&auto=format&fit=crop",
          fundedPct: recentCampaign.fundedPct,
          raised: "₹" + (recentCampaign.raisedAmount || 0).toLocaleString(),
          goal: "₹" + recentCampaign.goalAmount.toLocaleString()
        } : null
      };
    });

    if (category && category !== "All Categories") {
      result = result.filter(r => r.category === category);
    }

    res.json({ success: true, creators: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFollowingCreators = async (req, res) => {
  try {
    const donorId = req.user._id;
    
    const follows = await Follow.find({ donor: donorId }).populate('creator', 'name avatarUrl bio');
    
    // Filter out missing creators just in case
    const validFollows = follows.filter(f => f.creator);
    const creatorIds = validFollows.map(f => f.creator._id);
    
    // Get campaigns for stats
    const campaigns = await Campaign.find({ creator: { $in: creatorIds }, status: { $in: ['active', 'completed'] } });
    
    // Get followers count
    const followersCounts = await Follow.aggregate([
      { $match: { creator: { $in: creatorIds } } },
      { $group: { _id: '$creator', count: { $sum: 1 } } }
    ]);
    const followerMap = new Map(followersCounts.map(f => [String(f._id), f.count]));
    
    let result = validFollows.map(f => {
      const creator = f.creator;
      const creatorCampaigns = campaigns.filter(c => String(c.creator) === String(creator._id));
      const activeCampaigns = creatorCampaigns.filter(c => c.status === 'active');
      
      const campaignsCount = creatorCampaigns.length;
      const totalRaised = creatorCampaigns.reduce((sum, c) => sum + (c.raisedAmount || 0), 0);
      
      const categoryCounts = {};
      creatorCampaigns.forEach(c => {
        categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
      });
      let primaryCategory = 'Community';
      let maxCount = 0;
      for (const [cat, count] of Object.entries(categoryCounts)) {
        if (count > maxCount) {
          maxCount = count;
          primaryCategory = cat;
        }
      }
      
      const recentCampaign = activeCampaigns.sort((a, b) => b.createdAt - a.createdAt)[0] || creatorCampaigns.sort((a, b) => b.createdAt - a.createdAt)[0];
      
      const mockStats = getMockStats(creator._id);

      return {
        id: creator._id,
        name: creator.name,
        avatar: creator.avatarUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop",
        category: primaryCategory,
        bio: creator.bio || "Making a difference in the community.",
        campaigns: campaignsCount,
        followers: (followerMap.get(String(creator._id)) || 0) + "k", // match UI sample data format
        rawFollowers: followerMap.get(String(creator._id)) || 0,
        totalRaised: "₹" + totalRaised.toLocaleString(),
        livesImpacted: mockStats.livesImpacted,
        successRate: mockStats.successRate,
        isFollowing: true,
        recentCampaign: recentCampaign ? {
          title: recentCampaign.title,
          image: recentCampaign.coverImageUrl || "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&auto=format&fit=crop",
          fundedPct: recentCampaign.fundedPct,
          raised: "₹" + (recentCampaign.raisedAmount || 0).toLocaleString(),
          goal: "₹" + recentCampaign.goalAmount.toLocaleString()
        } : null
      };
    });
    
    const { category } = req.query;
    if (category && category !== "All Categories") {
      result = result.filter(r => r.category === category);
    }

    res.json({ success: true, creators: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleFollowCreator = async (req, res) => {
  try {
    const donorId = req.user._id;
    const { creatorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(400).json({ success: false, message: 'Invalid creator ID' });
    }

    const existingFollow = await Follow.findOne({ donor: donorId, creator: creatorId });

    if (existingFollow) {
      await Follow.deleteOne({ _id: existingFollow._id });
      return res.json({ success: true, message: 'Unfollowed creator successfully', isFollowing: false });
    } else {
      await Follow.create({ donor: donorId, creator: creatorId });
      return res.json({ success: true, message: 'Followed creator successfully', isFollowing: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
