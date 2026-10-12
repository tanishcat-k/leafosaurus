import Plant from '../models/Plant.js';
import Log from '../models/Log.js';
import CheckIn from '../models/CheckIn.js';
import Species from '../models/Species.js';

// GET /api/plants  -> all plants of the logged in user
export const getPlants = async (req, res, next) => {
  try {
    const plants = await Plant.find({ user: req.userId }).populate('species').sort({ createdAt: -1 });

    // latest check-in date for each plant (checkins are sorted newest first)
    const checkins = await CheckIn.find({ user: req.userId }).sort({ createdAt: -1 }).select('plant createdAt');
    const lastCheckIn = {};
    checkins.forEach((c) => {
      const key = c.plant.toString();
      if (!lastCheckIn[key]) lastCheckIn[key] = c.createdAt;   // first one we see is the newest
    });

    const result = plants.map((p) => ({ ...p.toJSON(), lastCheckIn: lastCheckIn[p._id.toString()] }));
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// POST /api/plants
export const addPlant = async (req, res, next) => {
  try {
    const { nickname, speciesId } = req.body;
    if (!nickname) return res.status(400).json({ message: 'Give your plant a nickname' });

    let wateringDays = 7;
    if (speciesId) {
      const sp = await Species.findById(speciesId);
      if (sp) wateringDays = sp.wateringDays;
    }

    const plant = await Plant.create({
      user: req.userId,
      species: speciesId || undefined,
      nickname,
      wateringDays,
      photo: req.file ? '/uploads/' + req.file.filename : undefined,
    });

    res.status(201).json(plant);
  } catch (err) {
    next(err);
  }
};

// GET /api/plants/:id  -> plant + diary
export const getPlant = async (req, res, next) => {
  try {
    const plant = await Plant.findOne({ _id: req.params.id, user: req.userId }).populate('species');
    if (!plant) return res.status(404).json({ message: 'Plant not found' });

    const logs = await Log.find({ plant: plant._id }).sort({ createdAt: -1 }).limit(30);
    const checkins = await CheckIn.find({ plant: plant._id }).sort({ createdAt: -1 }).limit(20);

    res.json({ plant, logs, checkins });
  } catch (err) {
    next(err);
  }
};

// POST /api/plants/:id/water
export const waterPlant = async (req, res, next) => {
  try {
    const plant = await Plant.findOne({ _id: req.params.id, user: req.userId });
    if (!plant) return res.status(404).json({ message: 'Plant not found' });

    // stop accidental double clicks: was it watered in the last minute?
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recent = await Log.findOne({ plant: plant._id, type: 'water', createdAt: { $gt: oneMinuteAgo } });
    if (recent) return res.status(409).json({ message: 'Already watered a moment ago' });

    plant.lastWatered = new Date();
    await plant.save();
    await Log.create({ plant: plant._id, user: req.userId, type: 'water', note: 'Watered' });

    res.json(plant);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/plants/:id/water  -> undo the latest watering
export const undoWater = async (req, res, next) => {
  try {
    const plant = await Plant.findOne({ _id: req.params.id, user: req.userId });
    if (!plant) return res.status(404).json({ message: 'Plant not found' });

    // find and remove the most recent watering entry
    const last = await Log.findOne({ plant: plant._id, type: 'water' }).sort({ createdAt: -1 });
    if (!last) return res.status(400).json({ message: 'No watering to undo' });
    await Log.deleteOne({ _id: last._id });

    // go back to the watering before it (or the day the plant was added)
    const before = await Log.findOne({ plant: plant._id, type: 'water' }).sort({ createdAt: -1 });
    plant.lastWatered = before ? before.createdAt : plant.createdAt;
    await plant.save();

    res.json(plant);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/plants/:id   body: { nickname }
export const updatePlant = async (req, res, next) => {
  try {
    const nickname = (req.body.nickname || '').trim();
    if (!nickname) return res.status(400).json({ message: 'Nickname cannot be empty' });

    const plant = await Plant.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },   // user check so nobody can rename someone else's plant
      { nickname },
      { new: true }
    );
    if (!plant) return res.status(404).json({ message: 'Plant not found' });

    res.json(plant);
  } catch (err) {
    next(err);
  }
};

// POST /api/plants/:id/logs  (note and/or growth photo)
export const addLog = async (req, res, next) => {
  try {
    const plant = await Plant.findOne({ _id: req.params.id, user: req.userId });
    if (!plant) return res.status(404).json({ message: 'Plant not found' });

    const { note } = req.body;
    if (!note && !req.file) return res.status(400).json({ message: 'Add a note or a photo' });

    const log = await Log.create({
      plant: plant._id,
      user: req.userId,
      type: req.file ? 'photo' : 'note',
      note,
      photo: req.file ? '/uploads/' + req.file.filename : undefined,
    });

    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
};

// POST /api/plants/:id/checkins  (photo + list of symptoms)
export const addCheckIn = async (req, res, next) => {
  try {
    const plant = await Plant.findOne({ _id: req.params.id, user: req.userId }).populate('species');
    if (!plant) return res.status(404).json({ message: 'Plant not found' });

    // symptoms come as a comma separated string because we use form-data
    const symptoms = req.body.symptoms ? req.body.symptoms.split(',').filter(Boolean) : [];

    const checkin = await CheckIn.create({
      plant: plant._id,
      user: req.userId,
      photo: req.file ? '/uploads/' + req.file.filename : undefined,
      symptoms,
      notes: req.body.notes,
      status: symptoms.length > 0 ? 'needs-attention' : 'healthy',
    });

    // look up possible causes from the species data
    let advice = [];
    if (plant.species) {
      advice = plant.species.commonProblems.filter((p) => symptoms.includes(p.symptom));
    }

    res.status(201).json({ checkin, advice });
  } catch (err) {
    next(err);
  }
};

export const deletePlant = async (req, res, next) => {
  try {
    const plant = await Plant.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!plant) return res.status(404).json({ message: 'Plant not found' });

    // clean up its diary too
    await Log.deleteMany({ plant: plant._id });
    await CheckIn.deleteMany({ plant: plant._id });

    res.json({ message: 'Plant deleted' });
  } catch (err) {
    next(err);
  }
};
