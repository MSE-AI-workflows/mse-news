import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Resolve uploads directory relative to this file
// middleware (backend/src/middleware) -> backend/uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure disk storage for images
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const baseName = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    cb(null, `${baseName}_${random}${ext || ''}`);
  },
});

// Only allow common image mime types
const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

function imageFileFilter(_req, file, cb) {
  if (!allowedMimeTypes.has(file.mimetype)) {
    return cb(new Error('Only image uploads are allowed'));
  }
  cb(null, true);
}

// 5MB per image limit for now
const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// Helper for single-image uploads
export const uploadSingleImage = upload.single('image');

// Helper for future multiple-image support (not wired yet)
export const uploadMultipleImages = upload.array('images', 10);

// NOTE: If you later move to cloud storage (S3/GCS, etc.),
// replace the diskStorage config above with a custom storage
// engine, but keep the exported helpers and route contracts
// the same so the rest of the app does not need changes.

