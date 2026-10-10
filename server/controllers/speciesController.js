import Species from '../models/Species.js';
import { getCareInfo } from '../utils/careLookup.js';

// GET /api/species?q=snake
export const searchSpecies = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    let filter = {};

    if (q) {
      const regex = new RegExp(q, 'i');
      filter = { $or: [{ commonName: regex }, { otherNames: regex }, { scientificName: regex }] };
    }

    const list = await Species.find(filter).limit(20);
    res.json(list);
  } catch (err) {
    next(err);
  }
};

// POST /api/species/lookup   body: { scientificName, commonName }
export const lookupSpecies = async (req, res, next) => {
  try {
    const { scientificName, commonName } = req.body;
    if (!scientificName) return res.status(400).json({ message: 'scientificName is required' });

    const species = await getCareInfo(scientificName, commonName);
    res.json(species);
  } catch (err) {
    next(err);
  }
};