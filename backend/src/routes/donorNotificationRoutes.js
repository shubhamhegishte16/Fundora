import express from 'express';
import { protect } from '../middleware/auth.js';
import { getNotifications, markAsRead } from '../controllers/donorNotificationController.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);

export default router;
