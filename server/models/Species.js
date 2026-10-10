import mongoose from 'mongoose';

const speciesSchema = new mongoose.Schema({
  commonName: { type: String, required: true },
  otherNames: [String],            // e.g. "money plant", "devil's ivy"
  scientificName: { type: String, required: true },
  emoji: { type: String, default: '🪴' },
  wateringDays: { type: Number, default: 7 },   // water every N days
  light: { type: String, default: 'Bright, indirect light' },
  tips: String,
  commonProblems: [
    {
      symptom: String,   // must match the symptom names used in the frontend
      cause: String,
      fix: String,
    },
  ],
  // where did this entry come from? our seed file, perenual api, or a generic fallback
  source: { type: String, enum: ['seed', 'perenual', 'generic'], default: 'seed' },
  perenualId: Number,
});

export default mongoose.model('Species', speciesSchema);