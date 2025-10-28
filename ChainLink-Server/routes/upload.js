const express = require('express');
const { upload } = require('../middleware/upload.js');
const { uploadProfilePicture } = require('../controllers/uploadController.js');
const { getProfilePicture } = require('../controllers/uploadController.js');

const router = express.Router();

router.post('/upload-profile-pic', upload.single('file'), uploadProfilePicture);
router.get('/profile-pic/:username', getProfilePicture);

// Add more upload routes here as needed

module.exports = router;
