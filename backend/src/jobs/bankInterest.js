import cron from 'node-cron';
import { BankService } from '../services/BankService.js';

export function startBankInterest() {
  cron.schedule('5 0 * * *', async () => {
    try {
      await BankService.applyDailyInterest();
    } catch (err) {
      console.error('❌  Interest job failed', err);
    }
  });
} 