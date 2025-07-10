import { Fight } from '../models/Fight.js';
import { Character } from '../models/Character.js';
import { User } from '../models/User.js';
import { CharacterService } from './CharacterService.js';
import { sequelize } from '../config/db.js';
import { io } from '../socket.js';

export class FightService {
  // Fight engine helpers
  static calcWeaponMult(weapon) {
    return (weapon?.rarity === "legendary" ? 2.5 : 1.5);
  }

  static calcArmorRed(armor) {
    return (armor?.def ?? 0) * 0.3;
  }

  // Calculate fight result
  static calculateFightResult(attacker, defender) {
    const MAX_ROUNDS = 20;
    const log = [];

    const atk = { ...attacker }; // clone so we can mutate
    const def = { ...defender };

    let a = atk;
    let d = def;
    let totalDamage = 0;
    let round = 1;

    for (; round <= MAX_ROUNDS; round++) {
      const hitChance = 50 + (a.level - d.level) * 1.2;
      const hitRoll = Math.random() * 100;

      if (hitRoll < hitChance) {
        const base = (a.strength + a.level * 2) * this.calcWeaponMult(a.weapon);
        const dmg = Math.max(5, base - this.calcArmorRed(d.armor));
        d.hp -= dmg;
        totalDamage += dmg;
        log.push(`الجولة ${round}: ${a.username} أصاب ${d.username} بـ ${dmg.toFixed(1)} ضرر.`);
      } else {
        log.push(`الجولة ${round}: ${a.username} أخطأ الهجوم.`);
      }
      if (d.hp <= 0) break;
      [a, d] = [d, a]; // swap roles
    }

    const winner = a.hp > d.hp ? a : d;
    return {
      winner,
      rounds: round,
      totalDamage,
      log,
      attackerFinalHp: atk.hp,
      defenderFinalHp: def.hp,
    };
  }

  // Execute a fight
  static async runFight(attackerId, defenderId) {
    if (attackerId === defenderId) {
      throw new Error("لا يمكنك مهاجمة نفسك");
    }

    const t = await sequelize.transaction();
    try {
      const [atkChar, defChar] = await Promise.all([
        Character.findOne({ 
          where: { userId: attackerId }, 
          transaction: t, 
          lock: t.LOCK.UPDATE 
        }),
        Character.findOne({ 
          where: { userId: defenderId }, 
          transaction: t, 
          lock: t.LOCK.UPDATE 
        }),
      ]);
      
      if (!atkChar || !defChar) {
        throw new Error("الشخصية غير موجودة");
      }

      const [atkUser, defUser] = await Promise.all([
        User.findByPk(attackerId, { attributes: ["username"], transaction: t }),
        User.findByPk(defenderId, { attributes: ["username"], transaction: t }),
      ]);

      const attacker = { ...atkChar.toJSON(), username: atkUser.username };
      const defender = { ...defChar.toJSON(), username: defUser.username };

      const result = this.calculateFightResult(attacker, defender);

      // Create fight record
      await Fight.create({
        attacker_id: attacker.userId,
        defender_id: defender.userId,
        winner_id: result.winner.userId,
        damage_given: result.totalDamage,
        log: result.log,
      }, { transaction: t });

      // Winner XP – scaled by rounds (longer = harder)
      const xpGain = Math.round(result.rounds * 2);
      result.winner.exp += xpGain;
      await CharacterService.maybeLevelUp(result.winner);
      // Increment killCount for winner
      result.winner.killCount = (result.winner.killCount || 0) + 1;
      await result.winner.save({ transaction: t });

      // Persist new HP values (can't go below 0)
      atkChar.hp = Math.max(result.attackerFinalHp, 0);
      defChar.hp = Math.max(result.defenderFinalHp, 0);
      await Promise.all([
        atkChar.save({ transaction: t }), 
        defChar.save({ transaction: t })
      ]);

      await CharacterService.addStat(attackerId, "fights");

      await t.commit();

      // Live update via Socket.IO
      if (io) {
        io.to(`user:${attackerId}`).emit("fightResult", result);
        io.to(`user:${defenderId}`).emit("fightResult", result);
      }

      return { ...result, xpGain };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
} 