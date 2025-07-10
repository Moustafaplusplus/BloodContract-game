import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

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