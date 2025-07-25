import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Fight = sequelize.define("fight", {
  attacker_id: { type: DataTypes.INTEGER, allowNull: false }, // references userId
  defender_id: { type: DataTypes.INTEGER, allowNull: false }, // references userId
  winner_id:   { type: DataTypes.INTEGER, allowNull: false }, // references userId
  total_damage:{ type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  attacker_damage: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  defender_damage: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  xp_gained: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  narrative: { type: DataTypes.TEXT, allowNull: true },
  log:         { type: DataTypes.JSONB,   allowNull: false },
}, {
  tableName: "fights",
  timestamps: true,
  indexes: [{ fields: ["attacker_id"] }, { fields: ["defender_id"] }],
}); 