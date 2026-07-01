import express from 'express';
import { getDashboardData } from '../controllers/donorDashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get donor dashboard stats, recent donations, breakdown and recommendations
router.get('/', protect, getDashboardData);

export default router;
