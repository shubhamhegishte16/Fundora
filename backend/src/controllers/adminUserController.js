import User from '../models/User.js';
import Creator from '../models/Creator.js';

// GET /api/admin/users
// Lists all Users (donors/admins signed up via the User model) AND all
// Creators (campaign creators, a separate collection/auth flow), merged
// into one shape the "Manage Users" UI understands. Donations/campaigns
// are aggregated in from their real collections.
export const getUsers = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'donations',
          localField: '_id',
          foreignField: 'donor',
          as: 'donationDocs',
        },
      },
      {
        $lookup: {
          from: 'campaigns',
          localField: '_id',
          foreignField: 'creator',
          as: 'campaignDocs',
        },
      },
      {
        $addFields: {
          donations: { $sum: '$donationDocs.amount' },
          campaigns: { $size: '$campaignDocs' },
          source: 'user',
        },
      },
      {
        $project: {
          password: 0,
          donationDocs: 0,
          campaignDocs: 0,
          __v: 0,
        },
      },
    ]);

    // Campaign creators live in a separate collection (different signup
    // flow/auth). Bring them in so they actually show up in this list.
    const creators = await Creator.aggregate([
      {
        $lookup: {
          from: 'campaigns',
          localField: '_id',
          foreignField: 'creator',
          as: 'campaignDocs',
        },
      },
      {
        $lookup: {
          from: 'donations',
          localField: '_id',
          foreignField: 'creator',
          as: 'donationDocs', // donations *received* across this creator's campaigns
        },
      },
      {
        $addFields: {
          campaigns: { $size: '$campaignDocs' },
          donations: { $sum: '$donationDocs.amount' },
          role: 'creator',
          // Map kycStatus -> the generic "kyc" field the UI already reads,
          // so Users and Creators render through the same badge logic.
          kyc: '$kycStatus',
          source: 'creator',
        },
      },
      {
        $project: {
          password: 0,
          campaignDocs: 0,
          donationDocs: 0,
          idFileUrl: 0,
          idNumber: 0,
          __v: 0,
        },
      },
    ]);

    const merged = [...users, ...creators].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.status(200).json({ success: true, users: merged });
  } catch (error) {
    console.error('getUsers error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch users' });
  }
};

// POST /api/admin/users
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: 'A user with this email already exists' });
    }

    const user = await User.create({ name, email, password, role });
    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(201).json({ success: true, user: safeUser });
  } catch (error) {
    console.error('createUser error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create user' });
  }
};

// PATCH /api/admin/users/:id
// Whitelisted partial update — covers activate, suspend, reinstate,
// make admin, verify KYC, etc. Never touches password or email here.
// Tries the User collection first; if no match, falls back to Creator
// (campaign creators live in a separate collection/schema).
const USER_ALLOWED_FIELDS = ['status', 'role', 'kyc', 'name'];
const CREATOR_ALLOWED_FIELDS = ['status', 'name'];
// The "kyc" field from the UI maps onto Creator's kycStatus enum.
const CREATOR_KYC_MAP = { verified: 'verified', pending: 'pending', 'n/a': 'pending' };

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userPatch = {};
    for (const key of USER_ALLOWED_FIELDS) {
      if (key in req.body) userPatch[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(id, userPatch, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (user) {
      const safeUser = user.toObject();
      safeUser.source = 'user';
      return res.status(200).json({ success: true, user: safeUser });
    }

    // Not a User — try Creator instead.
    const creatorPatch = {};
    for (const key of CREATOR_ALLOWED_FIELDS) {
      if (key in req.body) creatorPatch[key] = req.body[key];
    }
    if ('kyc' in req.body) {
      creatorPatch.kycStatus = CREATOR_KYC_MAP[req.body.kyc] || req.body.kyc;
    }
    // "role" is not meaningful to change for a Creator (they're always a
    // campaign creator); "Make Admin" on a creator row is a no-op here.

    const creator = await Creator.findByIdAndUpdate(id, creatorPatch, {
      new: true,
      runValidators: true,
    }).select('-password -idFileUrl -idNumber');

    if (!creator) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const safeCreator = creator.toObject();
    safeCreator.role = 'creator';
    safeCreator.kyc = safeCreator.kycStatus;
    safeCreator.source = 'creator';
    res.status(200).json({ success: true, user: safeCreator });
  } catch (error) {
    console.error('updateUser error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update user' });
  }
};

// DELETE /api/admin/users/:id
// Tries User first, falls back to Creator.
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (user) {
      return res.status(200).json({ success: true, message: 'User deleted' });
    }

    const creator = await Creator.findByIdAndDelete(id);
    if (!creator) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'Creator deleted' });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to delete user' });
  }
};
