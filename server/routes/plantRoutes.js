import express from 'express';
import protect from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
  getPlants, addPlant, getPlant, waterPlant, addLog, addCheckIn, deletePlant,
} from '../controllers/plantController.js';

const router = express.Router();

router.use(protect);   // every plant route needs login

router.get('/', getPlants);
router.post('/', upload.single('photo'), addPlant);
router.get('/:id', getPlant);
router.delete('/:id', deletePlant);
router.post('/:id/water', waterPlant);
router.post('/:id/logs', upload.single('photo'), addLog);
router.post('/:id/checkins', upload.single('photo'), addCheckIn);

export default router;
