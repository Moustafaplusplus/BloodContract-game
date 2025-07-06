// backend/src/services/rules/expRules.js
// ------------------------------------------------------------
// Declarative EXP‑reward rules.
// Each key is an ACTION string; each value is either
// • a fixed number  – or –
// • a function that receives ({ character, context }) and returns a number.
// ------------------------------------------------------------

export const ACTIONS = {
  CRIME_SUCCESS: 'CRIME_SUCCESS',
  CRIME_FAIL:    'CRIME_FAIL',     // still costs energy, but 0 EXP
  JOB_COMPLETE:  'JOB_COMPLETE',
  GYM_TRAIN:     'GYM_TRAIN',
  PVP_ATTACK:    'PVP_ATTACK',
};

/*
 * Helper: early‑level bonus — we want Lvl 1‑20 to feel fast.
 * Multiplier = 1.0 up to lvl 20, then tapers to 0.5 by lvl 40+.
 */
function lvlBonus(lvl) {
  if (lvl <= 20) return 1;
  if (lvl >= 40) return 0.5;
  // linear fade 21→39
  return 1 - (lvl - 20) * 0.025;
}

const expRules = {
  /* ---- CRIME ---- */
  [ACTIONS.CRIME_SUCCESS]: ({ character, context }) => {
    // 0.5 × energyCost, boosted for early levels
    const base = context.energyCost * 0.5;
    return Math.round(base * lvlBonus(character.level));
  },
  [ACTIONS.CRIME_FAIL]: 0,

  /* ---- JOBS ---- */
  [ACTIONS.JOB_COMPLETE]: ({ character, context }) => {
    // Designer supplies baseExp per job tier
    return Math.round((context.baseExp ?? 20) * lvlBonus(character.level));
  },

  /* ---- GYM ---- */
  [ACTIONS.GYM_TRAIN]: ({ character, context }) => {
    // 5 EXP per stat point gained (e.g., +2 power = 10 EXP)
    const gained = context.statIncreased ?? 1;
    return Math.round(5 * gained * lvlBonus(character.level));
  },

  /* ---- PvP ---- */
  [ACTIONS.PVP_ATTACK]: ({ character, context }) => {
    // Scales with level and damage dealt
    const dmg = context.damageDealt ?? 0;
    return Math.round((character.level * 2 + dmg / 10) * lvlBonus(character.level));
  },
};

export default expRules;