import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * createImageUpload
 * Same disk-storage + validation pattern as the existing KYC upload in
 * creatorAuthRoutes.js, factored out so campaign covers and avatars don't
 * each duplicate the multer config. Files land in backend/uploads/<subfolder>
 * and are served back out via the existing `app.use('/uploads', ...)` static
 * mount, so the stored URL is just `/uploads/<subfolder>/<filename>`.
 */
export function createImageUpload(subfolder) {
  const destDir = path.join(__dirname, '../../uploads', subfolder);
  fs.mkdirSync(destDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, destDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${subfolder}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WEBP images are allowed'), false);
    }
  };

  return multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter }); // 5 MB
}
