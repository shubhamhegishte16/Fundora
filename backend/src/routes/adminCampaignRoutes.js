import express from 'express';
import {
  getPendingCampaigns,
  approveCampaign,
  rejectCampaign,
} from '../controllers/adminCampaignController.js';
import { protectAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

router.use(protectAdmin); // every route below requires a logged-in admin

router.get('/pending', getPendingCampaigns);
router.patch('/:id/approve', approveCampaign);
router.patch('/:id/reject', rejectCampaign);

export default router;
