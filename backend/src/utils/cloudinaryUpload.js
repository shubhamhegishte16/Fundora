import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

/**
 * uploadBufferToCloudinary
 * Multer (memoryStorage) gives us the file as a Buffer — nothing ever
 * touches the server's local disk, so this works the same whether we're
 * running on a laptop or a host with an ephemeral/read-only filesystem
 * (Render, Railway, serverless, etc.), and the returned secure_url is a
 * permanent link any admin instance can open directly.
 *
 * resourceType 'auto' lets Cloudinary correctly store both images
 * (jpg/png) and PDFs — KYC documents can be either.
 */
export function uploadBufferToCloudinary(buffer, { folder, resourceType = 'auto' } = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}
