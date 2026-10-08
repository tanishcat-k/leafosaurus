import express from 'express';
import { searchSpecies } from '../controllers/speciesController.js';

const router = express.Router();

router.get('/', searchSpecies);

export default router;
