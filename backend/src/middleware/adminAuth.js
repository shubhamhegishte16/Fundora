import { verifyToken } from '../utils/jwt.js';
import Admin from '../models/Admin.js';

export const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token',
    });
  }

  try {
    const decoded = verifyToken(token);

    // Reject immediately if this isn't an admin-issued token —
    // prevents a leaked User/Creator token from ever reaching admin routes.
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized for admin access',
      });
    }

    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found',
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This admin account has been deactivated',
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, invalid token',
    });
  }
};