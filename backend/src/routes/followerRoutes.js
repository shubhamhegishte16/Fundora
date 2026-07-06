// routes/followerRoutes.js
import express from 'express';
import {
  getMyFollowers,
} from '../controllers/followerController.js';
import { protectCreator } from '../middleware/creatorAuth.js';

const router = express.Router();

// All routes require authentication
router.use(protectCreator);

// Get all followers for the current creator
router.get('/followers', getMyFollowers);

export default router;