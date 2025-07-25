import { Crime, CrimeLog } from '../models/Crime.js';
import { Character } from '../models/Character.js';
import { CharacterService } from './CharacterService.js';
import { Hospital, Jail } from '../models/Confinement.js';
import { sequelize } from '../config/db.js';
import { io, emitNotification } from '../socket.js';
import { User } from '../models/User.js';
import { TaskService } from './TaskService.js';
import { NotificationService } from './NotificationService.js';

export class CrimeService {
  // Utility helpers
  static randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Get available crimes for a character
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

  // Get all crimes for admin
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

  // Get a specific crime by ID
  static async getCrimeById(crimeId) {
    const crime = await Crime.findByPk(crimeId);
    if (!crime) return null;
    
    return {
      id:         crime.id,
      name:       crime.name,
      description: crime.description,
      isEnabled:  crime.isEnabled,
      req_level:  crime.req_level,
      energyCost: c.energyCost,
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

  // Generate narrative for crime execution
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
      const success = Math.random() < Number(crime.successRate);
      let payout = success ? this.randInt(crime.minReward, crime.maxReward) : 0;
      let expGain = success ? crime.expReward : Math.round(crime.expReward * 0.3);
      // VIP bonus
      if (character && character.vipExpiresAt && new Date(character.vipExpiresAt) > new Date()) {
        payout = Math.round(payout * 1.5);
        expGain = Math.round(expGain * 1.5);
      }

      // Apply rewards
      if (payout) character.money += payout;
      character.exp += expGain;
      const levelUpRewards = await CharacterService.maybeLevelUp(character);

      // Handle failure consequences with dynamic scaling based on level
      let redirect = null;
      let confinementDetails = null;
      if (!success) {
        // Dynamic scaling: higher level = longer confinement and higher fees
        const levelMultiplier = character.level / 10; // scales with level, no cap
        // Decide outcome: 50% jail, 50% hospital, never both
        let possibleOutcomes = [];
        if (crime.failOutcome === "jail" || crime.failOutcome === "both") possibleOutcomes.push("jail");
        if (crime.failOutcome === "hospital" || crime.failOutcome === "both") possibleOutcomes.push("hospital");
        // If both are possible, pick one randomly
        let chosenOutcome = possibleOutcomes.length === 2 ? (Math.random() < 0.5 ? "jail" : "hospital") : possibleOutcomes[0];
        if (chosenOutcome === "jail") {
          const dynamicJailMinutes = Math.round(crime.jailMinutes * levelMultiplier);
          const baseBailRate = 200;
          const dynamicBailRate = dynamicJailMinutes * baseBailRate;
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
          redirect = "/dashboard/jail";
          confinementDetails = {
            type: "jail",
            minutes: dynamicJailMinutes,
            bailRate: dynamicBailRate,
            releaseAt: jailRecord.releasedAt
          };
        } else if (chosenOutcome === "hospital") {
          const dynamicHospitalMinutes = Math.round(crime.hospitalMinutes * levelMultiplier);
          const baseHealRate = 200;
          const dynamicHealRate = dynamicHospitalMinutes * baseHealRate;
          const dynamicHpLoss = Math.round((crime.hpLoss || 50) * levelMultiplier);
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
          redirect = "/dashboard/hospital";
          confinementDetails = {
            type: "hospital",
            minutes: dynamicHospitalMinutes,
            healRate: dynamicHealRate,
            hpLoss: dynamicHpLoss,
            releaseAt: hospitalRecord.releasedAt
          };
        }
      }

      // Update character state
      character.energy -= crime.energyCost;
      character.crimeCooldown = nowMs + crime.cooldown * 1000;
      await character.save({ transaction: tx });

      // Increment crimes stat
      await CharacterService.addStat(userId, "crimes", 1, tx);

      // Audit log
      await CrimeLog.create({
        userId: character.id,
        crimeId: crime.id,
        success,
        payout,
      }, { transaction: tx });

      await tx.commit();
      
      // Generate narrative
      const narrative = this.generateCrimeNarrative(character, crime, success, payout, expGain, redirect);
      
      // Send immediate HUD update if level-up occurred
      if (levelUpRewards.length > 0 && io) {
        const hudData = await character.toSafeJSON();
        io.to(String(userId)).emit('hud:update', hudData);
      }
      
      // After successful crime execution (success === true):
      if (success) {
        await TaskService.updateProgress(userId, 'crimes_committed', 1);
      }

      // Create notifications
      try {
        if (success) {
          // Success notification
          const successNotification = await NotificationService.createNotification(
            userId,
            'SYSTEM',
            'نجحت في الجريمة',
            `نجحت في تنفيذ "${crime.name}" وحصلت على ${payout} مال و ${expGain} خبرة`,
            { 
              crimeName: crime.name,
              payout,
              expGain,
              energyCost: crime.energyCost
            }
          );
          emitNotification(userId, successNotification);
        } else {
          // Failure notification
          let failureMessage = `فشلت في تنفيذ "${crime.name}"`;
          if (confinementDetails) {
            if (confinementDetails.type === 'jail') {
              failureMessage += ` وتم سجنك لمدة ${confinementDetails.minutes} دقيقة`;
            } else if (confinementDetails.type === 'hospital') {
              failureMessage += ` وتم إدخالك المستشفى لمدة ${confinementDetails.minutes} دقيقة`;
            }
          }
          
          const failureNotification = await NotificationService.createNotification(
            userId,
            'SYSTEM',
            'فشلت في الجريمة',
            failureMessage,
            { 
              crimeName: crime.name,
              confinementDetails
            }
          );
          emitNotification(userId, failureNotification);
        }
      } catch (notificationError) {
        console.error('[CrimeService] Notification error:', notificationError);
        // Continue even if notifications fail
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
    } catch (err) {
      await tx.rollback();
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

  // Seed crimes data
  static async seedCrimes() {
    // No crimes are seeded by default
    await Crime.destroy({ where: {} });
    console.log('✅ Crimes cleared, none seeded');
  }
} 