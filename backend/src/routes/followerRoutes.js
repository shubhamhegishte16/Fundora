import express from 'express';
import { getMyFollowers } from '../controllers/followerController.js';
import { protectCreator } from '../middleware/creatorAuth.js';

const router = express.Router();

router.use(protectCreator);

router.get('/', getMyFollowers);

export default router;
