import express from 'express';
import { getReportsOverview, downloadReport } from '../controllers/adminReportController.js';
import { protectAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

router.use(protectAdmin);

router.get('/overview', getReportsOverview);
router.get('/download/:type', downloadReport);

export default router;
