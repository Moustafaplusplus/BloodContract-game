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
    try {
      const crime = await Crime.findByPk(crimeId);
      
      if (!crime || !crime.isEnabled) {
        throw new Error('Crime not found or disabled');
      }
      
      const character = await Character.findOne({ where: { userId } });
      if (!character) {
        throw new Error('Character not found');
      }
      
      // Check cooldown
      const now = Date.now();
      if (character.crimeCooldown && character.crimeCooldown > now) {
        const remainingSeconds = Math.ceil((character.crimeCooldown - now) / 1000);
        throw new Error(`يجب الانتظار ${remainingSeconds} ثانية قبل ارتكاب جريمة أخرى`);
      }
      
      // Calculate success chance based on level difference
      const levelDiff = crime.req_level - character.level;
      let successChance = 0.8; // Base 80% chance
      
      if (levelDiff > 0) {
        successChance = Math.max(0.1, successChance - (levelDiff * 0.1));
      } else if (levelDiff < 0) {
        successChance = Math.min(0.95, successChance + (Math.abs(levelDiff) * 0.05));
      }
      
      const isSuccess = Math.random() < successChance;
      
      if (isSuccess) {
        // Success: gain money and experience
        const moneyGain = crime.minReward; // Assuming minReward is the base reward
        const expGain = crime.expReward;
        
        character.money += moneyGain;
        character.exp += expGain;
        
        // Update statistics
        await CharacterService.addStat(userId, "crimes", 1);
        await CharacterService.addStat(userId, "crimesCommitted", 1);
        
        // Set cooldown
        character.crimeCooldown = now + (crime.cooldown * 1000);
        await character.save();
        
        return {
          success: true,
          message: `تم ارتكاب الجريمة بنجاح! حصلت على ${moneyGain} مال و ${expGain} خبرة`,
          moneyGain,
          expGain,
          cooldownMinutes: crime.cooldown
        };
      } else {
        // Failure: lose money and go to jail
        const moneyLoss = Math.floor(character.money * 0.1);
        character.money = Math.max(0, character.money - moneyLoss);
        
        // Set cooldown even on failure
        character.crimeCooldown = now + (crime.cooldown * 1000);
        await character.save();
        
        // Send to jail
        const jailTime = crime.jailMinutes || 30; // 30 minutes
        const { Jail } = await import('../models/Confinement.js');
        await Jail.create({
          userId,
          minutes: jailTime,
          reason: `فشل في ارتكاب جريمة: ${crime.name}`,
          startedAt: new Date(),
          releasedAt: new Date(Date.now() + jailTime * 60 * 1000)
        });
        
        return {
          success: false,
          message: `فشلت في ارتكاب الجريمة! خسرت ${moneyLoss} مال وتم إرسالك إلى السجن لمدة ${jailTime} دقيقة`,
          moneyLoss,
          jailTime
        };
      }
    } catch (error) {
      console.error('[CrimeService] Execute crime error:', error);
      throw error;
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