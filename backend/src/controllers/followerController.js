import Follow from '../models/Follow.js';
import Creator from '../models/Creator.js';
import Donor from '../models/Donor.js';
import Donation from '../models/Donation.js';
import User from '../models/User.js';

// ==================== GET ALL FOLLOWERS ====================
export const getMyFollowers = async (req, res) => {
  try {
    const creatorId = req.user.id;
    // console.log('=== GET FOLLOWERS ===');
    // console.log('Creator ID:', creatorId);

    // Find all followers for this creator
    const follows = await Follow.find({ creator: creatorId })
      .populate('donor')
      .sort({ createdAt: -1 });

    // console.log(`Found ${follows.length} follows`);

    const followers = [];
    
    for (const follow of follows) {
      if (!follow.donor) {
        console.log('No donor found for follow:', follow._id);
        continue;
      }

      const donor = follow.donor;
      // console.log(`Processing donor: ${donor.name} (${donor.email})`);

      // METHOD 1: Find donations by donor email
      let donations = await Donation.find({});
      
      // Filter donations where donor email matches
      const matchedDonations = donations.filter(d => {
        // If donation has donor populated, check email
        if (d.donor && d.donor.email) {
          return d.donor.email === donor.email;
        }
        // If donation has donor ID, find the donor and check email
        if (d.donor) {
          // We need to check if this donor ID matches our donor
          return d.donor.toString() === donor._id.toString();
        }
        return false;
      });

      console.log(`Found ${matchedDonations.length} donations for donor ${donor.name}`);

      // Calculate totals
      let totalDonated = 0;
      let donationCount = matchedDonations.length;
      
      for (const donation of matchedDonations) {
        totalDonated += (donation.amount || 0);
      }

      // Build follower object
      const followerData = {
        id: donor._id,
        name: donor.name || 'Anonymous Donor',
        email: donor.email || '',
        avatar: donor.avatarUrl || null,
        followingSince: follow.createdAt,
        totalDonated: totalDonated,
        donationCount: donationCount,
        followedAt: follow.createdAt,
      };
      
      // console.log(`${followerData.name}: ${donationCount} donations, ₹${totalDonated}`);
      followers.push(followerData);
    }

    // console.log(`Returning ${followers.length} followers`);
    
    res.status(200).json({
      success: true,
      followers: followers,
      count: followers.length,
    });

  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch followers',
    });
  }
};