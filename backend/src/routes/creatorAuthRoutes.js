import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  registerCreator,
  loginCreator,
  getCreatorMe,
} from '../controllers/creatorAuthController.js';
import { protectCreator } from '../middleware/creatorAuth.js';

// ─── Multer config for KYC document uploads ───────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/kyc'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `kyc-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

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

// ─── Routes ───────────────────────────────────────────────────────────────────
const router = express.Router();

// Public routes
router.post('/register', upload.single('idFile'), registerCreator);
router.post('/login', loginCreator);

// Private routes
router.get('/me', protectCreator, getCreatorMe);

export default router;
