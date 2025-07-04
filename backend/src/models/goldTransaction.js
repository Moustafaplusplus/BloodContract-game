// models/goldTransaction.js
const goldTxSchema = new mongoose.Schema({
  character: { type: mongoose.Schema.Types.ObjectId, ref: 'Character', required: true },
  amount:    { type: Number, required: true, min: 1 },
  kind:      { type: String, enum: ['buy', 'spend'], required: true },
  ref:       { type: String }, // payment intent, VIP perk id, etc.
  createdAt: { type: Date,   default: Date.now }
});

export const GoldTransaction = mongoose.model('GoldTransaction', goldTxSchema);

/*******************************
 * 2. PAYMENT PROVIDER  (stub) *
 *******************************/

// utils/paymentProvider.js
export async function createPaymentIntent({ characterId, usdCents }) {
  // ⚠️  Replace with real integration (Stripe, Paddle, etc.)
  return {
    id: `pi_${Date.now()}`,
    url: `https://example-payments.dev/checkout?pi=${Date.now()}`,
    amount: usdCents
  };
}