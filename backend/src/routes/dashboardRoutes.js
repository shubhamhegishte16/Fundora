import express from 'express';
import { getDashboardSummary } from '../controllers/dashboardController.js';
import { protectCreator } from '../middleware/creatorAuth.js';

const router = express.Router();

router.use(protectCreator);

router.get('/', getDashboardSummary);

export default router;
