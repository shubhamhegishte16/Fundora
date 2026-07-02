import User from '../models/User.js';

// GET /api/admin/users
// Lists all users, with donations/campaigns aggregated in if those
// collections exist. Adjust the $lookup field names to match your
// actual Donation/Campaign schemas (or remove the lookups and just
// return 0 for both if you don't have those collections yet).
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
      { $sort: { createdAt: -1 } },
    ]);

    res.status(200).json({ success: true, users });
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
const ALLOWED_FIELDS = ['status', 'role', 'kyc', 'name'];

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const patch = {};
    for (const key of ALLOWED_FIELDS) {
      if (key in req.body) patch[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(id, patch, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('updateUser error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update user' });
  }
};

// DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to delete user' });
  }
};