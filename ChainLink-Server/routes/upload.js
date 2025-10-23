import express from 'express';
import { upload } from '../middleware/upload.js';
import { uploadProfilePicture } from '../controllers/uploadController.js';
import { getProfilePicture } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/upload-profile-pic', upload.single('file'), uploadProfilePicture);
router.get('/profile-pic/:username', getProfilePicture);

// Add more upload routes here as needed

export default router;