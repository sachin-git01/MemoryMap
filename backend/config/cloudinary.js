import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';
import https from 'https';

dotenv.config();

let serverTimeOffset = 318724; // Default clock offset for local system vs Cloudinary

// Synchronize server time with Cloudinary server to avoid clock skew errors
export const syncCloudinaryTime = () => {
  return new Promise((resolve) => {
    try {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'u2uqqcxm';
      const req = https.request(`https://api.cloudinary.com/v1_1/${cloudName}/ping`, { method: 'HEAD' }, (res) => {
        if (res.headers.date) {
          const serverTime = new Date(res.headers.date).getTime();
          serverTimeOffset = Math.round((serverTime - Date.now()) / 1000);
          console.log(`[Cloudinary] Server clock synced. Offset: ${serverTimeOffset}s`);
        }
        resolve(serverTimeOffset);
      });
      req.on('error', () => resolve(serverTimeOffset));
      req.setTimeout(4000, () => {
        req.destroy();
        resolve(serverTimeOffset);
      });
      req.end();
    } catch {
      resolve(serverTimeOffset);
    }
  });
};

// Auto-sync on startup
syncCloudinaryTime();

// Ensure Cloudinary is configured
const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });
    return true;
  }

  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
    return true;
  }

  return false;
};

// Check if Cloudinary is configured via environment variables
export const isCloudinaryConfigured = () => {
  return configureCloudinary();
};

/**
 * Uploads a local file to Cloudinary and cleans up the temporary local file.
 * @param {string} localFilePath - Path to file stored on disk by multer
 * @param {string} folder - Folder in Cloudinary (defaults to 'memorymap')
 * @returns {Promise<{ url: string, publicId: string, format: string, size: number, resourceType: string }>}
 */
export const uploadFileToCloudinary = async (localFilePath, folder = 'memorymap') => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary credentials are not configured in .env');
  }

  try {
    const timestamp = Math.round(Date.now() / 1000) + serverTimeOffset;

    const result = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
      timestamp
    });

    // Clean up local temp file after successful upload to cloud
    try {
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    } catch (cleanupErr) {
      console.warn('[Cloudinary] Could not remove temp file:', cleanupErr.message);
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
      resourceType: result.resource_type
    };
  } catch (error) {
    // Attempt cleanup on failure as well
    try {
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    } catch {}
    throw error;
  }
};

export default cloudinary;
