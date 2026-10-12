import mongoose from 'mongoose';

// one entry in the plant diary (watering, note, or growth photo)
const logSchema = new mongoose.Schema(
  {
    plant: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['water', 'note', 'photo'], required: true },
    note: String,
    photo: String,
  },
  { timestamps: true }
);

export default mongoose.model('Log', logSchema);
