import Creator from '../models/Creator.js';
import { generateToken } from '../utils/jwt.js';
import { notifyAdmins } from '../utils/notifyAdmins.js';

// ─── POST /api/creator/auth/register ──────────────────────────────────────────
export const registerCreator = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      // KYC
      idType,
      idNumber,
      address,
      // Foundation / contact
      foundationName,
      phone,
    } = req.body;

    // Check if creator already exists
    const existing = await Creator.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A creator account with this email already exists',
      });
    }

    // Build creator document
    const creatorData = {
      name,
      email,
      password,
      idType: idType || 'Aadhar Card',
      idNumber,
      address,
      foundationName,
      phone,
    };

    // Attach uploaded file name if multer was used
    if (req.file) {
      creatorData.idFileUrl = req.file.filename;
    }

    const creator = await Creator.create(creatorData);

    await notifyAdmins({
      type: 'new_user',
      title: 'New user registered',
      message: `${creator.name} created an account as a Campaign Creator.`,
      priority: 'low',
      relatedCreator: creator._id,
    });

    await notifyAdmins({
      type: 'kyc_pending',
      title: 'KYC submitted',
      message: `${creator.name} submitted identity documents for verification.`,
      priority: 'medium',
      relatedCreator: creator._id,
    });

    // Generate JWT
    const token = generateToken(creator._id);

    res.status(201).json({
      success: true,
      token,
      creator: {
        id: creator._id,
        name: creator.name,
        email: creator.email,
        role: creator.role,
        foundationName: creator.foundationName,
        isVerified: creator.isVerified,
      },
    });
  } catch (error) {
    console.error('Creator register error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── POST /api/creator/auth/login ─────────────────────────────────────────────
export const loginCreator = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const creator = await Creator.findOne({ email }).select('+password');
    if (!creator) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await creator.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(creator._id);

    res.status(200).json({
      success: true,
      token,
      creator: {
        id: creator._id,
        name: creator.name,
        email: creator.email,
        role: creator.role,
        foundationName: creator.foundationName,
        isVerified: creator.isVerified,
      },
    });
  } catch (error) {
    console.error('Creator login error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── GET /api/creator/auth/me ─────────────────────────────────────────────────
export const getCreatorMe = async (req, res) => {
  try {
    const creator = await Creator.findById(req.user.id);
    if (!creator) {
      return res.status(404).json({
        success: false,
        message: 'Creator not found',
      });
    }
    res.status(200).json({
      success: true,
      creator,
    });
  } catch (error) {
    console.error('Creator getMe error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── PATCH /api/creator/auth/me ────────────────────────────────────────────────
// Updates editable profile fields. Email/role are intentionally left out —
// email changes and role changes aren't exposed through this endpoint.
export const updateCreatorProfile = async (req, res) => {
  try {
    const { name, phone, location, bio, foundationName } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (location !== undefined) updates.location = location;
    if (bio !== undefined) updates.bio = bio;
    if (foundationName !== undefined) updates.foundationName = foundationName;

    const creator = await Creator.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!creator) {
      return res.status(404).json({ success: false, message: 'Creator not found' });
    }

    res.status(200).json({ success: true, creator });
  } catch (error) {
    console.error('Creator updateProfile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PATCH /api/creator/auth/notification-prefs ───────────────────────────────
export const updateCreatorNotificationPrefs = async (req, res) => {
  try {
    const { donations, milestones, followers, community } = req.body;

    const updates = {};
    if (donations !== undefined) updates['notificationPrefs.donations'] = donations;
    if (milestones !== undefined) updates['notificationPrefs.milestones'] = milestones;
    if (followers !== undefined) updates['notificationPrefs.followers'] = followers;
    if (community !== undefined) updates['notificationPrefs.community'] = community;

    const creator = await Creator.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true });

    if (!creator) {
      return res.status(404).json({ success: false, message: 'Creator not found' });
    }

    res.status(200).json({ success: true, notificationPrefs: creator.notificationPrefs });
  } catch (error) {
    console.error('Creator updateNotificationPrefs error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PATCH /api/creator/auth/change-password ──────────────────────────────────
export const changeCreatorPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const creator = await Creator.findById(req.user.id).select('+password');
    if (!creator) {
      return res.status(404).json({ success: false, message: 'Creator not found' });
    }

    const isMatch = await creator.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    creator.password = newPassword; // pre('save') hook re-hashes this
    await creator.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Creator changePassword error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// ─── POST /api/creator/auth/avatar ────────────────────────────────────────────
// Separate endpoint from updateCreatorProfile since this one is multipart
// (multer-handled file), while profile text-field edits stay plain JSON.
export const uploadCreatorAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file was uploaded' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const creator = await Creator.findByIdAndUpdate(
      req.user.id,
      { avatarUrl },
      { new: true }
    );

    if (!creator) {
      return res.status(404).json({ success: false, message: 'Creator not found' });
    }

    res.status(200).json({ success: true, avatarUrl, creator });
  } catch (error) {
    console.error('Creator uploadAvatar error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
