import express from 'express';
import { getMyDonations } from '../controllers/donationController.js';
import { protectCreator } from '../middleware/creatorAuth.js';

const router = express.Router();

router.use(protectCreator);

router.get('/', getMyDonations);

export default router;
