import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  getPlatformSettings,
  updatePlatformSettings,
} from '../controllers/adminSettingsController.js';
import { protectAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

router.use(protectAdmin);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/password', changePassword);

router.get('/platform', getPlatformSettings);
router.put('/platform', updatePlatformSettings);

export default router;
