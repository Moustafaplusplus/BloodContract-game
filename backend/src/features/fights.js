// backend/src/features/fights.js – transactional HP + socket emit
// -----------------------------------------------------------------------------
// Combines:
//   • Sequelize Fight model
//   • Fight engine (battle math)
//   • Service (runFight)
//   • Express router (fight endpoints)
// -----------------------------------------------------------------------------

import express from "express";
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Character, addStat, maybeLevelUp } from "./character.js";
import { User, auth } from "../features/user.js";
import { io } from "../socket.js";

/* ╔════════════════════════════════════════════════════════════════════╗
 * 1️⃣  Fight model
 * ╚════════════════════════════════════════════════════════════════════╝ */
export const Fight = sequelize.define("fight", {
  attacker_id: { type: DataTypes.INTEGER, allowNull: false },
  defender_id: { type: DataTypes.INTEGER, allowNull: false },
  winner_id:   { type: DataTypes.INTEGER, allowNull: false },
  damage_given:{ type: DataTypes.FLOAT,   allowNull: false },
  log:         { type: DataTypes.JSONB,   allowNull: false },
}, {
  tableName: "fights",
  timestamps: true,
  indexes: [{ fields: ["attacker_id"] }, { fields: ["defender_id"] }],
});

/* ╔════════════════════════════════════════════════════════════════════╗
 * 2️⃣  Fight engine helpers
 * ╚════════════════════════════════════════════════════════════════════╝ */
const calcWeaponMult = (weapon) => (weapon?.rarity === "legendary" ? 2.5 : 1.5);
const calcArmorRed   = (armor)  => (armor?.def ?? 0) * 0.3;

export function calculateFightResult(attacker, defender) {
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
    const hitRoll   = Math.random() * 100;

    if (hitRoll < hitChance) {
      const base = (a.strength + a.level * 2) * calcWeaponMult(a.weapon);
      const dmg  = Math.max(5, base - calcArmorRed(d.armor));
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

/* ╔════════════════════════════════════════════════════════════════════╗
 * 3️⃣  Service – runFight (transactional)
 * ╚════════════════════════════════════════════════════════════════════╝ */
export async function runFight(attackerId, defenderId) {
  if (attackerId === defenderId) throw new Error("لا يمكنك مهاجمة نفسك");

  const t = await sequelize.transaction();
  try {
    const [atkChar, defChar] = await Promise.all([
      Character.findOne({ where: { userId: attackerId }, transaction: t, lock: t.LOCK.UPDATE }),
      Character.findOne({ where: { userId: defenderId }, transaction: t, lock: t.LOCK.UPDATE }),
    ]);
    if (!atkChar || !defChar) throw new Error("الشخصية غير موجودة");

    const [atkUser, defUser] = await Promise.all([
      User.findByPk(attackerId, { attributes: ["username"], transaction: t }),
      User.findByPk(defenderId, { attributes: ["username"], transaction: t }),
    ]);

    const attacker = { ...atkChar.toJSON(), username: atkUser.username };
    const defender = { ...defChar.toJSON(), username: defUser.username };

    const result = calculateFightResult(attacker, defender);

    await Fight.create({
      attacker_id: attacker.userId,
      defender_id: defender.userId,
      winner_id:   result.winner.userId,
      damage_given: result.totalDamage,
      log: result.log,
    }, { transaction: t });

    // Winner XP – scaled by rounds (longer = harder)
    const xpGain = Math.round(result.rounds * 2);
    result.winner.exp += xpGain;
    await maybeLevelUp(result.winner);

    // Persist new HP values (can’t go below 0)
    atkChar.hp = Math.max(result.attackerFinalHp, 0);
    defChar.hp = Math.max(result.defenderFinalHp, 0);
    await Promise.all([atkChar.save({ transaction: t }), defChar.save({ transaction: t })]);

    await addStat(attackerId, "fights");

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

/* ╔════════════════════════════════════════════════════════════════════╗
 * 4️⃣  Router
 * ╚════════════════════════════════════════════════════════════════════╝ */
export const fightRouter = (() => {
  const router = express.Router();

  router.post("/:defenderId", auth, async (req, res) => {
    try {
      const attackerId = req.user.id;
      const defenderId = Number(req.params.defenderId);
      if (!defenderId || defenderId <= 0) return res.status(400).json({ error: "معرّف المدافع غير صالح" });
      const result = await runFight(attackerId, defenderId);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message || "فشل القتال" });
    }
  });

  return router;
})();
