import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  registerCreator,
  loginCreator,
  getCreatorMe,
  updateCreatorProfile,
  updateCreatorNotificationPrefs,
  changeCreatorPassword,
  uploadCreatorAvatar,
} from '../controllers/creatorAuthController.js';
import { protectCreator } from '../middleware/creatorAuth.js';
import { createImageUpload } from '../middleware/uploadImage.js';

// ─── Multer config for KYC document uploads ───────────────────────────────────
// memoryStorage — the file is held in RAM as a Buffer just long enough to be
// streamed up to Cloudinary in the controller, then discarded. Nothing is
// written to local disk, so this survives redeploys/restarts and works the
// same across multiple server instances (see utils/cloudinaryUpload.js).
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and PDF files are allowed for KYC'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});

const uploadAvatar = createImageUpload('avatars');

// ─── Routes ───────────────────────────────────────────────────────────────────
const router = express.Router();

// Public routes
router.post('/register', upload.single('idFile'), registerCreator);
router.post('/login', loginCreator);

// Private routes
router.get('/me', protectCreator, getCreatorMe);
router.patch('/me', protectCreator, updateCreatorProfile);
router.patch('/notification-prefs', protectCreator, updateCreatorNotificationPrefs);
router.patch('/change-password', protectCreator, changeCreatorPassword);
router.post('/avatar', protectCreator, uploadAvatar.single('avatar'), uploadCreatorAvatar);

export default router;
