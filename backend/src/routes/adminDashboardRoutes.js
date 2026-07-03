import express from 'express';
import {
  getDashboardStats,
  getDonationTrend,
  getCategoryBreakdown,
  getRecentCampaigns,
  getRecentDonations,
} from '../controllers/adminDashboardController.js';
import { protectAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

router.use(protectAdmin);

router.get('/stats', getDashboardStats);
router.get('/donation-trend', getDonationTrend);
router.get('/category-breakdown', getCategoryBreakdown);
router.get('/recent-campaigns', getRecentCampaigns);
router.get('/recent-donations', getRecentDonations);

export default router;