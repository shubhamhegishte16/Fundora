import express from 'express';
import {
  getKycSubmissions,
  getKycById,
  approveKyc,
  rejectKyc,
  getKycStats,
} from '../controllers/adminKycController.js';
import { protectAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

router.use(protectAdmin);

router.get('/stats', getKycStats);
router.get('/', getKycSubmissions);
router.get('/:id', getKycById);
router.patch('/:id/approve', approveKyc);
router.patch('/:id/reject', rejectKyc);

export default router;