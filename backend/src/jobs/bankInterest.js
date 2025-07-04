// backend/src/jobs/bankInterest.js
import cron from 'node-cron';
import BankAccount from '../models/bankAccount.js';

// Run every day at 00:05
cron.schedule('5 0 * * *', async () => {
  console.log('🏦  Running daily interest job…');
  const accounts = await BankAccount.findAll();
  for (const acc of accounts) {
    const diffDays =
      (Date.now() - new Date(acc.lastInterestAt).getTime()) / 86_400_000;
    if (diffDays >= 1) {
      const interest = Math.floor(acc.balance * 0.02); // 2 % daily
      acc.balance += interest;
      acc.lastInterestAt = new Date();
      await acc.save();
    }
  }
  console.log('✅  Interest applied');
});
