import express from 'express';
import { getMyBadges } from '../controllers/badgeController.js';
import { protectCreator } from '../middleware/creatorAuth.js';

const router = express.Router();

router.use(protectCreator);

router.get('/', getMyBadges);

export default router;
