import 'dotenv/config';
import mongoose from 'mongoose';
import Species from './models/Species.js';

// symptom names used here must match the checkboxes in client/src/pages/PlantDetail.jsx
const overwater = { symptom: 'Yellow leaves', cause: 'Usually overwatering', fix: 'Let the soil dry out and make sure the pot has drainage holes.' };
const dryAir = { symptom: 'Brown tips', cause: 'Dry air or irregular watering', fix: 'Water on a regular schedule and keep it away from AC and heaters.' };
const thirsty = { symptom: 'Drooping', cause: 'Needs water (or roots are rotting if the soil is wet)', fix: 'Check the soil. Dry means water it, soggy means stop watering.' };
const fungus = { symptom: 'Spots on leaves', cause: 'Fungal infection or water sitting on leaves', fix: 'Remove bad leaves, water only the soil and improve airflow.' };
const lowLight = { symptom: 'Leggy growth', cause: 'Not enough light', fix: 'Move it closer to a bright window.' };
const bugs = { symptom: 'Pests', cause: 'Mealybugs or spider mites', fix: 'Wipe leaves with soapy water or neem oil spray.' };

const data = [
  { commonName: 'Money Plant', otherNames: ['pothos', "devil's ivy"], scientificName: 'Epipremnum aureum', emoji: '🪴', wateringDays: 6, light: 'Low to bright indirect light', tips: 'Very forgiving. Grows in water or soil.', commonProblems: [overwater, dryAir, lowLight] },
  { commonName: 'Snake Plant', otherNames: ['mother-in-law tongue'], scientificName: 'Dracaena trifasciata', emoji: '🪴', wateringDays: 14, light: 'Low to bright light', tips: 'Hates wet soil. Water only when fully dry.', commonProblems: [overwater, thirsty] },
  { commonName: 'Aloe Vera', otherNames: ['ghritkumari'], scientificName: 'Aloe vera', emoji: '🌵', wateringDays: 14, light: 'Bright, some direct sun', tips: 'Use a gritty, fast draining soil mix.', commonProblems: [overwater, thirsty, lowLight] },
  { commonName: 'Tulsi', otherNames: ['holy basil', 'tulasi'], scientificName: 'Ocimum tenuiflorum', emoji: '🌿', wateringDays: 2, light: '5-6 hours of direct sun', tips: 'Pinch off flower buds so it stays bushy.', commonProblems: [thirsty, bugs, lowLight] },
  { commonName: 'Monstera', otherNames: ['swiss cheese plant'], scientificName: 'Monstera deliciosa', emoji: '🪴', wateringDays: 7, light: 'Bright, indirect light', tips: 'Give it a moss pole to climb.', commonProblems: [overwater, dryAir, fungus, bugs] },
  { commonName: 'Peace Lily', otherNames: ['spathiphyllum'], scientificName: 'Spathiphyllum wallisii', emoji: '🪴', wateringDays: 6, light: 'Low to medium indirect light', tips: 'Droops dramatically when thirsty and perks up after watering.', commonProblems: [thirsty, dryAir, overwater] },
  { commonName: 'Jade Plant', otherNames: ['money tree', 'crassula'], scientificName: 'Crassula ovata', emoji: '🌱', wateringDays: 12, light: 'Bright light, some direct sun', tips: 'Succulent, so it stores water in its leaves.', commonProblems: [overwater, thirsty] },
  { commonName: 'Spider Plant', otherNames: ['chlorophytum'], scientificName: 'Chlorophytum comosum', emoji: '🌿', wateringDays: 7, light: 'Bright, indirect light', tips: 'Makes baby plants you can re-pot.', commonProblems: [dryAir, overwater, bugs] },
  { commonName: 'ZZ Plant', otherNames: ['zanzibar gem'], scientificName: 'Zamioculcas zamiifolia', emoji: '🪴', wateringDays: 14, light: 'Low to medium light', tips: 'Almost impossible to kill. Do not overwater.', commonProblems: [overwater, thirsty] },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Species.deleteMany();
  await Species.insertMany(data);
  console.log(`Added ${data.length} species`);
  process.exit(0);
};

run();
