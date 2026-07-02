import express from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/adminUserController.js';
import { protectAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// Apply auth per-route (not router.use) so this router doesn't intercept
// sibling paths like /api/admin/campaigns/* that also live under /api/admin.
router.get('/users', protectAdmin, getUsers);
router.post('/users', protectAdmin, createUser);
router.patch('/users/:id', protectAdmin, updateUser);
router.delete('/users/:id', protectAdmin, deleteUser);

export default router;