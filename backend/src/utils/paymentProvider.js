// backend/src/utils/paymentProvider.js
export async function processPayment({ userId, amountUSD }) {
  // MOCK: Assume all payments succeed
  console.log(`Mock payment: $${amountUSD} from user ${userId}`);
  return { success: true, transactionId: 'mock-tx-' + Date.now() };
}
