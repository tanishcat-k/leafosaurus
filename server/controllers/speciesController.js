import Species from '../models/Species.js';

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
