import express from 'express';
import { searchSpecies, lookupSpecies } from '../controllers/speciesController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.get('/', searchSpecies);
// needs login so strangers can't use up our api limit
router.post('/lookup', protect, lookupSpecies);
export default router;