// 📁 backend/src/models/message.js
import mongoose from 'mongoose';

const { Schema } = mongoose;
const messageSchema = new Schema({
  senderId:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId:{ type: Schema.Types.ObjectId, ref: 'User', required: true },
  content:   { type: String, required: true, trim: true, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now }
});

// compound index for fast thread queries
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });
messageSchema.index({ receiverId: 1, createdAt: 1 }); // inbox lookup

export default mongoose.model('Message', messageSchema);