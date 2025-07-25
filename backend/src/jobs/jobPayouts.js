import cron from 'node-cron';
import { JobsService } from '../services/JobsService.js';

export function startJobPayouts() {
  // Run daily at 6:00 AM
  cron.schedule('0 6 * * *', async () => {
    try {
      await JobsService.processDailyJobPayouts();
    } catch (err) {
      console.error('❌ Job payouts failed', err);
    }
  });
} 