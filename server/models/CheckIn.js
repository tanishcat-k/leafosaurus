import mongoose from 'mongoose';

const checkInSchema = new mongoose.Schema(
  {
    plant: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    photo: String,
    symptoms: [String],
    status: { type: String, enum: ['healthy', 'needs-attention'], default: 'healthy' },
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model('CheckIn', checkInSchema);
