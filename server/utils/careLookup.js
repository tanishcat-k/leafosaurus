import Species from '../models/Species.js';

const BASE_URL = 'https://perenual.com/api/v2';

// perenual gives watering as a word, we need days
const wateringToDays = { frequent: 3, average: 7, minimum: 14, none: 30 };

// same symptom names as the check-in form
const genericProblems = [
  { symptom: 'Yellow leaves', cause: 'Usually overwatering', fix: 'Let the soil dry out and check the pot has drainage holes.' },
  { symptom: 'Brown tips', cause: 'Dry air or irregular watering', fix: 'Water on a regular schedule and keep it away from AC and heaters.' },
  { symptom: 'Drooping', cause: 'Thirsty, or roots rotting if the soil is wet', fix: 'Check the soil. Dry means water it, soggy means stop watering.' },
  { symptom: 'Spots on leaves', cause: 'Fungal infection or water sitting on leaves', fix: 'Remove bad leaves and water only the soil.' },
  { symptom: 'Leggy growth', cause: 'Not enough light', fix: 'Move it closer to a bright window.' },
  { symptom: 'Pests', cause: 'Mealybugs or spider mites', fix: 'Wipe leaves with soapy water or neem oil spray.' },
];

// ask perenual for one plant name, returns the best result or null
const searchPerenual = async (name) => {
  const url = `${BASE_URL}/species-list?key=${process.env.PERENUAL_API_KEY}&q=${encodeURIComponent(name)}`;
  const response = await fetch(url);

  // 429 means the free plan doesn't cover this plant (or daily limit is over)
  if (!response.ok) return null;

  const json = await response.json();
  if (!json.data || json.data.length === 0) return null;

  // prefer an exact scientific name match, otherwise take the first one
  const exact = json.data.find(
    (p) => Array.isArray(p.scientific_name) && p.scientific_name.some((s) => s.toLowerCase() === name.toLowerCase())
  );
  return exact || json.data[0];
};

// turns a perenual result into our Species format
const makeSpeciesData = (plant, scientificName, commonName) => {
  const watering = typeof plant.watering === 'string' ? plant.watering.toLowerCase() : '';
  const sunlight = Array.isArray(plant.sunlight) ? plant.sunlight.join(', ') : '';

  return {
    commonName: plant.common_name || commonName || scientificName,
    otherNames: plant.other_name || [],
    scientificName,
    wateringDays: wateringToDays[watering] || 7,   // locked fields come back as upgrade messages, so we use 7 as default
    light: sunlight || 'Bright, indirect light',
    tips: 'Care info from Perenual. Adjust the schedule if your plant looks unhappy.',
    commonProblems: genericProblems,
    source: 'perenual',
    perenualId: plant.id,
  };
};

// main function: our db -> perenual -> generic fallback
export const getCareInfo = async (scientificName, commonName) => {
  // 1. already saved?
  const saved = await Species.findOne({ scientificName: new RegExp(`^${scientificName}$`, 'i') });
  if (saved) return saved;

  // 2. try perenual (only if a key is set)
  if (process.env.PERENUAL_API_KEY) {
    try {
      let plant = await searchPerenual(scientificName);
      if (!plant && commonName) plant = await searchPerenual(commonName);

      if (plant) {
        return await Species.create(makeSpeciesData(plant, scientificName, commonName));
      }
    } catch (err) {
      console.log('Perenual lookup failed:', err.message);
    }
  }

  // 3. nothing worked, save a generic entry so the user can still add the plant
  return await Species.create({
    commonName: commonName || scientificName,
    scientificName,
    tips: "We don't have detailed care info for this plant yet. These are general guidelines.",
    commonProblems: genericProblems,
    source: 'generic',
  });
};