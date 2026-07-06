import Admin from '../models/Admin.js';
import PlatformSettings from '../models/PlatformSettings.js';

// ─── GET /api/admin/settings/profile ───────────────────────────────────────
// req.admin is already the fresh, password-free doc from protectAdmin.
export const getProfile = async (req, res) => {
  try {
    res.status(200).json({ success: true, admin: req.admin });
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ success: false, message: 'Failed to load profile' });
  }
};

// ─── PUT /api/admin/settings/profile ───────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, bio, avatarUrl } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (bio !== undefined) updates.bio = bio;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
    // Email is intentionally not editable here — it's the login identifier
    // and changing it silently could lock the admin out / collide with
    // another account. A dedicated "change email" flow could add that later.

    const admin = await Admin.findByIdAndUpdate(req.admin._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.status(200).json({ success: true, admin });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update profile' });
  }
};

// ─── PUT /api/admin/settings/password ──────────────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All password fields are required' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
    }

    const admin = await Admin.findById(req.admin._id).select('+password');
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    admin.password = newPassword; // pre-save hook re-hashes
    await admin.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('changePassword error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to change password' });
  }
};

// ─── GET /api/admin/settings/platform ──────────────────────────────────────
// Singleton document — created with schema defaults on first read.
export const getPlatformSettings = async (req, res) => {
  try {
    let settings = await PlatformSettings.findById('platform');
    if (!settings) {
      settings = await PlatformSettings.create({ _id: 'platform' });
    }
    res.status(200).json({ success: true, settings });
  } catch (error) {
    console.error('getPlatformSettings error:', error);
    res.status(500).json({ success: false, message: 'Failed to load platform settings' });
  }
};

// ─── PUT /api/admin/settings/platform ──────────────────────────────────────
// Body may contain any subset of { general, payments, campaigns, notifications, security, maintenanceMode }.
// Each top-level section is shallow-merged onto the existing document so
// partial updates from a single Settings tab don't wipe out other tabs' fields.
export const updatePlatformSettings = async (req, res) => {
  try {
    const allowedSections = ['general', 'payments', 'campaigns', 'notifications', 'security', 'maintenanceMode'];
    let settings = await PlatformSettings.findById('platform');
    if (!settings) {
      settings = await PlatformSettings.create({ _id: 'platform' });
    }

    for (const section of allowedSections) {
      if (req.body[section] === undefined) continue;
      if (section === 'maintenanceMode') {
        settings.maintenanceMode = !!req.body.maintenanceMode;
      } else {
        settings[section] = { ...settings[section].toObject?.() ?? settings[section], ...req.body[section] };
      }
    }
    settings.updatedBy = req.admin._id;

    await settings.save();
    res.status(200).json({ success: true, settings });
  } catch (error) {
    console.error('updatePlatformSettings error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update platform settings' });
  }
};
