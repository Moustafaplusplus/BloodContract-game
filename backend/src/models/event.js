// backend/src/models/event.js
import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const Event = mongoose.model('Event', eventSchema);
