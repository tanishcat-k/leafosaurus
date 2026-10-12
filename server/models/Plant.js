import mongoose from 'mongoose';

const plantSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    species: { type: mongoose.Schema.Types.ObjectId, ref: 'Species' },
    nickname: { type: String, required: true, trim: true },
    photo: String,
    wateringDays: { type: Number, default: 7 },
    lastWatered: { type: Date, default: Date.now },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

// when the plant needs water next
plantSchema.virtual('nextWatering').get(function () {
  return new Date(this.lastWatered.getTime() + this.wateringDays * 24 * 60 * 60 * 1000);
});

export default mongoose.model('Plant', plantSchema);
