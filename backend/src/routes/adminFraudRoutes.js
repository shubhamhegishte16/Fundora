import express from 'express';
import {
  getFraudAlerts,
  getFraudStats,
  getFraudAlertById,
  updateFraudStatus,
  createFraudAlert,
} from '../controllers/adminFraudController.js';
import { protectAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

router.use(protectAdmin);

router.get('/stats', getFraudStats);
router.get('/', getFraudAlerts);
router.get('/:id', getFraudAlertById);
router.post('/', createFraudAlert);
router.patch('/:id/status', updateFraudStatus);

export default router;
