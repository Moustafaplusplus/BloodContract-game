// ─────────────────────────  Model  ────────────────────────────
// File: backend/src/models/marketListing.js
// -------------------------------------------------------------
import mongoose from 'mongoose';

const { Schema } = mongoose;

const marketListingSchema = new Schema({
  seller:   { type: Schema.Types.ObjectId, ref: 'Character', required: true },
  itemId:   { type: Schema.Types.ObjectId, required: true },
  itemType: { type: String, enum: ['weapon', 'armor', 'consumable'], required: true },
  price:    { type: Number, required: true },
  status:   { type: String, enum: ['active', 'sold', 'cancelled'], default: 'active' },
  buyer:    { type: Schema.Types.ObjectId, ref: 'Character' },
  createdAt:{ type: Date, default: Date.now }
});

const MarketListing = mongoose.model('MarketListing', marketListingSchema);
export default MarketListing;

// ───────────────────────── Utility  ───────────────────────────
// File: backend/src/utils/paymentProvider.js  (stub)
// -------------------------------------------------------------
export async function processPayment({ userId, amountUSD }) {
  /*
    Integrate Stripe/PayPal/etc. here.  For now we succeed instantly.
  */
  console.log(`★ MOCK PAYMENT → $${amountUSD} from user ${userId}`);
  return { success: true, transactionId: `mock-${Date.now()}` };
}