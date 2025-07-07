// backend/src/features/achievements.js
// -----------------------------------------------------------------------------
// Consolidated ACHIEVEMENTS feature
//   • Achievement model (key‑based)
//   • CharacterAchievement join model
//   • Leaderboard router (top 100 by metric)
//   • Hourly checker cron (startAchievementChecker)
// -----------------------------------------------------------------------------
// Exports: Achievement, CharacterAchievement, achievementRouter, leaderboardRouter, startAchievementChecker
// -----------------------------------------------------------------------------

import express from "express";
import cron    from "node-cron";
import { DataTypes, Op } from "sequelize";
import { sequelize } from "../config/db.js";
import { Character, giveReward } from "./character.js";
import { auth } from "../features/user.js";

/* Stub for socket notification (plug into actual WebSocket logic) */
function socketNotify(characterId, achievementKey) {
  console.log(`[SOCKET] Notify character ${characterId} unlocked ${achievementKey}`);
  // e.g. io.to(characterId).emit("achievementUnlocked", { key: achievementKey });
}

/* ⬆️ 1⃣️ Models */
export const Achievement = sequelize.define("Achievement", {
  key:         { type: DataTypes.STRING, primaryKey: true },
  name:        { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  xpReward:    { type: DataTypes.INTEGER, defaultValue: 0 },
}, { timestamps: false });

export const CharacterAchievement = sequelize.define("CharacterAchievement", {
  characterId:    { type: DataTypes.INTEGER, allowNull: false },
  achievementKey: { type: DataTypes.STRING,  allowNull: false },
  unlockedAt:     { type: DataTypes.DATE,    defaultValue: DataTypes.NOW },
}, { timestamps: false });

Character.belongsToMany(Achievement, {
  through: CharacterAchievement,
  foreignKey: "characterId",
});
Achievement.belongsToMany(Character, {
  through: CharacterAchievement,
  foreignKey: "achievementKey",
});

/* ⬆️ 2⃣️ Rules */
const RULES = [
  { key: "first_crime",  name: "أول جريمة",      test: c => c.stats?.crimes >= 1,  xp: 50 },
  { key: "level_10",     name: "المستوى 10",     test: c => c.level >= 10,        xp: 200 },
  { key: "wealth_100k",  name: "ثروة 100K",       test: c => c.money >= 100000,    xp: 300 },
];

/* ⬆️ 3⃣️ Cron */
export function startAchievementChecker() {
  cron.schedule("0 * * * *", async () => {
    console.log("[ACH] scanning achievements …");
    try {
      for (const r of RULES) {
        await Achievement.findOrCreate({
          where: { key: r.key },
          defaults: { name: r.name, description: r.name, xpReward: r.xp },
        });
      }

      const chars = await Character.findAll();
      for (const char of chars) {
        for (const r of RULES) {
          const has = await CharacterAchievement.findOne({
            where: { characterId: char.id, achievementKey: r.key },
          });
          if (!has && r.test(char)) {
            await CharacterAchievement.create({ characterId: char.id, achievementKey: r.key });
            await giveReward({ character: char, action: "ACH_UNLOCK", context: { xp: r.xp } });
            console.log(`🏆 Awarded ${r.key} to char ${char.id}`);
            socketNotify(char.id, r.key);
          }
        }
      }
    } catch (err) {
      console.error("[ACH] Cron error:", err);
    }
  });
}

/* ⬆️ 4⃣️ Leaderboard */
export const leaderboardRouter = (() => {
  const router = express.Router();

  router.get('/:metric', async (req, res, next) => {
    try {
      const allowed = ['money', 'level', 'strength', 'defense'];
      const metric = req.params.metric;
      if (!allowed.includes(metric)) return res.status(400).json({ message: 'invalid metric' });

      const rows = await Character.findAll({
        order: [[metric, 'DESC']],
        limit: 100,
        attributes: ['id', 'name', metric],
        include: [{ association: 'user', attributes: ['username'] }],
      });

      res.json(rows);
    } catch (err) { next(err); }
  });
  return router;
})();

/* ⬆️ 5⃣️ Achievement List */
export const achievementRouter = (() => {
  const router = express.Router();

  router.get('/', auth, async (req, res) => {
    const all = await Achievement.findAll();
    const unlocked = await CharacterAchievement.findAll({
      where: { characterId: req.user.characterId },
    });
    const set = new Set(unlocked.map(u => u.achievementKey));
    res.json(all.map(a => ({ ...a.toJSON(), unlocked: set.has(a.key) })));
  });

  return router;
})();
