import express from 'express';
import { getMyDonations } from '../controllers/myDonationsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getMyDonations);

export default router;
