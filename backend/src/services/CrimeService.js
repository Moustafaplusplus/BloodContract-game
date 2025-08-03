import { Crime, CrimeLog } from '../models/Crime.js';
import { Character } from '../models/Character.js';
import { CharacterService } from './CharacterService.js';
import { Hospital, Jail } from '../models/Confinement.js';
import { sequelize } from '../config/db.js';
import { io } from '../socket.js';
import { User } from '../models/User.js';
import { TaskService } from './TaskService.js';


export class CrimeService {
  static randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static async getAvailableCrimes(userLevel = 1) {
    const crimes = await Crime.findAll({ where: { isEnabled: true } });
    return crimes.filter(c => c.req_level <= userLevel).map(c => ({
      id:         c.id,
      name:       c.name,
      description: c.description,
      req_level:  c.req_level,
      energyCost: c.energyCost,
      minReward:  c.minReward,
      maxReward:  c.maxReward,
      cooldown:   c.cooldown,
      chance:     Math.round(c.successRate * 100),
      expGain:    c.expReward,
      imageUrl:   c.imageUrl,
    }));
  }

  static async getAllCrimes() {
    const crimes = await Crime.findAll();
    return crimes.map(c => ({
      id:         c.id,
      name:       c.name,
      description: c.description,
      isEnabled:  c.isEnabled,
      req_level:  c.req_level,
      energyCost: c.energyCost,
      successRate: c.successRate,
      minReward:  c.minReward,
      maxReward:  c.maxReward,
      cooldown:   c.cooldown,
      expReward:  c.expReward,
      imageUrl:   c.imageUrl,
      failOutcome: c.failOutcome,
      jailMinutes: c.jailMinutes,
      hospitalMinutes: c.hospitalMinutes,
    }));
  }

  static async getCrimeById(crimeId) {
    const crime = await Crime.findByPk(crimeId);
    if (!crime) return null;
    
    return {
      id:         crime.id,
      name:       crime.name,
      description: crime.description,
      isEnabled:  crime.isEnabled,
      req_level:  crime.req_level,
      energyCost: crime.energyCost,
      successRate: crime.successRate,
      minReward:  crime.minReward,
      maxReward:  crime.maxReward,
      cooldown:   crime.cooldown,
      expReward:  crime.expReward,
      imageUrl:   crime.imageUrl,
      failOutcome: crime.failOutcome,
      jailMinutes: crime.jailMinutes,
      hospitalMinutes: crime.hospitalMinutes,
    };
  }

  static generateCrimeNarrative(character, crime, success, payout, expGain, redirect) {
    const levelDiff = character.level - crime.req_level;
    const isHighLevelCrime = levelDiff < 0;
    const isLowLevelCrime = levelDiff > 5;
    
    let narrative = "";
    
    if (success) {
      if (isHighLevelCrime) {
        narrative = `مهمة خطيرة وطموحة! لقد نجحت في تنفيذ "${crime.name}" رغم أن مستواك أقل من المطلوب بـ ${Math.abs(levelDiff)} مستوى. هذا يثبت مهارتك الاستثنائية!`;
      } else if (isLowLevelCrime) {
        narrative = `مهمة سهلة بالنسبة لمستواك! لقد أكملت "${crime.name}" ببراعة، مما يظهر خبرتك الكبيرة في هذا المجال.`;
      } else {
        narrative = `مهمة متوازنة! لقد نجحت في تنفيذ "${crime.name}" بكفاءة عالية، مما يثبت أنك في المستوى المناسب لهذا النوع من العمليات.`;
      }
      
      if (payout > crime.maxReward * 0.8) {
        narrative += " المكافأة كانت سخية جداً، مما يشير إلى أن العملية كانت أكثر تعقيداً من المتوقع.";
      } else if (payout < crime.minReward * 1.2) {
        narrative += " المكافأة كانت متواضعة، لكن النجاح نفسه هو الأهم في هذه المهمة.";
      }
    } else {
      if (isHighLevelCrime) {
        narrative = `محاولة جريئة لكنها فشلت! "${crime.name}" كان أصعب من قدراتك الحالية. ربما حان الوقت للتدريب أكثر قبل محاولة مهام بهذا المستوى.`;
      } else if (isLowLevelCrime) {
        narrative = `فشل غير متوقع! رغم أن "${crime.name}" يجب أن يكون سهلاً لمستواك، لكن الحظ لم يكن في صفك هذه المرة.`;
      } else {
        narrative = `مهمة صعبة! لقد فشلت في تنفيذ "${crime.name}"، لكن هذه تجربة مفيدة ستساعدك في المهام القادمة.`;
      }
      
      if (redirect && redirect.includes("jail")) {
        narrative += " تم القبض عليك ووضعك في السجن. ربما كان عليك التخطيط بشكل أفضل أو اختيار توقيت مختلف.";
      } else if (redirect && redirect.includes("hospital")) {
        narrative += " أصبت بجروح خطيرة وتم نقلك إلى المستشفى. المهمة كانت أكثر خطورة من المتوقع.";
      } else {
        narrative += " رغم الفشل، لم تتعرض لعواقب خطيرة. هذا درس مفيد في تقييم المخاطر.";
      }
    }
    
    return narrative;
  }

  static async executeCrime(userId, crimeId) {
    const tx = await sequelize.transaction();
    try {
      console.log(`[CrimeService] Executing crime ${crimeId} for user ${userId}`);
      const crime = await Crime.findByPk(crimeId, { transaction: tx });
      if (!crime || !crime.isEnabled) {
        console.log(`[CrimeService] Crime not found or disabled:`, { crimeId, crime: crime ? crime.toJSON() : null });
        throw { status: 404, msg: "Crime not found" };
      }

      const character = await Character.findOne({ 
        where: { userId }, 
        transaction: tx, 
        lock: tx.LOCK.UPDATE 
      });
      if (!character) {
        console.log(`[CrimeService] Character not found for user ${userId}`);
        throw { status: 404, msg: "Character not found" };
      }

      // Validation checks
      if (character.level < crime.req_level) {
        throw { status: 400, msg: "Level too low" };
      }
      if (character.energy < crime.energyCost) {
        throw { status: 400, msg: "Not enough energy" };
      }

      const nowMs = Date.now();
      if (character.crimeCooldown && character.crimeCooldown > nowMs) {
        const secLeft = Math.floor((character.crimeCooldown - nowMs) / 1000);
        throw { status: 429, msg: "Crime on cooldown", meta: { cooldownLeft: secLeft } };
      }

      const success = Math.random() < Number(crime.successRate);
      let payout = success ? this.randInt(crime.minReward, crime.maxReward) : 0;
      let expGain = success ? crime.expReward : Math.round(crime.expReward * 0.3);
      if (character && character.vipExpiresAt && new Date(character.vipExpiresAt) > new Date()) {
        payout = Math.round(payout * 1.5);
        expGain = Math.round(expGain * 1.5);
      }

      // Apply rewards
      if (payout) character.money += payout;
      character.exp += expGain;
      const levelUpRewards = await CharacterService.maybeLevelUp(character);

      let redirect = null;
      let confinementDetails = null;
      if (!success) {
        let possibleOutcomes = [];
        if (crime.failOutcome === "jail" || crime.failOutcome === "both") possibleOutcomes.push("jail");
        if (crime.failOutcome === "hospital" || crime.failOutcome === "both") possibleOutcomes.push("hospital");
        let chosenOutcome = possibleOutcomes.length === 2 ? (Math.random() < 0.5 ? "jail" : "hospital") : possibleOutcomes[0];
        if (chosenOutcome === "jail") {
          const jailMinutes = crime.jailMinutes || 30;
          const jailRecord = await Jail.create({
            userId: userId,
            minutes: jailMinutes,
            bailRate: 200,
            releasedAt: new Date(nowMs + jailMinutes * 60_000),
          }, { transaction: tx });
          if (io) {
            io.to(`user:${userId}`).emit('jail:enter', {
              releaseAt: jailRecord.releasedAt,
              reason: 'crime',
            });
          }
          redirect = "/dashboard/jail";
          confinementDetails = {
            type: "jail",
            minutes: jailMinutes,
            releaseAt: jailRecord.releasedAt
          };
        } else if (chosenOutcome === "hospital") {
          const hospitalMinutes = crime.hospitalMinutes || 30;
          const hpLoss = crime.hpLoss || 50;
          const hospitalRecord = await Hospital.create({
            userId: userId,
            minutes: hospitalMinutes,
            hpLoss: hpLoss,
            healRate: 200,
            releasedAt: new Date(nowMs + hospitalMinutes * 60_000),
          }, { transaction: tx });
          if (io) {
            io.to(`user:${userId}`).emit('hospital:enter', {
              releaseAt: hospitalRecord.releasedAt,
              reason: 'crime',
            });
          }
          redirect = "/dashboard/hospital";
          confinementDetails = {
            type: "hospital",
            minutes: hospitalMinutes,
            hpLoss: hpLoss,
            releaseAt: hospitalRecord.releasedAt
          };
        }
      }

      character.energy -= crime.energyCost;
      character.crimeCooldown = nowMs + crime.cooldown * 1000;
      await character.save({ transaction: tx });

      await CharacterService.addStat(userId, "crimes", 1, tx);

      await CrimeLog.create({
        userId: userId,
        crimeId: crime.id,
        success,
        payout,
      }, { transaction: tx });

      await tx.commit();
      
      // After successful commit, handle non-critical operations
      try {
        const narrative = this.generateCrimeNarrative(character, crime, success, payout, expGain, redirect);
        
        // Emit real-time updates
        if (io) {
          // Update HUD
          const hudData = await character.toSafeJSON();
          io.to(String(userId)).emit('hud:update', hudData);
          
          // Update crime-specific data
          const now = Date.now();
          const crimeCooldown = character.crimeCooldown && character.crimeCooldown > now 
            ? Math.floor((character.crimeCooldown - now) / 1000) 
            : 0;
          
          io.to(String(userId)).emit('crime:update', {
            crimeCooldown,
            energy: character.energy,
            maxEnergy: character.maxEnergy
          });
          
          // Update inventory if items were gained
          if (success && payout > 0) {
            const { InventoryService } = await import('./InventoryService.js');
            const inventory = await InventoryService.getUserInventory(userId);
            io.to(String(userId)).emit('inventory:update', inventory);
          }
          
          // Update bank if money was gained
          if (success && payout > 0) {
            const bank = await Bank.findOne({ where: { userId } });
            if (bank) {
              io.to(String(userId)).emit('bank:update', bank);
            }
          }
          
          // Update tasks
          if (success) {
            const tasks = await Task.findAll({ where: { isActive: true } });
            io.to(String(userId)).emit('tasks:update', tasks);
          }
        }
        
        if (success) {
          await TaskService.updateProgress(userId, 'crimes_committed', 1);
        }

        return {
            success,
            payout,
            expGain,
            energyLeft: character.energy,
            cooldownLeft: crime.cooldown,
            currentExp: character.exp,
            currentLevel: character.level,
            nextLevelExp: character.expNeeded(),
            levelUpRewards: levelUpRewards.length > 0 ? levelUpRewards : null,
            levelsGained: levelUpRewards.length,
            crimeName: crime.name,
            crimeDescription: crime.description,
            narrative,
            redirect,
            confinementDetails
        };
      } catch (postCommitError) {
        // Log post-commit errors but don't rollback (transaction already committed)
        console.error(`[CrimeService] Post-commit error for crime ${crimeId} user ${userId}:`, postCommitError);
        
        // Return basic success response even if post-commit operations failed
        return {
            success,
            payout,
            expGain,
            energyLeft: character.energy,
            cooldownLeft: crime.cooldown,
            currentExp: character.exp,
            currentLevel: character.level,
            nextLevelExp: character.expNeeded(),
            levelUpRewards: levelUpRewards.length > 0 ? levelUpRewards : null,
            levelsGained: levelUpRewards.length,
            crimeName: crime.name,
            crimeDescription: crime.description,
            narrative: this.generateCrimeNarrative(character, crime, success, payout, expGain, redirect),
            redirect,
            confinementDetails
        };
      }
    } catch (err) {
      // Only rollback if transaction hasn't been committed yet
      if (tx && !tx.finished) {
        await tx.rollback();
      }
      console.error(`[CrimeService] Error executing crime ${crimeId} for user ${userId}:`, err);
      throw err;
    }
  }

  static async createCrime(data) {
    // Only allow fields defined in the model
    const allowedFields = [
      'name', 'description', 'isEnabled', 'req_level', 'energyCost',
      'successRate', 'minReward', 'maxReward', 'cooldown', 'failOutcome',
      'jailMinutes', 'hospitalMinutes', 'expReward', 'imageUrl'
    ];
    const crimeData = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) crimeData[field] = data[field];
    }
    const crime = await Crime.create(crimeData);
    return crime;
  }

  static async updateCrime(crimeId, data) {
    const crime = await Crime.findByPk(crimeId);
    if (!crime) return null;

    // Only allow fields defined in the model
    const allowedFields = [
      'name', 'description', 'isEnabled', 'req_level', 'energyCost',
      'successRate', 'minReward', 'maxReward', 'cooldown', 'failOutcome',
      'jailMinutes', 'hospitalMinutes', 'expReward', 'imageUrl'
    ];
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        crime[field] = data[field];
      }
    }
    
    await crime.save();
    return crime;
  }

  static async deleteCrime(crimeId) {
    const crime = await Crime.findByPk(crimeId);
    if (!crime) return false;
    
    await crime.destroy();
    return true;
  }

  static async seedCrimes() {
    await Crime.destroy({ where: {} });
    console.log('✅ Crimes cleared, none seeded');
  }
} 