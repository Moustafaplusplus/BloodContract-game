// ─────────────────────────  BACKEND  ─────────────────────────
// File: backend/src/models/gang.js
//--------------------------------------------------------------
import mongoose from 'mongoose';

const GangSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  leader:      { type: mongoose.Schema.Types.ObjectId, ref: 'Character', required: true },
  members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Character' }],
  createdAt:   { type: Date,  default: Date.now },
});

export default mongoose.model('Gang', GangSchema);