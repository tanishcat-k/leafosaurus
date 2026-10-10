import fs from 'fs';
import path from 'path';
import Species from '../models/Species.js';

// looks for a saved species with the same scientific name
const findInOurDb = async (scientificName) => {
  return await Species.findOne({ scientificName: new RegExp(`^${scientificName}$`, 'i') });
};

// POST /api/identify   (form-data, field name: image)
export const identifyPlant = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Please upload a photo' });

    const apiKey = process.env.PLANTNET_API_KEY;

    // no key set -> send a demo answer so the app can still be tested
    if (!apiKey) {
      const demo = await Species.findOne({ commonName: /monstera/i });
      return res.json({
        demo: true,
        matches: [{ scientificName: 'Monstera deliciosa', commonName: 'Monstera', score: 0.94, species: demo }],
      });
    }

    // send the photo to Pl@ntNet
    const form = new FormData();
    const fileData = fs.readFileSync(req.file.path);
    form.append('images', new Blob([fileData], { type: req.file.mimetype }), path.basename(req.file.path));
    form.append('organs', 'auto');

    const url = `https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey}&nb-results=3`;
    const response = await fetch(url, { method: 'POST', body: form });

    if (response.status === 404) {
      return res.json({ matches: [] });   // plantnet uses 404 when nothing was found
    }
    if (!response.ok) {
      return res.status(502).json({ message: 'Plant identification service is not working right now' });
    }

    const data = await response.json();
    const matches = [];

    for (const r of data.results.slice(0, 3)) {
      const sciName = r.species.scientificNameWithoutAuthor;
      const commonName = r.species.commonNames && r.species.commonNames[0];
      const species = await findInOurDb(sciName);   // null if we don't have it yet
      matches.push({ scientificName: sciName, commonName: commonName || sciName, score: r.score, species });
    }

    res.json({ matches });
  } catch (err) {
    next(err);
  }
};