import Character from '../models/character.js';
import User       from '../models/user.js';
import Fight      from '../models/fight.js';
import { calculateFightResult } from '../utils/fightEngine.js';

/**
 * Runs the fight and returns the result object.
 * Throws errors that the route layer will catch.
 */
export async function runFight(attackerId, defenderId) {
  if (attackerId === defenderId) {
    throw new Error('لا يمكنك مهاجمة نفسك');
  }

  /* ---------- load characters ---------- */
  const [atkChar, defChar] = await Promise.all([
    Character.findOne({ where: { userId: attackerId } }),
    Character.findOne({ where: { userId: defenderId } }),
  ]);
  if (!atkChar || !defChar) throw new Error('الشخصية غير موجودة');

  /* ---------- load usernames ---------- */
  const [atkUser, defUser] = await Promise.all([
    User.findByPk(attackerId, { attributes: ['username'] }),
    User.findByPk(defenderId, { attributes: ['username'] }),
  ]);

  const attacker = { ...atkChar.toJSON(), username: atkUser.username };
  const defender = { ...defChar.toJSON(), username: defUser.username };

  /* ---------- run fight ---------- */
  const result = calculateFightResult(attacker, defender);

  /* ---------- persist log ---------- */
  await Fight.create({
    attacker_id: attacker.userId,
    defender_id: defender.userId,
    winner_id:   result.winnerId,
    damage_given: result.totalDamage,
    log:         result.log,     // JSONB
  });

  return result;
}
