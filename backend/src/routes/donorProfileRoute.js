// src/routes/donorProfileRoute.js
import express from 'express';
import { 
    getProfile, 
    updateProfile, 
    changePassword 
} from '../controllers/donorProfileController.js';
import { 
    getBadgeData
} from '../controllers/badgeController.js';
import { 
    getDonationStats,
    getDonationHistory 
} from '../controllers/donationController.js';
import { 
    getRecurringDetails,
    // seedRecurringDonation 
} from '../controllers/recurringController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ==================== PROFILE ROUTES ====================
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.patch('/profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);

// ==================== BADGE ROUTES ====================
router.get('/badges', protect, getBadgeData);

// ==================== DONATION ROUTES ====================
router.get('/donations/stats', protect, getDonationStats);
router.get('/donations/history', protect, getDonationHistory);

// ==================== RECURRING ROUTES ====================
router.get('/recurring', protect, getRecurringDetails);
// router.post('/recurring/seed', protect, seedRecurringDonation);

export default router;