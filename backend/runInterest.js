import { BankService } from './src/services/BankService.js';

console.log('Running bank interest job...');
BankService.applyDailyInterest()
  .then(() => {
    console.log('✅ Bank interest applied successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error applying bank interest:', err);
    process.exit(1);
  }); 