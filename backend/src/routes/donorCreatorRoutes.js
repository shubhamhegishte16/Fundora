import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  searchCreators, 
  getFollowingCreators, 
  toggleFollowCreator 
} from '../controllers/donorCreatorController.js';

const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(protect);

router.get('/', searchCreators);
router.get('/following', getFollowingCreators);
router.post('/:creatorId/follow', toggleFollowCreator);

export default router;
