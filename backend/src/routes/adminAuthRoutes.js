import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  loginAdmin,
  getAdminMe,
  createAdmin,
  logoutAdmin,
} from '../controllers/adminAuthController.js';
import { protectAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// Rate-limit only the login route — slows brute-force attempts against the
// highest-privilege account without touching any other part of the app.
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.',
  },
});

// Public
router.post('/login', adminLoginLimiter, loginAdmin);

// Private
router.get('/me', protectAdmin, getAdminMe);
router.post('/create', protectAdmin, createAdmin);
router.post('/logout', protectAdmin, logoutAdmin);

export default router;