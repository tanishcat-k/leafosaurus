import express from 'express';
import { identifyPlant } from '../controllers/identifyController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// no login needed, so people can try it before signing up
router.post('/', upload.single('image'), identifyPlant);

export default router;
