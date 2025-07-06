// backend/src/models/character.js
// ------------------------------------------------------------
// Character model + progressive XP/level system
// ------------------------------------------------------------
import { Model, DataTypes } from 'sequelize';

export default class Character extends Model {
  /* ---------------------------------------------------------
   *   XP / Level‑up helpers (centralised, tweak one spot)
   * -------------------------------------------------------*/
  /**
   * EXP curve — quadratic‑ish:  L1 →100, L2 →250, L3 →450 …
   * Customize here; all routes use this single source of truth.
   */
  static expNeeded(level) {
    // avoid 0 * 0 giving 0 for L0 guard
    return Math.round(50 * level ** 2 + 50 * level);
  }

  /**
   * Adds EXP, handles multi‑level‑ups in a single transaction‑safe call.
   * Accepts an optional external transaction for race‑safe usage.
   */
  async addExp(amount, { transaction: extTx } = {}) {
    const sequelize = this.sequelize; // shorthand
    const useTx = extTx || (await sequelize.transaction());

    try {
      // 🔒 row‑level lock to avoid double‑spend EXP in concurrent rewards
      const fresh = await Character.findByPk(this.id, {
        transaction: useTx,
        lock: useTx.LOCK.UPDATE,
      });

      fresh.exp += amount;

      // loop handles multiple level jumps (e.g., huge quest reward)
      while (fresh.exp >= Character.expNeeded(fresh.level)) {
        fresh.exp -= Character.expNeeded(fresh.level);
        fresh.level += 1;
      }

      await fresh.save({ transaction: useTx });

      // reflect in current instance so caller sees latest numbers
      Object.assign(this, fresh.get());

      if (!extTx) await useTx.commit();
    } catch (err) {
      if (!extTx) await useTx.rollback();
      throw err;
    }
  }

  /* ---------------------------------------------------------
   *   Sequelize init
   * -------------------------------------------------------*/
  static init(sequelize) {
    return super.init(
      {
        userId: { type: DataTypes.INTEGER, allowNull: false },

        // Core stats
        money:   { type: DataTypes.BIGINT,  defaultValue: 0,  validate: { min: 0 } },
        power:   { type: DataTypes.INTEGER, defaultValue: 10, validate: { min: 0 } },
        defense: { type: DataTypes.INTEGER, defaultValue: 5,  validate: { min: 0 } },
        energy:  { type: DataTypes.INTEGER, defaultValue: 100,validate: { min: 0 } },
        hp:      { type: DataTypes.INTEGER, defaultValue: 100,validate: { min: 0 } },

        // Progression
        level: { type: DataTypes.INTEGER, defaultValue: 1,  validate: { min: 1 } },
        exp:   { type: DataTypes.BIGINT,  defaultValue: 0,  validate: { min: 0 } },

        // Cooldowns (ms epoch)
        crimeCooldown: { type: DataTypes.BIGINT, defaultValue: 0 },
      },
      {
        sequelize,
        modelName: 'Character',
        tableName: 'Characters',
        timestamps: true, // createdAt, updatedAt
      }
    );
  }

  /* ---------------------------------------------------------
   *   Associations
   * -------------------------------------------------------*/
  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'userId' });
  }

  /* ---------------------------------------------------------
   *   Convenience: safe JSON for API responses
   * -------------------------------------------------------*/
  toSafeJSON() {
    const { money, power, defense, energy, level, exp, hp } = this;
    return {
      money,
      power,
      defense,
      energy,
      level,
      exp,
      hp,
      expToNext: Character.expNeeded(level) - exp,
    };
  }
}
