import Donation from '../models/Donation.js';
import DonorProfile from '../models/DonorProfile.js';
import Donor from '../models/Donor.js';
import User from '../models/User.js';

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

// ==================== GET DONATION STATS ====================
export const getDonationStats = async (req, res) => {
  try {
    const userId = req.user.id;
    // console.log('=== GET DONATION STATS ===');
    // console.log('User ID:', userId);

    // Find donor
    let donor = await Donor.findOne({ user: userId });
    if (!donor) {
      const user = await User.findById(userId);
      if (user && user.email) {
        donor = await Donor.findOne({ email: user.email });
      }
    }

    if (!donor) {
      console.log('Donor not found, returning empty stats');
      return res.status(200).json({
        success: true,
        data: {
          totalDonations: 0,
          avgDonation: 0,
          donationCount: 0,
          recentDonations: [],
          lifetimeDonations: 0,
          averageDonationSize: 0,
        }
      });
    }

    console.log('Donor ID:', donor._id);

    // Get donations
    const donations = await Donation.find({ 
      donor: donor._id, 
      status: 'completed' 
    }).sort({ createdAt: -1 });

    // console.log('Found donations:', donations.length);

    const totalDonations = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const avgDonation = donations.length > 0 ? totalDonations / donations.length : 0;
    const donationCount = donations.length;

    const recentDonations = donations.slice(0, 4).map(d => ({
      amount: d.amount || 0,
      date: d.createdAt || new Date(),
      currency: d.currency || 'USD',
      campaign: d.campaign,
      duration: getDuration(d.createdAt)
    }));

    res.status(200).json({
      success: true,
      data: {
        totalDonations,
        avgDonation: Math.round(avgDonation * 100) / 100,
        donationCount,
        recentDonations,
        lifetimeDonations: totalDonations,
        averageDonationSize: Math.round(avgDonation * 100) / 100,
      }
    });

  } catch (error) {
    console.error("Error fetching donation stats:", error);
    res.status(200).json({
      success: true,
      data: {
        totalDonations: 0,
        avgDonation: 0,
        donationCount: 0,
        recentDonations: [],
        lifetimeDonations: 0,
        averageDonationSize: 0,
      }
    });
  }
};

// ==================== GET DONATION HISTORY ====================
export const getDonationHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    // console.log('=== GET DONATION HISTORY ===');
    // console.log('User ID:', userId);

    // Find donor
    let donor = await Donor.findOne({ user: userId });
    if (!donor) {
      const user = await User.findById(userId);
      if (user && user.email) {
        donor = await Donor.findOne({ email: user.email });
      }
    }

    if (!donor) {
      return res.status(200).json({
        success: true,
        data: {
          donations: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          },
        },
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const donations = await Donation.find({ 
      donor: donor._id,
      status: 'completed'
    })
      .populate('campaign', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Donation.countDocuments({ 
      donor: donor._id,
      status: 'completed'
    });

    res.status(200).json({
      success: true,
      data: {
        donations: donations.map(d => ({
          id: d._id,
          amount: d.amount || 0,
          currency: d.currency || 'USD',
          campaign: d.campaign?.title || 'Unknown Campaign',
          date: d.createdAt,
          status: d.status,
          transactionId: d.transactionId,
          isRecurring: d.isRecurring || false,
        })),
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });

  } catch (error) {
    console.error("Error fetching donation history:", error);
    res.status(200).json({
      success: true,
      data: {
        donations: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      },
    });
  }
};

// ==================== SEED SAMPLE DONATIONS ====================
export const seedSampleDonations = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('=== SEEDING DONATIONS ===');
    console.log('User ID:', userId);

    // Find donor
    let donor = await Donor.findOne({ user: userId });
    if (!donor) {
      const user = await User.findById(userId);
      if (user && user.email) {
        donor = await Donor.findOne({ email: user.email });
      }
    }

    if (!donor) {
      // console.log('Donor not found, creating one...');
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      try {
        donor = await Donor.create({
          user: userId,
          name: user.name,
          email: user.email,
          role: 'donor',
        });
        console.log('Donor created:', donor._id);
      } catch (createError) {
        if (createError.code === 11000) {
          donor = await Donor.findOne({ email: user.email });
          console.log('Found existing donor by email:', donor?._id);
        } else {
          throw createError;
        }
      }
    }

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Could not find or create donor'
      });
    }

    // console.log('Using donor ID:', donor._id);

    // Check existing donations
    const existingDonations = await Donation.find({ donor: donor._id });
    // console.log('Existing donations:', existingDonations.length);

    if (existingDonations.length > 0) {
      const total = existingDonations.reduce((sum, d) => sum + d.amount, 0);
      return res.status(200).json({
        success: true,
        message: `Found ${existingDonations.length} existing donations`,
        data: {
          donations: existingDonations,
          totalAmount: total,
          count: existingDonations.length,
          donorId: donor._id
        }
      });
    }

    // Create sample donations
    const sampleDonations = [
      {
        donor: donor._id,
        amount: 100,
        currency: 'USD',
        status: 'completed',
        paymentMethod: 'Credit Card',
        isRecurring: false,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        donor: donor._id,
        amount: 250,
        currency: 'USD',
        status: 'completed',
        paymentMethod: 'PayPal',
        isRecurring: false,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        donor: donor._id,
        amount: 500,
        currency: 'USD',
        status: 'completed',
        paymentMethod: 'Bank Transfer',
        isRecurring: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        donor: donor._id,
        amount: 750,
        currency: 'USD',
        status: 'completed',
        paymentMethod: 'Credit Card',
        isRecurring: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ];

    const created = await Donation.insertMany(sampleDonations);
    console.log('Created donations:', created.length);

    res.status(200).json({
      success: true,
      message: `Created ${created.length} sample donations`,
      data: {
        donations: created,
        totalAmount: created.reduce((sum, d) => sum + d.amount, 0),
        count: created.length,
        donorId: donor._id,
      }
    });

  } catch (error) {
    console.error('Error seeding donations:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== HELPER FUNCTIONS ====================
const getDuration = (date) => {
  if (!date) return 'N/A';
  const now = new Date();
  const diff = now - new Date(date);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
};