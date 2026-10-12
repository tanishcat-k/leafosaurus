import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// keep the file in memory, we send it to cloudinary right after
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'));
};

// phone photos can be big, so 10 MB
const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// wraps cloudinary's stream upload in a promise so we can use await
const uploadBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: 'leafosaurus' }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    stream.end(buffer);
  });
};

// middleware: runs after multer, uploads req.file and sets req.file.url
export const uploadToCloud = async (req, res, next) => {
  if (!req.file) return next();   // no photo sent, nothing to do

  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const result = await uploadBuffer(req.file.buffer);
    req.file.url = result.secure_url;
    next();
  } catch (err) {
    next(err);
  }
};

export default upload;