import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { protect } from '../middleware/authMiddleware.js';
import { isCloudinaryConfigured, uploadFileToCloudinary } from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists for temporary multer storage
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage Configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${safeBase}-${uniqueSuffix}${ext}`);
  }
});

// File Filter for Images and Videos
const fileFilter = (_req, file, cb) => {
  const allowedMime = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ];

  if (allowedMime.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are supported (JPEG, PNG, WEBP, GIF, MP4, WEBM)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 30 * 1024 * 1024 // 30 MB max
  }
});

const router = express.Router();

// @desc    Upload single file (Cloudinary with Local Fallback)
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file provided' });
  }

  const isVideo = req.file.mimetype.startsWith('video/');

  // 1. If Cloudinary is configured, upload directly to Cloudinary CDN
  if (isCloudinaryConfigured()) {
    try {
      const cloudRes = await uploadFileToCloudinary(req.file.path, 'memorymap');
      return res.status(201).json({
        success: true,
        url: cloudRes.url,
        publicId: cloudRes.publicId,
        provider: 'cloudinary',
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: cloudRes.size
      });
    } catch (cloudErr) {
      console.error('[Upload Error - Cloudinary Failed]:', cloudErr.message);
      // Fallback to local url if cloudinary upload errors out
      const fileUrl = `/uploads/${req.file.filename}${isVideo ? '#video' : ''}`;
      return res.status(201).json({
        success: true,
        url: fileUrl,
        provider: 'local_fallback',
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      });
    }
  }

  // 2. Local Fallback when Cloudinary credentials are not in .env yet
  const fileUrl = `/uploads/${req.file.filename}${isVideo ? '#video' : ''}`;
  return res.status(201).json({
    success: true,
    url: fileUrl,
    provider: 'local',
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
});

// @desc    Upload multiple files (Cloudinary with Local Fallback)
// @route   POST /api/upload/multiple
// @access  Private
router.post('/multiple', protect, upload.array('files', 15), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files provided' });
  }

  // 1. If Cloudinary is configured, upload in parallel to Cloudinary CDN
  if (isCloudinaryConfigured()) {
    try {
      const uploadPromises = req.files.map(async (file) => {
        try {
          const cloudRes = await uploadFileToCloudinary(file.path, 'memorymap');
          return {
            url: cloudRes.url,
            publicId: cloudRes.publicId,
            provider: 'cloudinary',
            filename: file.filename,
            mimetype: file.mimetype,
            size: cloudRes.size
          };
        } catch (fileErr) {
          console.error(`[Upload Error on ${file.filename}]:`, fileErr.message);
          const isVideo = file.mimetype.startsWith('video/');
          return {
            url: `/uploads/${file.filename}${isVideo ? '#video' : ''}`,
            provider: 'local_fallback',
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size
          };
        }
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      return res.status(201).json({
        success: true,
        files: uploadedFiles,
        urls: uploadedFiles.map(f => f.url)
      });
    } catch (err) {
      console.error('[Upload Multiple Error]:', err.message);
    }
  }

  // 2. Local Fallback
  const uploadedFiles = req.files.map((file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      url: `/uploads/${file.filename}${isVideo ? '#video' : ''}`,
      provider: 'local',
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size
    };
  });

  return res.status(201).json({
    success: true,
    files: uploadedFiles,
    urls: uploadedFiles.map(f => f.url)
  });
});

export default router;
