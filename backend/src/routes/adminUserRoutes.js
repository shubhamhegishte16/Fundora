import express from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/adminUserController.js';
import { protectAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

router.use(protectAdmin);

router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;