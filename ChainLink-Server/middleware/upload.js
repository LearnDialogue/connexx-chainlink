import multer from 'multer';

export const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10_000_000 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});