import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import config from '../config/index.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name:  config.cloudinary.cloudName,
  api_key:     config.cloudinary.apiKey,
  api_secret:  config.cloudinary.apiSecret,
});

// Use memory storage — pipe buffer to Cloudinary
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Upload a single buffer to Cloudinary and return the secure URL
export const uploadToCloudinary = (buffer, folder = 'cinetter/spaces') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
