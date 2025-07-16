import { Fight } from '../models/Fight.js';
import { Character, User } from '../models/index.js';
import { CharacterService } from './CharacterService.js';
import { sequelize } from '../config/db.js';
import { Op } from 'sequelize';
import { io } from '../socket.js';
import { Hospital, Jail } from '../models/Confinement.js';

export class FightService {
  // Fight engine helpers
  static calcWeaponMult(weapon) {
    return (weapon?.rarity === "legendary" ? 2.5 : 1.5);
  }

  static calcArmorRed(armor) {
    return (armor?.def ?? 0) * 0.3;
  }

  // Helper to calculate a power score for fair winner determination
  static getPowerScore(char) {
    return (
      (char.level * 2) +
      (char.hp) +
      (char.defense * 1.5) +
      (char.strength * 1.5)
    );
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
      // Cap hit chance between 20% and 90%
      const hitChance = Math.max(20, Math.min(90, 50 + (a.level - d.level) * 1.2));
      const hitRoll = Math.random() * 100;

      if (hitRoll < hitChance) {
        const base = (a.strength + a.level * 2) * this.calcWeaponMult(a.weapon);
        // Add ±10% random range to damage
        const dmg = Math.max(5, (base - this.calcArmorRed(d.armor)) * (0.9 + Math.random() * 0.2));
        d.hp -= dmg;
        totalDamage += dmg;
        log.push(`الجولة ${round}: ${a.username} أصاب ${d.username} بـ ${dmg.toFixed(1)} ضرر.`);
      } else {
        log.push(`الجولة ${round}: ${a.username} أخطأ الهجوم.`);
      }
      if (d.hp <= 0) break;
      [a, d] = [d, a]; // swap roles
    }

    // Winner logic: if both alive, use power score
    let winner;
    if (atk.hp > 0 && def.hp > 0) {
      const atkPower = this.getPowerScore(atk);
      const defPower = this.getPowerScore(def);
      winner = atkPower >= defPower ? atk : def;
      log.push(`انتهت الجولات، تم تحديد الفائز بناءً على القوة الإجمالية: ${winner.username}`);
    } else {
      winner = atk.hp > def.hp ? atk : def;
    }

    return {
      winner,
      rounds: round,
      totalDamage,
      log,
      attackerFinalHp: atk.hp,
      defenderFinalHp: def.hp,
      attackerId: atk.userId,
      defenderId: def.userId,
    };
  }

  // Execute a fight
  static async runFight(attackerId, defenderId) {
    if (attackerId === defenderId) {
      throw new Error("لا يمكنك مهاجمة نفسك");
    }

    // Hospital and Jail status checks
    const now = new Date();
    const [attackerHospital, defenderHospital, attackerJail, defenderJail] = await Promise.all([
      Hospital.findOne({ where: { userId: attackerId, releasedAt: { [Op.gt]: now } } }),
      Hospital.findOne({ where: { userId: defenderId, releasedAt: { [Op.gt]: now } } }),
      Jail.findOne({ where: { userId: attackerId, releasedAt: { [Op.gt]: now } } }),
      Jail.findOne({ where: { userId: defenderId, releasedAt: { [Op.gt]: now } } })
    ]);
    
    if (attackerHospital) {
      throw new Error("لا يمكنك الهجوم وأنت في المستشفى");
    }
    if (defenderHospital) {
      throw new Error("لا يمكنك مهاجمة لاعب في المستشفى");
    }
    if (attackerJail) {
      throw new Error("لا يمكنك الهجوم وأنت في السجن");
    }
    if (defenderJail) {
      throw new Error("لا يمكنك مهاجمة لاعب في السجن");
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

      // --- FIX: Ensure winner's userId and username are correct ---
      const winnerUserId = result.winner.userId;
      let winnerUsername = null;
      if (winnerUserId === atkChar.userId) {
        winnerUsername = atkUser.username;
      } else if (winnerUserId === defChar.userId) {
        winnerUsername = defUser.username;
      }
      result.winner = {
        ...result.winner,
        userId: winnerUserId,
        username: winnerUsername,
      };
      // --- END FIX ---

      // --- NEW: Winner steals 30-40% of loser's money ---
      let winnerChar, loserChar;
      if (result.winner.userId === atkChar.userId) {
        winnerChar = atkChar;
        loserChar = defChar;
      } else {
        winnerChar = defChar;
        loserChar = atkChar;
      }
      const stealPercent = 0.3 + Math.random() * 0.1; // 30-40%
      const amountStolen = Math.floor(loserChar.money * stealPercent);
      if (amountStolen > 0) {
        loserChar.money = Math.max(0, loserChar.money - amountStolen);
        winnerChar.money += amountStolen;
        result.log.push(`${winnerChar.name} سرق ${amountStolen} من المال من ${loserChar.name}`);
      }
      // --- END NEW ---

      // Realistic XP reward: base + loser level + bonus for close fights + money factor
      let xpGain = 20 + (loserChar.level * 2) + Math.floor(amountStolen / 1000);
      if (result.rounds > 15) xpGain += 10; // bonus for long/close fights
      if (winnerChar && winnerChar.vipExpiresAt && new Date(winnerChar.vipExpiresAt) > new Date()) {
        xpGain = Math.round(xpGain * 1.5);
      }
      if (result.winner.userId === atkChar.userId) {
        atkChar.exp += xpGain;
        await CharacterService.maybeLevelUp(atkChar);
        atkChar.killCount = (atkChar.killCount || 0) + 1;
      } else {
        defChar.exp += xpGain;
        await CharacterService.maybeLevelUp(defChar);
        defChar.killCount = (defChar.killCount || 0) + 1;
      }
      await winnerChar.save({ transaction: t });
      await loserChar.save({ transaction: t });
      // Add amountStolen to result for frontend
      result.amountStolen = amountStolen;

      // Persist new HP values (can't go below 0)
      atkChar.hp = Math.round(Math.max(result.attackerFinalHp, 0));
      defChar.hp = Math.round(Math.max(result.defenderFinalHp, 0));
      await Promise.all([
        atkChar.save({ transaction: t }), 
        defChar.save({ transaction: t })
      ]);

      // Save fight result to the database
      await Fight.create({
        attacker_id: attackerId,
        defender_id: defenderId,
        winner_id: result.winner.userId,
        damage_given: result.totalDamage,
        log: result.log,
      }, { transaction: t });

      // Hospital logic: send to hospital if HP is 0
      const now = new Date();
      if (atkChar.hp === 0) {
        // Dynamic hospital stay based on level
        const levelMultiplier = Math.max(0.5, Math.min(2.0, atkChar.level / 10));
        const hospitalStay = Math.round(3 * levelMultiplier); // Base 3 minutes
        const hpLoss = Math.round(20 * levelMultiplier);
        const healRate = Math.round(3 * levelMultiplier);
        
        const hospitalRecord = await Hospital.create({
          userId: atkChar.userId,
          minutes: hospitalStay,
          hpLoss: hpLoss,
          healRate: healRate,
          startedAt: now,
          releasedAt: new Date(now.getTime() + hospitalStay * 60_000),
        }, { transaction: t });
        if (io) {
          io.to(`user:${atkChar.userId}`).emit('hospital:enter', {
            releaseAt: hospitalRecord.releasedAt,
            reason: 'fight',
          });
        }
      }
      if (defChar.hp === 0) {
        // Dynamic hospital stay based on level
        const levelMultiplier = Math.max(0.5, Math.min(2.0, defChar.level / 10));
        const hospitalStay = Math.round(3 * levelMultiplier); // Base 3 minutes
        const hpLoss = Math.round(20 * levelMultiplier);
        const healRate = Math.round(3 * levelMultiplier);
        
        const hospitalRecord = await Hospital.create({
          userId: defChar.userId,
          minutes: hospitalStay,
          hpLoss: hpLoss,
          healRate: healRate,
          startedAt: now,
          releasedAt: new Date(now.getTime() + hospitalStay * 60_000),
        }, { transaction: t });
        if (io) {
          io.to(`user:${defChar.userId}`).emit('hospital:enter', {
            releaseAt: hospitalRecord.releasedAt,
            reason: 'fight',
          });
        }
      }

      await CharacterService.addStat(attackerId, "fights");

      // --- NEW: Update wins and losses for both players ---
      const winnerId = result.winner.userId;
      const loserId = (winnerId === attackerId) ? defenderId : attackerId;
      await CharacterService.addFightResult(winnerId, loserId);
      // --- END NEW ---

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

  // Get challengeable players (5 levels above or below)
  static async getChallengeablePlayers(userId, limit = 5) {
    const currentUser = await Character.findOne({ where: { userId } });
    if (!currentUser) {
      throw new Error('Character not found');
    }

    const minLevel = Math.max(1, currentUser.level - 5);
    const maxLevel = currentUser.level + 5;

    const players = await Character.findAll({
      where: {
        userId: { [Op.ne]: userId }, // Exclude current user
        level: {
          [Op.between]: [minLevel, maxLevel]
        }
      },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'avatarUrl']
        }
      ],
      attributes: ['id', 'name', 'level', 'strength', 'defense', 'hp', 'maxHp', 'killCount'],
      order: sequelize.literal('RANDOM()'), // Random order
      limit
    });

    return players.map(player => ({
      id: player.id,
      userId: player.userId,
      name: player.name,
      username: player.User.username,
      level: player.level,
      strength: player.strength,
      defense: player.defense,
      hp: player.hp,
      maxHp: player.maxHp,
      killCount: player.killCount,
      avatarUrl: player.User.avatarUrl
    }));
  }

  // Search for players by username or character name
  static async searchPlayers(userId, query, limit = 10) {
    if (!query || query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters');
    }
    const players = await Character.findAll({
      where: {
        userId: { [Op.ne]: userId },
        [Op.or]: [
          { name: { [Op.iLike]: `%${query.trim()}%` } },
        ],
      },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'avatarUrl'],
        },
      ],
      attributes: ['id', 'name', 'level', 'strength', 'defense', 'hp', 'maxHp', 'killCount', 'daysInGame', 'avatarUrl'],
      limit
    });
    // Add matches for username as well
    const usernameMatches = await Character.findAll({
      where: {
        userId: { [Op.ne]: userId },
      },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'avatarUrl'],
          where: {
            username: { [Op.iLike]: `%${query.trim()}%` },
          },
        },
      ],
      attributes: ['id', 'name', 'level', 'strength', 'defense', 'hp', 'maxHp', 'killCount', 'daysInGame', 'avatarUrl'],
      limit
    });
    // Merge and deduplicate by userId
    const allPlayers = [...players, ...usernameMatches].reduce((acc, player) => {
      if (!acc.some(p => p.userId === player.userId)) acc.push(player);
      return acc;
    }, []);
    // Return in the same structure as /api/v1/search/users
    return allPlayers.map(player => ({
      id: player.User ? player.User.id : null,
      username: player.User ? player.User.username : '',
      avatarUrl: player.User ? player.User.avatarUrl : '',
      character: {
        id: player.id,
        name: player.name,
        level: player.level,
        strength: player.strength,
        defense: player.defense,
        hp: player.hp,
        maxHp: player.maxHp,

        killCount: player.killCount,
        daysInGame: player.daysInGame,
        avatarUrl: player.avatarUrl,
      }
    }));
  }
} 