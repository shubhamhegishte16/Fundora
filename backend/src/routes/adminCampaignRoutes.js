import express from 'express';
import {
  getPendingCampaigns,
  getAllCampaigns,
  approveCampaign,
  rejectCampaign,
  deleteCampaignAdmin,
} from '../controllers/adminCampaignController.js';
import { protectAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

router.use(protectAdmin); // every route below requires a logged-in admin

router.get('/pending', getPendingCampaigns);
router.get('/', getAllCampaigns);
router.patch('/:id/approve', approveCampaign);
router.patch('/:id/reject', rejectCampaign);
router.delete('/:id', deleteCampaignAdmin);

export default router;
