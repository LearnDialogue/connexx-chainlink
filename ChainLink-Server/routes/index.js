const express = require('express');
const router = express.Router();

const uploadRoutes = require('./upload.js');

router.use('/', uploadRoutes);

// Add more route groups here if needed
module.exports = router;
