import express from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/donorProfileController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get donor profile
router.get('/profile', protect, getProfile);

// Update donor profile  
router.put('/profile', protect, updateProfile);

// Alternative: If you want to use PATCH
router.patch('/profile', protect, updateProfile);

router.put('/change-password', protect, changePassword);

export default router;