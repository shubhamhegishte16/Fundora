import express from 'express';
import {
  getCommunityPosts,
  createCommunityPost,
  toggleCommunityPostLike,
} from '../controllers/communityController.js';
import { protectCreator } from '../middleware/creatorAuth.js';

const router = express.Router();

router.use(protectCreator);

router.get('/posts', getCommunityPosts);
router.post('/posts', createCommunityPost);
router.post('/posts/:id/like', toggleCommunityPostLike);

export default router;
