import express from 'express';
import { getAllActiveCampaigns } from '../controllers/donorCampaignController.js';

const router = express.Router();

// GET /api/donor/campaigns/explore
router.get('/explore', getAllActiveCampaigns);

export default router;
