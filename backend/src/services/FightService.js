import { Fight } from '../models/Fight.js';
import { Character, User } from '../models/index.js';
import { CharacterService } from './CharacterService.js';
import { sequelize } from '../config/db.js';
import { Op } from 'sequelize';
import { io, emitNotification } from '../socket.js';
import { Hospital, Jail } from '../models/Confinement.js';
import { TaskService } from './TaskService.js';
import { NotificationService } from './NotificationService.js';

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
    
    // Calculate base XP - balanced across all levels
    const attackerExpNeeded = CharacterService.calculateExpNeeded(attackerLevel);
    
    // Dynamic base XP calculation that scales appropriately
    let baseXP;
    if (attackerLevel <= 10) {
      // Early levels: 8-15 XP base (good progression)
      baseXP = Math.max(8, Math.min(15, Math.floor(attackerExpNeeded * 0.06)));
    } else if (attackerLevel <= 30) {
      // Mid levels: 15-50 XP base
      baseXP = Math.max(15, Math.min(50, Math.floor(attackerExpNeeded * 0.04)));
    } else if (attackerLevel <= 50) {
      // High levels: 50-200 XP base
      baseXP = Math.max(50, Math.min(200, Math.floor(attackerExpNeeded * 0.025)));
    } else {
      // Very high levels: 200-500 XP base (linear scaling)
      baseXP = Math.max(200, Math.min(500, Math.floor(attackerExpNeeded * 0.015)));
    }
    
    // Level difference multiplier - balanced scaling
    let levelMultiplier = 1;
    if (levelDiff >= 15) {
      // Attacking much stronger opponent - high risk, high reward
      levelMultiplier = 4.0; // Balanced high reward for extreme risk
    } else if (levelDiff >= 10) {
      // Attacking much stronger opponent - very high risk, very high reward
      levelMultiplier = 3.0; // Good reward for high risk
    } else if (levelDiff >= 5) {
      // Attacking stronger opponent - high risk, high reward
      levelMultiplier = 2.2; // Moderate-high reward
    } else if (levelDiff >= 0) {
      // Attacking equal or slightly stronger
      levelMultiplier = 1.5; // Balanced reward
    } else if (levelDiff >= -5) {
      // Attacking slightly weaker
      levelMultiplier = 1.2; // Slightly reduced reward
    } else if (levelDiff >= -10) {
      // Attacking weaker opponent - reduced XP
      levelMultiplier = 0.9; // Reduced but still meaningful
    } else if (levelDiff >= -15) {
      // Attacking much weaker opponent - minimal XP
      levelMultiplier = 0.6; // Minimal but not zero
    } else {
      // Attacking extremely weak opponent - almost no XP
      levelMultiplier = 0.3; // Very minimal
    }
    
    // Winner bonus - balanced
    const winnerBonus = isWinner ? 1.8 : 0.5; // Good winner bonus, reasonable loser bonus
    
    // Round bonus for long fights - balanced
    const roundBonus = Math.min(rounds / 10, 0.8); // Rewards longer fights but not excessively
    
    // Money stolen bonus - balanced
    const moneyBonus = Math.min(amountStolen / 8000, 1.0); // Good reward for stealing but not excessive
    
    // Calculate final XP
    let finalXP = Math.round(baseXP * levelMultiplier * winnerBonus * (1 + roundBonus + moneyBonus));
    
    // Ensure minimum XP for winners - level-appropriate
    let minXPForWinner;
    if (attackerLevel <= 10) {
      minXPForWinner = Math.max(5, Math.floor(baseXP * 0.6));
    } else if (attackerLevel <= 30) {
      minXPForWinner = Math.max(10, Math.floor(baseXP * 0.7));
    } else if (attackerLevel <= 50) {
      minXPForWinner = Math.max(25, Math.floor(baseXP * 0.8));
    } else {
      minXPForWinner = Math.max(100, Math.floor(baseXP * 0.9));
    }
    if (isWinner && finalXP < minXPForWinner) {
      finalXP = minXPForWinner;
    }
    
    // Ensure minimum XP for losers - level-appropriate
    let minXPForLoser;
    if (attackerLevel <= 10) {
      minXPForLoser = Math.max(3, Math.floor(baseXP * 0.3));
    } else if (attackerLevel <= 30) {
      minXPForLoser = Math.max(5, Math.floor(baseXP * 0.4));
    } else if (attackerLevel <= 50) {
      minXPForLoser = Math.max(15, Math.floor(baseXP * 0.5));
    } else {
      minXPForLoser = Math.max(50, Math.floor(baseXP * 0.6));
    }
    if (!isWinner && finalXP < minXPForLoser) {
      finalXP = minXPForLoser;
    }
    
    // Cap maximum XP to prevent abuse - level-appropriate
    let maxXP;
    if (attackerLevel <= 10) {
      maxXP = Math.min(attackerExpNeeded * 0.15, 100);
    } else if (attackerLevel <= 30) {
      maxXP = Math.min(attackerExpNeeded * 0.12, 500);
    } else if (attackerLevel <= 50) {
      maxXP = Math.min(attackerExpNeeded * 0.08, 1000);
    } else {
      maxXP = Math.min(attackerExpNeeded * 0.05, 2000);
    }
    finalXP = Math.min(finalXP, maxXP);
    
    return finalXP;
  }

  // Execute a fight
  static async runFight(attackerId, defenderId) {
    if (attackerId === defenderId) {
      throw new Error("لا يمكنك مهاجمة نفسك");
    }

    // Add a simple in-memory lock to prevent the same character from being in multiple fights
    const lockKey = `fight:${Math.min(attackerId, defenderId)}:${Math.max(attackerId, defenderId)}`;
    if (this.fightLocks && this.fightLocks.has(lockKey)) {
      throw new Error("هناك قتال قيد التنفيذ بالفعل");
    }
    
    // Initialize fight locks if not exists
    if (!this.fightLocks) {
      this.fightLocks = new Set();
    }
    
    // Add lock
    this.fightLocks.add(lockKey);
    
    try {
      // Add retry logic for database connection issues
      const maxRetries = 3;
      let lastError;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        let t = null;
        try {
          console.log(`[FightService] Attempt ${attempt} for fight: ${attackerId} vs ${defenderId}`);
          
          // Create a fresh transaction for each attempt
          t = await sequelize.transaction();
          
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
          let atkChar, defChar, atkUser, defUser, atkFame, defFame;
          
          console.log('[FightService] Starting transaction for fight:', attackerId, 'vs', defenderId);
          
          let firstId = attackerId < defenderId ? attackerId : defenderId;
          let secondId = attackerId < defenderId ? defenderId : attackerId;
          
          console.log('[FightService] Locking characters in order:', firstId, secondId);
          
          // Lock both characters in order to prevent deadlocks
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
          
          console.log('[FightService] Characters locked successfully');
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
          
          // Ensure xpGain is an integer
          xpGain = Math.floor(xpGain);
          
          // VIP bonus
          if (winnerChar && winnerChar.vipExpiresAt && new Date(winnerChar.vipExpiresAt) > new Date()) {
            xpGain = Math.floor(xpGain * 1.5);
          }
          
          // Generate narrative for the attacker
          const narrative = this.generateFightNarrative(
            { ...atkChar.toJSON(), username: atkUser.username },
            { ...defChar.toJSON(), username: defUser.username },
            result,
            isAttackerWinner
          );
          if (result.winner.userId === atkChar.userId) {
            atkChar.exp = Math.floor(atkChar.exp + xpGain);
            atkChar.killCount = Math.floor((atkChar.killCount || 0) + 1);
            // Handle level up separately to avoid transaction issues
            try {
              await CharacterService.maybeLevelUp(atkChar);
            } catch (levelUpError) {
              console.error('[FightService] Level up error:', levelUpError);
              // Continue with the fight even if level up fails
            }
            await TaskService.updateProgress(atkChar.userId, 'kill_count', 1, t);
          } else {
            defChar.exp = Math.floor(defChar.exp + xpGain);
            defChar.killCount = Math.floor((defChar.killCount || 0) + 1);
            // Handle level up separately to avoid transaction issues
            try {
              await CharacterService.maybeLevelUp(defChar);
            } catch (levelUpError) {
              console.error('[FightService] Level up error:', levelUpError);
              // Continue with the fight even if level up fails
            }
            await TaskService.updateProgress(defChar.userId, 'kill_count', 1, t);
          }
          
          // Ensure all numeric values are integers before saving
          winnerChar.money = Math.floor(winnerChar.money);
          loserChar.money = Math.floor(loserChar.money);
          winnerChar.exp = Math.floor(winnerChar.exp);
          loserChar.exp = Math.floor(loserChar.exp);
          winnerChar.killCount = Math.floor(winnerChar.killCount || 0);
          loserChar.killCount = Math.floor(loserChar.killCount || 0);
          
          await winnerChar.save({ transaction: t });
          await loserChar.save({ transaction: t });
          // Add additional data to result for frontend
          result.amountStolen = amountStolen;
          result.narrative = narrative;
          result.xpGain = xpGain;

          // Persist new HP values (can't go below 0)
          atkChar.hp = Math.floor(Math.max(result.attackerFinalHp, 0));
          defChar.hp = Math.floor(Math.max(result.defenderFinalHp, 0));
          
          // Ensure HP values are integers
          atkChar.hp = Math.floor(atkChar.hp);
          defChar.hp = Math.floor(defChar.hp);
          
          await Promise.all([
            atkChar.save({ transaction: t }), 
            defChar.save({ transaction: t })
          ]);

          // Save fight result to the database
          await Fight.create({
            attacker_id: attackerId,
            defender_id: defenderId,
            winner_id: result.winner.userId,
            total_damage: Math.floor(result.totalDamage),
            attacker_damage: Math.floor(result.attackerDamage),
            defender_damage: Math.floor(result.defenderDamage),
            xp_gained: Math.floor(xpGain),
            narrative: narrative,
            log: result.log,
          }, { transaction: t });

          console.log('[FightService] Starting task updates...');
          
          // --- TASKS: Update progress for fights, damage, etc. ---
          try {
            await TaskService.updateProgress(attackerId, 'total_fights', 1, t);
            await TaskService.updateProgress(defenderId, 'total_fights', 1, t);
            await TaskService.updateProgress(attackerId, 'damage_dealt', Math.round(result.attackerDamage), t);
            await TaskService.updateProgress(defenderId, 'damage_dealt', Math.round(result.defenderDamage), t);
            if (result.winner.userId === attackerId) {
              await TaskService.updateProgress(attackerId, 'fights_won', 1, t);
              await TaskService.updateProgress(defenderId, 'fights_lost', 1, t);
            } else {
              await TaskService.updateProgress(defenderId, 'fights_won', 1, t);
              await TaskService.updateProgress(attackerId, 'fights_lost', 1, t);
            }
            // Fame snapshot update
            const fameAtk = await atkChar.getFame();
            const fameDef = await defChar.getFame();
            await TaskService.updateProgress(atkChar.userId, 'fame', fameAtk, t);
            await TaskService.updateProgress(defChar.userId, 'fame', fameDef, t);
          } catch (taskError) {
            console.error('[FightService] Task update error:', taskError);
            // Continue with the fight even if task updates fail
          }
          
          console.log('[FightService] Task updates completed');
          // --- END TASKS ---

          // Hospital logic: send to hospital if HP is 0
          const hospitalTime = new Date();
          try {
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
                startedAt: hospitalTime,
                releasedAt: new Date(hospitalTime.getTime() + hospitalStay * 60_000),
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
                startedAt: hospitalTime,
                releasedAt: new Date(hospitalTime.getTime() + hospitalStay * 60_000),
              }, { transaction: t });
              if (io) {
                io.to(`user:${defChar.userId}`).emit('hospital:enter', {
                  releaseAt: hospitalRecord.releasedAt,
                  reason: 'fight',
                });
              }
            }
          } catch (hospitalError) {
            console.error('[FightService] Hospital creation error:', hospitalError);
            // Continue with the fight even if hospital creation fails
          }

          try {
            await CharacterService.addStat(attackerId, "fights", 1, t);

            // --- NEW: Update wins and losses for both players ---
            const winnerId = result.winner.userId;
            const loserId = (winnerId === attackerId) ? defenderId : attackerId;
            await CharacterService.addFightResult(winnerId, loserId, t);
            // --- END NEW ---
          } catch (statError) {
            console.error('[FightService] Statistics update error:', statError);
            // Continue with the fight even if statistics updates fail
          }

          console.log('[FightService] About to save fight record...');
          console.log('[FightService] Fight data:', {
            attacker_id: attackerId,
            defender_id: defenderId,
            winner_id: result.winner.userId,
            total_damage: Math.floor(result.totalDamage),
            attacker_damage: Math.floor(result.attackerDamage),
            defender_damage: Math.floor(result.defenderDamage),
            xp_gained: Math.floor(xpGain),
            narrative: narrative,
            log: result.log
          });
          
          console.log('[FightService] Committing transaction...');
          await t.commit();
          console.log('[FightService] Transaction committed successfully');

          // Live update via Socket.IO
          if (io) {
            io.to(`user:${attackerId}`).emit("fightResult", result);
            io.to(`user:${defenderId}`).emit("fightResult", result);
          }

          // Create notifications for both players
          try {
            const winnerId = result.winner.userId;
            const loserId = (winnerId === attackerId) ? defenderId : attackerId;
            
            // Notification for the winner
            const winnerNotification = await NotificationService.createNotification(
              winnerId,
              'ATTACKED',
              'فزت في المعركة',
              `فزت في المعركة ضد ${result.winner.userId === attackerId ? defUser.username : atkUser.username} وحصلت على ${Math.floor(xpGain)} خبرة`,
              { 
                opponentName: result.winner.userId === attackerId ? defUser.username : atkUser.username,
                xpGained: Math.floor(xpGain),
                damageDealt: Math.floor(result.winner.userId === attackerId ? result.attackerDamage : result.defenderDamage)
              }
            );
            emitNotification(winnerId, winnerNotification);

            // Notification for the loser
            const loserNotification = await NotificationService.createNotification(
              loserId,
              'ATTACKED',
              'خسرت في المعركة',
              `خسرت في المعركة ضد ${result.winner.userId === attackerId ? atkUser.username : defUser.username} وتلقيت ${Math.floor(result.winner.userId === attackerId ? result.defenderDamage : result.attackerDamage)} ضرر`,
              { 
                opponentName: result.winner.userId === attackerId ? atkUser.username : defUser.username,
                damageReceived: Math.floor(result.winner.userId === attackerId ? result.defenderDamage : result.attackerDamage)
              }
            );
            emitNotification(loserId, loserNotification);

            // Hospital notifications if players were hospitalized
            if (atkChar.hp === 0) {
              const hospitalNotification = await NotificationService.createHospitalizedNotification(
                atkChar.userId,
                'تم إدخالك المستشفى بعد المعركة'
              );
              emitNotification(atkChar.userId, hospitalNotification);
            }
            
            if (defChar.hp === 0) {
              const hospitalNotification = await NotificationService.createHospitalizedNotification(
                defChar.userId,
                'تم إدخالك المستشفى بعد المعركة'
              );
              emitNotification(defChar.userId, hospitalNotification);
            }
          } catch (notificationError) {
            console.error('[FightService] Notification error:', notificationError);
            // Continue even if notifications fail
          }

          // Fight completed successfully
          return { ...result, xpGain };
        } catch (err) {
          console.error(`[FightService] Attempt ${attempt} transaction error:`, err);
          console.error('[FightService] Error details:', {
            message: err.message,
            code: err.code,
            constraint: err.constraint,
            table: err.table,
            detail: err.detail,
            stack: err.stack
          });
          
          // Always rollback the transaction if it exists
          if (t) {
            try {
              await t.rollback();
              console.log(`[FightService] Transaction rolled back for attempt ${attempt}`);
            } catch (rollbackError) {
              console.error(`[FightService] Rollback error for attempt ${attempt}:`, rollbackError);
            }
          }
          
          lastError = err;
          
          // Handle specific database errors
          if (err.code === '23505') { // Unique constraint violation
            console.error('[FightService] Unique constraint violation detected');
            throw new Error('Database constraint violation - please try again');
          } else if (err.code === '40P01') { // Deadlock detected
            console.error('[FightService] Deadlock detected');
            throw new Error('Deadlock detected - please try again');
          } else if (err.message.includes('current transaction is aborted')) {
            console.error('[FightService] Transaction aborted - will retry with fresh connection');
            // Don't throw here, let it retry
          } else if (err.message.includes('لا يمكنك') || 
                     err.message.includes('الشخصية غير موجودة') ||
                     err.message.includes('لا يمكنك مهاجمة نفسك')) {
            // Business logic errors - don't retry
            throw err;
          }
          
          // If it's the last attempt, throw the error
          if (attempt === maxRetries) {
            console.error(`[FightService] All ${maxRetries} attempts failed. Final error:`, err.message);
            throw new Error('Transaction failed - please try again');
          }
          
          // Wait before retrying (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`[FightService] Waiting ${delay}ms before retry attempt ${attempt + 1}`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      // This should never be reached, but just in case
      throw lastError || new Error("فشل في القتال بعد عدة محاولات");
    } finally {
      // Remove lock
      if (this.fightLocks) {
        this.fightLocks.delete(lockKey);
      }
    }
  }

  static async runContractFight(attackerId, defenderId) {
    if (attackerId === defenderId) {
      throw new Error("لا يمكنك مهاجمة نفسك");
    }
    // Add retry logic for database connection issues
    const maxRetries = 3;
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
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
          // --- Winner steals 30-40% of loser's money ---
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
            await TaskService.updateProgress(atkChar.userId, 'kill_count', 1, t);
          } else {
            defChar.exp += xpGain;
            await CharacterService.maybeLevelUp(defChar);
            defChar.killCount = (defChar.killCount || 0) + 1;
            await TaskService.updateProgress(defChar.userId, 'kill_count', 1, t);
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
          // Hospital logic: send to hospital if HP is 0
          const now2 = new Date();
          if (atkChar.hp === 0) {
            const levelMultiplier = Math.max(0.5, Math.min(2.0, atkChar.level / 10));
            const hospitalStay = Math.round(3 * levelMultiplier);
            const hpLoss = Math.round(20 * levelMultiplier);
            const healRate = Math.round(3 * levelMultiplier);
            const hospitalRecord = await Hospital.create({
              userId: atkChar.userId,
              minutes: hospitalStay,
              hpLoss: hpLoss,
              healRate: healRate,
              startedAt: now2,
              releasedAt: new Date(now2.getTime() + hospitalStay * 60_000),
            }, { transaction: t });
            if (io) {
              io.to(`user:${atkChar.userId}`).emit('hospital:enter', {
                releaseAt: hospitalRecord.releasedAt,
                reason: 'fight',
              });
            }
          }
          if (defChar.hp === 0) {
            const levelMultiplier = Math.max(0.5, Math.min(2.0, defChar.level / 10));
            const hospitalStay = Math.round(3 * levelMultiplier);
            const hpLoss = Math.round(20 * levelMultiplier);
            const healRate = Math.round(3 * levelMultiplier);
            const hospitalRecord = await Hospital.create({
              userId: defChar.userId,
              minutes: hospitalStay,
              hpLoss: hpLoss,
              healRate: healRate,
              startedAt: now2,
              releasedAt: new Date(now2.getTime() + hospitalStay * 60_000),
            }, { transaction: t });
            if (io) {
              io.to(`user:${defChar.userId}`).emit('hospital:enter', {
                releaseAt: hospitalRecord.releasedAt,
                reason: 'fight',
              });
            }
          }

          // --- TASKS: Update progress for contract fights ---
          await TaskService.updateProgress(attackerId, 'total_fights', 1, t);
          await TaskService.updateProgress(defenderId, 'total_fights', 1, t);
          await TaskService.updateProgress(attackerId, 'damage_dealt', Math.round(result.attackerDamage), t);
          await TaskService.updateProgress(defenderId, 'damage_dealt', Math.round(result.defenderDamage), t);
          if (result.winner.userId === attackerId) {
            await TaskService.updateProgress(attackerId, 'fights_won', 1, t);
            await TaskService.updateProgress(defenderId, 'fights_lost', 1, t);
          } else {
            await TaskService.updateProgress(defenderId, 'fights_won', 1, t);
            await TaskService.updateProgress(attackerId, 'fights_lost', 1, t);
          }

          // Save fight result to the database
          await Fight.create({
            attacker_id: attackerId,
            defender_id: defenderId,
            winner_id: result.winner.userId,
            total_damage: Math.floor(result.totalDamage),
            attacker_damage: Math.floor(result.attackerDamage),
            defender_damage: Math.floor(result.defenderDamage),
            xp_gained: Math.floor(xpGain),
            narrative: narrative,
            log: result.log,
          }, { transaction: t });

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
}