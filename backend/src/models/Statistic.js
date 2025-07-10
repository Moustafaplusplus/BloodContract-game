import mongoose from 'mongoose';

const statSchema = new mongoose.Schema({
  userId:     { type: Number, required: true, unique: true, index: true },
  crimes:     { type: Number, default: 0 },
  fights:     { type: Number, default: 0 },
  daysOnline: { type: Number, default: 0 },
}, { timestamps: true });

export const Statistic = mongoose.models.Statistic ||
                         mongoose.model('Statistic', statSchema); 