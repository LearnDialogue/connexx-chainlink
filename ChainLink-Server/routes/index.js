import express from 'express';
import uploadRoutes from './upload.js';

const router = express.Router();

router.use('/', uploadRoutes);
// Add more route groups here if needed

export default router;