import { Crime, CrimeLog } from '../models/Crime.js';
import { Character } from '../models/Character.js';
import { CharacterService } from './CharacterService.js';
import { Hospital, Jail } from '../models/Confinement.js';
import { sequelize } from '../config/db.js';
import { io } from '../socket.js';
import { User } from '../models/User.js';

export class CrimeService {
  // Utility helpers
  static calcChance(level = 1, baseRate = 0.5) {
    const bonus = level * 0.01; // +1 % per level
    return Math.min(0.95, Math.max(0.05, baseRate + bonus));
  }

  static randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Get available crimes for a character
  static async getAvailableCrimes(userLevel = 1) {
    const crimes = await Crime.findAll({ where: { isEnabled: true } });
    return crimes.filter(c => c.req_level <= userLevel).map(c => ({
      id:         c.id,
      name:       c.name,
      req_level:  c.req_level,
      energyCost: c.energyCost,
      minReward:  c.minReward,
      maxReward:  c.maxReward,
      cooldown:   c.cooldown,
      chance:     Math.round(this.calcChance(userLevel, c.successRate) * 100),
      expGain:    c.energyCost * 8, // Expected exp gain on success (significantly increased)
    }));
  }

  // Execute a crime
  static async executeCrime(userId, crimeId) {
    const tx = await sequelize.transaction();
    try {
      const crime = await Crime.findByPk(crimeId, { transaction: tx });
      if (!crime || !crime.isEnabled) {
        throw { status: 404, msg: "Crime not found" };
      }

      const character = await Character.findOne({ 
        where: { userId }, 
        transaction: tx, 
        lock: tx.LOCK.UPDATE 
      });
      if (!character) {
        throw { status: 404, msg: "Character not found" };
      }

      // Validation checks
      if (character.level < crime.req_level) {
        throw { status: 400, msg: "Level too low" };
      }
      if (character.energy < crime.energyCost) {
        throw { status: 400, msg: "Not enough energy" };
      }
      if (crime.req_intel && character.intel < crime.req_intel) {
        throw { status: 400, msg: "Not enough intelligence" };
      }

      const nowMs = Date.now();
      if (character.crimeCooldown && character.crimeCooldown > nowMs) {
        const secLeft = Math.ceil((character.crimeCooldown - nowMs) / 1000);
        throw { status: 429, msg: "Crime on cooldown", meta: { cooldownLeft: secLeft } };
      }

      // Core outcome calculation
      const success = Math.random() < this.calcChance(character.level, Number(crime.successRate));
      let payout = success ? this.randInt(crime.minReward, crime.maxReward) : 0;
      // XP scales with energy cost (rounded) - significantly increased
      let expGain = success ? crime.energyCost * 8 : Math.round(crime.energyCost * 3); // Much higher exp gain
      // VIP bonus
      if (character && character.vipExpiresAt && new Date(character.vipExpiresAt) > new Date()) {
        payout = Math.round(payout * 1.5);
        expGain = Math.round(expGain * 1.5);
      }

      // Apply rewards
      if (payout) character.money += payout;
      character.exp += expGain;
      await CharacterService.maybeLevelUp(character);

      // Handle failure consequences with dynamic scaling based on level
      let redirect = null;
      if (!success) {
        // Dynamic scaling: higher level = longer confinement and higher fees
        const levelMultiplier = Math.max(0.5, Math.min(2.0, character.level / 10)); // 0.5x to 2.0x based on level
        
        if (crime.failOutcome === "jail" || crime.failOutcome === "both") {
          const dynamicJailMinutes = Math.round(crime.jailMinutes * levelMultiplier);
          const dynamicBailRate = Math.round(crime.bailRate * levelMultiplier);
          
          const jailRecord = await Jail.create({
            userId: userId,
            minutes: dynamicJailMinutes,
            bailRate: dynamicBailRate,
            releasedAt: new Date(nowMs + dynamicJailMinutes * 60_000),
          }, { transaction: tx });
          
          if (io) {
            io.to(`user:${userId}`).emit('jail:enter', {
              releaseAt: jailRecord.releasedAt,
              reason: 'crime',
            });
          }
          
          // Set redirect to jail if this is the primary outcome
          if (crime.failOutcome === "jail" || (crime.failOutcome === "both" && !redirect)) {
            redirect = "/dashboard/jail";
          }
        }
        
        if (crime.failOutcome === "hospital" || crime.failOutcome === "both") {
          const dynamicHospitalMinutes = Math.round(crime.hospitalMinutes * levelMultiplier);
          const dynamicHealRate = Math.round(crime.healRate * levelMultiplier);
          const dynamicHpLoss = Math.round(crime.hpLoss * levelMultiplier);
          
          const hospitalRecord = await Hospital.create({
            userId: userId,
            minutes: dynamicHospitalMinutes,
            hpLoss: dynamicHpLoss,
            healRate: dynamicHealRate,
            releasedAt: new Date(nowMs + dynamicHospitalMinutes * 60_000),
          }, { transaction: tx });
          
          if (io) {
            io.to(`user:${userId}`).emit('hospital:enter', {
              releaseAt: hospitalRecord.releasedAt,
              reason: 'crime',
            });
          }
          
          // Set redirect to hospital if this is the primary outcome or if no jail redirect
          if (crime.failOutcome === "hospital" || (crime.failOutcome === "both" && !redirect)) {
            redirect = "/dashboard/hospital";
          }
        }
      }

      // Update character state
      character.energy -= crime.energyCost;
      character.crimeCooldown = nowMs + crime.cooldown * 1000;
      await character.save({ transaction: tx });

      // Increment crimes stat
      await CharacterService.addStat(userId, "crimes");

      // Audit log
      await CrimeLog.create({
        userId: character.id,
        crimeId: crime.id,
        success,
        payout,
      }, { transaction: tx });

      await tx.commit();
      
      return {
        success,
        payout,
        expGain,
        energyLeft: character.energy,
        cooldownLeft: crime.cooldown
      };
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

  // Seed crimes data
  static async seedCrimes() {
    const baseCrimes = [
      { name: "سرقة محفظة في الزحام",                lvl: 1,  energy: 5,  rate: 0.85, min: 15,  max: 40,  cd: 60,  failOutcome: "jail", jailMinutes: 2, hospitalMinutes: 0, hpLoss: 0, bailRate: 30, healRate: 0 },
      { name: "رشّ كتابات على حائط عام",             lvl: 1,  energy: 5,  rate: 0.83, min: 20,  max: 45,  cd: 90,  failOutcome: "jail", jailMinutes: 3, hospitalMinutes: 0, hpLoss: 0, bailRate: 40, healRate: 0 },
      { name: "سرقة دراجة هوائية",                  lvl: 2,  energy: 7,  rate: 0.8,  min: 25,  max: 60,  cd: 120, failOutcome: "both", jailMinutes: 3, hospitalMinutes: 2, hpLoss: 15, bailRate: 50, healRate: 35 },
      { name: "سرقة سيارة",                         lvl: 3,  energy: 10, rate: 0.75, min: 50,  max: 120, cd: 180, failOutcome: "both", jailMinutes: 5, hospitalMinutes: 3, hpLoss: 25, bailRate: 60, healRate: 45 },
      { name: "سرقة بنك صغير",                      lvl: 5,  energy: 15, rate: 0.65, min: 100, max: 250, cd: 300, failOutcome: "jail", jailMinutes: 8, hospitalMinutes: 0, hpLoss: 0, bailRate: 80, healRate: 0 },
      { name: "سرقة متجر مجوهرات",                  lvl: 7,  energy: 20, rate: 0.6,  min: 150, max: 350, cd: 420, failOutcome: "both", jailMinutes: 10, hospitalMinutes: 5, hpLoss: 30, bailRate: 100, healRate: 60 },
      { name: "سرقة بنك كبير",                      lvl: 10, energy: 30, rate: 0.55, min: 300, max: 600, cd: 600, failOutcome: "jail", jailMinutes: 15, hospitalMinutes: 0, hpLoss: 0, bailRate: 150, healRate: 0 },
      { name: "سرقة قصر",                           lvl: 15, energy: 40, rate: 0.45, min: 500, max: 1000, cd: 900, failOutcome: "both", jailMinutes: 20, hospitalMinutes: 10, hpLoss: 50, bailRate: 200, healRate: 100 },
      // Test crime with 0% success rate and 5s cooldown for jail testing
      { name: "جريمة تجريبية (فشل دائم - سجن)", lvl: 1, energy: 1, rate: 0.0, min: 1, max: 1, cd: 5, failOutcome: "jail", jailMinutes: 1, hospitalMinutes: 0, hpLoss: 0, bailRate: 10, healRate: 0 },
      // Test crime for hospital with 0% success rate
      { name: "جريمة تجريبية للمستشفى", lvl: 1, energy: 1, rate: 0.0, min: 1, max: 1, cd: 5, failOutcome: "hospital", jailMinutes: 0, hospitalMinutes: 1, hpLoss: 20, bailRate: 0, healRate: 40 },
      // Test crime for both outcomes
      { name: "جريمة تجريبية (سجن + مستشفى)", lvl: 1, energy: 1, rate: 0.0, min: 1, max: 1, cd: 5, failOutcome: "both", jailMinutes: 1, hospitalMinutes: 1, hpLoss: 15, bailRate: 10, healRate: 30 },
    ];

    const toSlug = str => str.normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase();

    const crimes = baseCrimes.map((c, i) => ({
      name: c.name,
      slug: `${toSlug(c.name)}-${i+1}`,
      isEnabled: true,
      req_level: c.lvl,
      req_intel: Math.max(1, Math.floor(c.lvl / 2)),
      energyCost: c.energy,
      successRate: c.rate,
      minReward: c.min,
      maxReward: c.max,
      cooldown: c.cd,
      failOutcome: c.failOutcome,
      jailMinutes: c.jailMinutes,
      hospitalMinutes: c.hospitalMinutes,
      hpLoss: c.hpLoss,
      bailRate: c.bailRate,
      healRate: c.healRate,
    }));

    await Crime.bulkCreate(crimes, { ignoreDuplicates: true });
    console.log('✅ Crimes seeded');
  }
} 