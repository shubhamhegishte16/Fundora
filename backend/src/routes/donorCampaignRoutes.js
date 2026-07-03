import express from 'express';
import { getAllActiveCampaigns, toggleSaveCampaign, getSavedCampaigns } from '../controllers/donorCampaignController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/donor/campaigns/explore
router.get('/explore', getAllActiveCampaigns);

// GET /api/donor/campaigns/saved
router.get('/saved', protect, getSavedCampaigns);

// POST /api/donor/campaigns/:id/save
router.post('/:id/save', protect, toggleSaveCampaign);

export default router;
