import Admin from '../models/Admin.js';
import { generateAdminToken } from '../utils/jwt.js';

// ─── POST /api/admin/auth/login ───────────────────────────────────────────────
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select('+password');

    // Same generic message whether the email doesn't exist or the password is wrong —
    // prevents attackers from using this endpoint to enumerate valid admin emails.
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This admin account has been deactivated',
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = generateAdminToken(admin._id);

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLoginAt: admin.lastLoginAt,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong during login',
    });
  }
};

// ─── GET /api/admin/auth/me ────────────────────────────────────────────────────
export const getAdminMe = async (req, res) => {
  try {
    // req.admin is already populated (password-free) by protectAdmin middleware
    res.status(200).json({
      success: true,
      admin: req.admin,
    });
  } catch (error) {
    console.error('Admin getMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};

// ─── POST /api/admin/auth/create ──────────────────────────────────────────────
// Protected — only an authenticated admin can create another admin.
// There is intentionally no public registration route.
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      });
    }

    const existing = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An admin account with this email already exists',
      });
    }

    const newAdmin = await Admin.create({
      name,
      email,
      password,
      createdBy: req.admin._id,
    });

    res.status(201).json({
      success: true,
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        createdBy: newAdmin.createdBy,
      },
    });
  } catch (error) {
    console.error('Admin create error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong while creating the admin',
    });
  }
};

// ─── POST /api/admin/auth/logout ──────────────────────────────────────────────
// Stateless JWT — logout is handled client-side by discarding the token.
// This endpoint exists mainly for symmetry / future blacklist support.
export const logoutAdmin = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};