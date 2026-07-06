import express from 'express';
import {
  getMyCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from '../controllers/campaignController.js';
import { protectCreator } from '../middleware/creatorAuth.js';
import { createImageUpload } from '../middleware/uploadImage.js';

const router = express.Router();
const uploadCoverImage = createImageUpload('campaigns');

router.use(protectCreator); // every route below requires a logged-in creator

router.get('/', getMyCampaigns);
router.post('/', uploadCoverImage.single('coverImage'), createCampaign);
router.get('/:id', getCampaignById);
router.put('/:id', uploadCoverImage.single('coverImage'), updateCampaign);
router.delete('/:id', deleteCampaign);

export default router;
