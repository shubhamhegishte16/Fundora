import express from 'express';
import { getAnalyticsOverview } from '../controllers/adminAnalyticsController.js';
import { protectAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

router.use(protectAdmin);

router.get('/overview', getAnalyticsOverview);

export default router;