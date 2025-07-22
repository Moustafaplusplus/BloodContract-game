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
  static getFameScore(char) {
    // Fame is now included in char.fame (should be present in attacker/defender objects)
    return char.fame || 0;
  }

  // Calculate fight result
  static calculateFightResult(attacker, defender) {
    const MAX_ROUNDS = 20;
    const log = [];

    // Only use fame for all calculations
    const atk = { ...attacker }; // clone so we can mutate
    const def = { ...defender };

    let a = atk;
    let d = def;
    let attackerDamage = 0;
    let defenderDamage = 0;
    let round = 1;

    for (; round <= MAX_ROUNDS; round++) {
      // Fame-based hit chance
      const fameA = Number(a.fame) || 1;
      const fameD = Number(d.fame) || 1;
      const totalFame = fameA + fameD;
      let hitChance = (fameA / totalFame) * 100;
      // Add extra 20% if attacker has higher fame
      if (fameA > fameD) {
        hitChance = Math.min(hitChance + 20, 100);
      }
      const hitRoll = Math.random() * 100;

      if (hitRoll < hitChance) {
        // New: Fame-based damage: 5-8% of total fame
        const dmg = Math.max(1, fameA * (0.05 + Math.random() * 0.03));
        d.hp -= dmg;
        
        // Track damage by player
        if (a.userId === attacker.userId) {
          attackerDamage += dmg;
        } else {
          defenderDamage += dmg;
        }
        
        log.push(`الجولة ${round}: ${a.username} أصاب ${d.username} بـ ${dmg.toFixed(1)} ضرر.`);
      } else {
        log.push(`الجولة ${round}: ${a.username} أخطأ الهجوم.`);
      }
      if (d.hp <= 0) break;
      [a, d] = [d, a]; // swap roles
    }

    // Winner logic: if both alive, use fame score only
    let winner;
    if (atk.hp > 0 && def.hp > 0) {
      const atkFame = Number(atk.fame) || 0;
      const defFame = Number(def.fame) || 0;
      winner = atkFame >= defFame ? atk : def;
      log.push(`انتهت الجولات، تم تحديد الفائز بناءً على الشهرة فقط: ${winner.username}`);
    } else {
      winner = atk.hp > def.hp ? atk : def;
    }

    return {
      winner,
      rounds: round,
      totalDamage: attackerDamage + defenderDamage,
      attackerDamage,
      defenderDamage,
      log,
      attackerFinalHp: atk.hp,
      defenderFinalHp: def.hp,
      attackerId: atk.userId,
      defenderId: def.userId,
    };
  }

  // Generate narrative for the fight
  static generateFightNarrative(attacker, defender, result, isAttackerWinner) {
    const levelDiff = attacker.level - defender.level;
    const damageRatio = result.attackerDamage / (result.attackerDamage + result.defenderDamage);
    
    let narrative = "";
    
    if (isAttackerWinner) {
      if (levelDiff >= 10) {
        narrative = `لقد أثبتت تفوقك الكامل على ${defender.username}! مع فارق مستوى ${levelDiff}، كان هذا انتصاراً سهلاً يليق بمقاتل من مستواك.`;
      } else if (levelDiff >= 5) {
        narrative = `انتصار قوي ضد ${defender.username}! مهاراتك المتقدمة جعلت الفرق واضحاً في هذه المعركة.`;
      } else if (levelDiff >= -5) {
        narrative = `معركة متكافئة انتهت لصالحك! أثبتت أن المهارة أهم من المستوى في مواجهة ${defender.username}.`;
      } else {
        narrative = `انتصار مذهل! لقد هزمت ${defender.username} رغم أنه أقوى منك بـ ${Math.abs(levelDiff)} مستوى. هذا يثبت براعتك الاستثنائية!`;
      }
      
      if (damageRatio > 0.7) {
        narrative += " لقد سيطرت على المعركة من البداية وألحقت ضرراً هائلاً.";
      } else if (damageRatio < 0.4) {
        narrative += " رغم أنك تلقت ضرراً كبيراً، لكن إرادتك القوية قادتك للانتصار.";
      }
    } else {
      if (levelDiff >= 10) {
        narrative = `هزيمة مخزية! كيف خسرت أمام ${defender.username} رغم تفوقك بـ ${levelDiff} مستوى؟ ربما حان الوقت لإعادة تقييم استراتيجيتك.`;
      } else if (levelDiff >= 5) {
        narrative = `خسارة غير متوقعة أمام ${defender.username}. ربما كنت مفرطاً في الثقة أو غير مستعد بما يكفي.`;
      } else if (levelDiff >= -5) {
        narrative = `معركة قريبة انتهت لصالح ${defender.username}. لا تقلق، المرة القادمة ستكون مختلفة.`;
      } else {
        narrative = `خسارة متوقعة أمام ${defender.username} الأقوى منك بـ ${Math.abs(levelDiff)} مستوى. لا تستسلم، استمر في التدريب!`;
      }
      
      if (damageRatio > 0.6) {
        narrative += " لقد ألحقت ضرراً جيداً، لكنه لم يكن كافياً للانتصار.";
      } else {
        narrative += " المعركة كانت صعبة من البداية، لكن هذه تجربة مفيدة.";
      }
    }
    
    return narrative;
  }

  // Calculate meaningful XP based on opponent level and difficulty
  static async calculateXP(attackerLevel, defenderLevel, isWinner, rounds, amountStolen) {
    const levelDiff = defenderLevel - attackerLevel;
    
    // Import CharacterService to use its XP calculation
    const { CharacterService } = await import('./CharacterService.js');
    
    // Calculate base XP as a percentage of the attacker's current level XP requirement
    const attackerExpNeeded = CharacterService.calculateExpNeeded(attackerLevel);
    let baseXP = Math.floor(attackerExpNeeded * 0.005); // 0.5% of current level requirement (reduced from 5%)
    
    // Level difference multiplier - more conservative scaling
    let levelMultiplier = 1;
    if (levelDiff >= 15) {
      // Attacking much stronger opponent - high risk, high reward
      levelMultiplier = 2.0; // Reduced from 8.0
    } else if (levelDiff >= 10) {
      // Attacking much stronger opponent - very high risk, very high reward
      levelMultiplier = 1.5; // Reduced from 5.0
    } else if (levelDiff >= 5) {
      // Attacking stronger opponent - high risk, high reward
      levelMultiplier = 1.3; // Reduced from 3.0
    } else if (levelDiff >= 0) {
      // Attacking equal or slightly stronger
      levelMultiplier = 1.2; // Reduced from 2.0
    } else if (levelDiff >= -5) {
      // Attacking slightly weaker
      levelMultiplier = 1.0; // Reduced from 1.5
    } else if (levelDiff >= -10) {
      // Attacking weaker opponent - reduced XP
      levelMultiplier = 0.8;
    } else if (levelDiff >= -15) {
      // Attacking much weaker opponent - minimal XP
      levelMultiplier = 0.6; // Increased from 0.4
    } else {
      // Attacking extremely weak opponent - almost no XP
      levelMultiplier = 0.4; // Increased from 0.2
    }
    
    // Winner bonus - more conservative
    const winnerBonus = isWinner ? 1.5 : 0.4; // Reduced from 2.0/0.3
    
    // Round bonus for long fights - more conservative
    const roundBonus = Math.min(rounds / 12, 0.5); // Reduced from rounds/8, 1.5
    
    // Money stolen bonus - more conservative
    const moneyBonus = Math.min(amountStolen / 10000, 0.5); // Reduced from 5000, 2.0
    
    // Calculate final XP
    let finalXP = Math.round(baseXP * levelMultiplier * winnerBonus * (1 + roundBonus + moneyBonus));
    
    // Ensure minimum XP for winners based on level (0.5% of level requirement)
    const minXPForWinner = Math.max(10, Math.floor(attackerExpNeeded * 0.005)); // Reduced from 0.02
    if (isWinner && finalXP < minXPForWinner) {
      finalXP = minXPForWinner;
    }
    
    // Ensure minimum XP for losers (0.25% of level requirement)
    const minXPForLoser = Math.max(5, Math.floor(attackerExpNeeded * 0.0025)); // Reduced from 0.005
    if (!isWinner && finalXP < minXPForLoser) {
      finalXP = minXPForLoser;
    }
    
    // Cap maximum XP to prevent abuse (1% of level requirement)
    const maxXP = Math.min(attackerExpNeeded * 0.01, 1000); // Reduced from 0.3, 5000
    finalXP = Math.min(finalXP, maxXP);
    
    return finalXP;
  }

  // Execute a fight
  static async runFight(attackerId, defenderId) {
    if (attackerId === defenderId) {
      throw new Error("لا يمكنك مهاجمة نفسك");
    }

    // Add retry logic for database connection issues
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Fight attempt in progress
        
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

        // --- DEADLOCK PREVENTION: Always lock in ascending userId order ---
        const t = await sequelize.transaction();
        let atkChar, defChar, atkUser, defUser, atkFame, defFame;
        try {
          let firstId = attackerId < defenderId ? attackerId : defenderId;
          let secondId = attackerId < defenderId ? defenderId : attackerId;
          // Lock both characters in order
          const [firstChar, secondChar] = await Promise.all([
            Character.findOne({ 
              where: { userId: firstId }, 
              transaction: t, 
              lock: t.LOCK.UPDATE 
            }),
            Character.findOne({ 
              where: { userId: secondId }, 
              transaction: t, 
              lock: t.LOCK.UPDATE 
            }),
          ]);
          // Assign atkChar/defChar based on input
          if (attackerId < defenderId) {
            atkChar = firstChar;
            defChar = secondChar;
          } else {
            atkChar = secondChar;
            defChar = firstChar;
          }
          if (!atkChar || !defChar) {
            throw new Error("الشخصية غير موجودة");
          }
          // Fetch usernames and fame
          [atkUser, defUser] = await Promise.all([
            User.findByPk(attackerId, { attributes: ["username"], transaction: t }),
            User.findByPk(defenderId, { attributes: ["username"], transaction: t }),
          ]);
          [atkFame, defFame] = await Promise.all([
            atkChar.getFame(),
            defChar.getFame()
          ]);
          const attacker = { ...atkChar.toJSON(), username: atkUser.username, fame: atkFame };
          const defender = { ...defChar.toJSON(), username: defUser.username, fame: defFame };

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

          // Calculate XP using new balanced system
          const isAttackerWinner = result.winner.userId === atkChar.userId;
          let xpGain = await this.calculateXP(atkChar.level, defChar.level, isAttackerWinner, result.rounds, amountStolen);
          
          // VIP bonus
          if (winnerChar && winnerChar.vipExpiresAt && new Date(winnerChar.vipExpiresAt) > new Date()) {
            xpGain = Math.round(xpGain * 1.5);
          }
          
          // Generate narrative for the attacker
          const narrative = this.generateFightNarrative(
            { ...atkChar.toJSON(), username: atkUser.username },
            { ...defChar.toJSON(), username: defUser.username },
            result,
            isAttackerWinner
          );
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
          // Add additional data to result for frontend
          result.amountStolen = amountStolen;
          result.narrative = narrative;
          result.xpGain = xpGain;

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
            attacker_damage: result.attackerDamage,
            defender_damage: result.defenderDamage,
            xp_gained: xpGain,
            narrative: narrative,
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

          // Fight completed successfully
          return { ...result, xpGain };
        } catch (err) {
          await t.rollback();
          throw err;
        }
      } catch (error) {
        lastError = error;
        console.error(`[FightService] Attempt ${attempt} failed:`, error.message);
        
        // If it's a business logic error (not a connection error), don't retry
        if (error.message.includes('لا يمكنك') || 
            error.message.includes('الشخصية غير موجودة') ||
            error.message.includes('لا يمكنك مهاجمة نفسك')) {
          throw error;
        }
        
        // If it's the last attempt, throw the error
        if (attempt === maxRetries) {
          console.error(`[FightService] All ${maxRetries} attempts failed. Final error:`, error.message);
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                  // Waiting before retry
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // This should never be reached, but just in case
    throw lastError || new Error("فشل في القتال بعد عدة محاولات");
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