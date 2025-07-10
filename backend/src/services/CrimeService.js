import { Crime, CrimeLog } from '../models/Crime.js';
import { Character } from '../models/Character.js';
import { CharacterService } from './CharacterService.js';
import { Hospital, Jail } from '../models/Confinement.js';
import { sequelize } from '../config/db.js';

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
      const payout = success ? this.randInt(crime.minReward, crime.maxReward) : 0;

      // XP scales with energy cost (rounded)
      const expGain = success ? crime.energyCost * 2 : Math.round(crime.energyCost * 0.5);

      // Apply rewards
      if (payout) character.money += payout;
      character.exp += expGain;
      await CharacterService.maybeLevelUp(character);

      // Handle failure consequences
      let redirect = null;
      if (!success) {
        if (crime.failOutcome === "jail" || crime.failOutcome === "both") {
          redirect = "/jail";
          await Jail.create({
            userId: character.id,
            minutes: crime.jailMinutes,
            bailRate: crime.bailRate,
            releasedAt: new Date(nowMs + crime.jailMinutes * 60_000),
          }, { transaction: tx });
        }
        if (crime.failOutcome === "hospital" || (crime.failOutcome === "both" && !redirect)) {
          redirect = "/hospital";
          await Hospital.create({
            userId: character.id,
            minutes: crime.hospitalMinutes,
            hpLoss: crime.hpLoss,
            healRate: crime.healRate,
            releasedAt: new Date(nowMs + crime.hospitalMinutes * 60_000),
          }, { transaction: tx });
        }
      }

      // Update character state
      character.energy -= crime.energyCost;
      character.crimeCooldown = nowMs + crime.cooldown * 1000;
      await character.save({ transaction: tx });

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
        cooldownLeft: crime.cooldown, 
        redirect 
      };
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

  // Seed crimes data
  static async seedCrimes() {
    const baseCrimes = [
      { name: "سرقة محفظة في الزحام",                lvl: 1,  energy: 5,  rate: 0.9,  min: 15,  max: 40,  cd: 60  },
      { name: "رشّ كتابات على حائط عام",             lvl: 1,  energy: 5,  rate: 0.88, min: 20,  max: 45,  cd: 90 },
      { name: "سرقة دراجة هوائية",                  lvl: 2,  energy: 7,  rate: 0.85, min: 25,  max: 60,  cd: 120 },
      { name: "سرقة سيارة",                         lvl: 3,  energy: 10, rate: 0.8,  min: 50,  max: 120, cd: 180 },
      { name: "سرقة بنك صغير",                      lvl: 5,  energy: 15, rate: 0.7,  min: 100, max: 250, cd: 300 },
      { name: "سرقة متجر مجوهرات",                  lvl: 7,  energy: 20, rate: 0.65, min: 150, max: 350, cd: 420 },
      { name: "سرقة بنك كبير",                      lvl: 10, energy: 30, rate: 0.6,  min: 300, max: 600, cd: 600 },
      { name: "سرقة قصر",                           lvl: 15, energy: 40, rate: 0.5,  min: 500, max: 1000, cd: 900 },
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
    }));

    await Crime.bulkCreate(crimes, { ignoreDuplicates: true });
    console.log('✅ Crimes seeded');
  }
} 