import express from 'express';
import {
  getDonations,
  getDonationsSummary,
  getDonationById,
  refundDonation,
} from '../controllers/adminDonationController.js';
import { protectAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

router.use(protectAdmin);

router.get('/summary', getDonationsSummary);
router.get('/', getDonations);
router.get('/:id', getDonationById);
router.patch('/:id/refund', refundDonation);

export default router;