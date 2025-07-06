// backend/src/services/rewardService.js
// ------------------------------------------------------------
// Central EXP‑reward service: every action (crime, job, gym, PvP …)
// calls giveReward() so EXP logic lives in ONE place.
// ------------------------------------------------------------
import expRules, { ACTIONS } from './rules/expRules.js';
import Character from '../models/character.js';
import { io } from '../socket.js'; // adjust path to your socket‑io instance
import { sequelize } from '../config/db.js';

/**
 * @typedef RewardPayload
 * @prop {import('../models/character.js').default} character – Sequelize instance (already fetched)
 * @prop {string} action – one of ACTIONS.*
 * @prop {object} context – free‑form extra data (energyCost, baseExp, damageDealt …)
 */

/**
 * Grants EXP (and potentially other rewards later) in a transaction‑safe way.
 * ALWAYS use inside the caller's transaction so EXP, money etc. commit together.
 */
export async function giveReward({ character, action, context = {} }, tx) {
  const rule = expRules[action];
  if (!rule) return; // unknown action → no EXP

  // 1️⃣  Calculate amount (number or function)
  const exp = typeof rule === 'function' ? rule({ character, context }) : rule;
  if (!exp || exp <= 0) return;

  // 2️⃣  Persist using Character.addExp (handles level‑ups & locking)
  await character.addExp(exp, { transaction: tx });

  // 3️⃣  Socket push once tx commits (caller sets afterCommit)
  if (tx && typeof tx.afterCommit === 'function') {
    tx.afterCommit(() => io.to(character.userId).emit('hud:update', character.toSafeJSON()));
  } else {
    // fallback (non‑tx call, should be rare)
    io.to(character.userId).emit('hud:update', character.toSafeJSON());
  }
}

export { ACTIONS };