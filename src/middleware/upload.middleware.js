import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine folder from route path or body
    let folder = 'general';
    if (req.path && req.path.includes('onboarding')) {
      folder = 'onboarding';
    } else if (req.path && req.path.includes('home-sliders')) {
      folder = 'home-sliders';
    } else if (req.path && req.path.includes('home-services')) {
      folder = 'home-services';
    } else if (req.path && req.path.includes('home-articles')) {
      folder = 'home-articles';
    } else if (req.path && req.path.includes('assessments')) {
      // Determine subfolder based on file field name
      if (file.fieldname === 'audio') {
        folder = 'assessments/audio';
      } else if (file.fieldname === 'image') {
        folder = 'assessments/images';
      } else {
        folder = 'assessments';
      }
    } else if (req.path && req.path.includes('mahara')) {
      if (file.fieldname === 'audios') {
        folder = 'mahara/audio';
      } else if (file.fieldname === 'images') {
        folder = 'mahara/images';
      } else {
        folder = 'mahara';
      }
    } else if (req.body && req.body.folder) {
      folder = req.body.folder;
    }
    
    const folderPath = path.join(uploadsDir, folder);
    
    // Create folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter - images only
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// File filter - audio only
const audioFilter = (req, file, cb) => {
  const allowedTypes = /mp3|wav|ogg|m4a|aac/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /audio/.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed (mp3, wav, ogg, m4a, aac)'));
  }
};

// File filter - images and audio
const mediaFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp3|wav|ogg|m4a|aac/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /image|audio/.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image or audio files are allowed'));
  }
};

// Configure multer for images
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: imageFilter
});

// Configure multer for audio
export const uploadAudio = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for audio
  },
  fileFilter: audioFilter
});

// Configure multer for media (images + audio)
export const uploadMedia = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: mediaFilter
});

// Middleware for single image upload
export const uploadSingleImage = (fieldName = 'image') => {
  return upload.single(fieldName);
};

// Middleware for multiple images
export const uploadMultipleImages = (fieldName = 'images', maxCount = 10) => {
  return upload.array(fieldName, maxCount);
};

// Middleware for assessment files (audio and image)
export const uploadAssessmentFiles = () => {
  return uploadMedia.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 }
  ]);
};

// Middleware for activity assets (multiple images + audios)
export const uploadActivityAssets = (maxImages = 10, maxAudios = 10) => {
  return uploadMedia.fields([
    { name: 'images', maxCount: maxImages },
    { name: 'audios', maxCount: maxAudios }
  ]);
};

// Helper to get file URL
export const getFileUrl = (req, filename, folder = 'general') => {
  if (!filename) return null;
  
  // If it's already a full URL, return as is
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  // Return relative URL that can be served statically
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/uploads/${folder}/${filename}`;
};

const assessmentImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = path.join(uploadsDir, 'assessments', 'images');
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `assessment-image-${uniqueSuffix}${ext}`);
  }
});

const assessmentAudioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = path.join(uploadsDir, 'assessments', 'audio');
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '.wav';
    cb(null, `assessment-audio-${uniqueSuffix}${ext}`);
  }
});

export const uploadAssessmentImageSingle = multer({
  storage: assessmentImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter
}).single('file');

export const uploadAssessmentAudioSingle = multer({
  storage: assessmentAudioStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: audioFilter
}).single('file');

