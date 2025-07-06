
import cron from 'node-cron';
import Character from '../models/character.js';
import Achievement from '../models/achievement.js';
import CharacterAchievement from '../models/characterAchievement.js';

/**
 * Simple rule set; in production you might externalise this.
 */
const RULES = [
  { key: 'first_crime',   test: c => c.stats?.crimes >= 1,           xp: 50 },
  { key: 'level_10',      test: c => c.level >= 10,                  xp: 200 },
  { key: 'wealth_100k',   test: c => c.money >= 100000,              xp: 300 },
];

export function startAchievementChecker() {
  cron.schedule('0 * * * *', async () => { // every hour
    console.log('[ACHIEVEMENTS] scanning...');
    for (const rule of RULES) {
      // ensure achievement row exists
      await Achievement.findOrCreate({ where: { key: rule.key }, defaults: {
        name: rule.key.replace('_', ' ').toUpperCase(),
        description: 'Auto‑generated',
        xpReward: rule.xp,
      }});
    }

    const characters = await Character.findAll();
    for (const char of characters) {
      for (const rule of RULES) {
        const hasIt = await CharacterAchievement.findOne({ where: { characterId: char.id, achievementKey: rule.key }});
        if (!hasIt && rule.test(char)) {
          await CharacterAchievement.create({ characterId: char.id, achievementKey: rule.key });
          await char.addXp(rule.xp);
          console.log(`Awarded ${rule.key} to character ${char.id}`);
          // TODO: send socket or mail notification
        }
      }
    }
  });
}
