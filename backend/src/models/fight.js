// backend/src/models/fight.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Fight = sequelize.define(
  'Fight',
  {
    attacker_id: { type: DataTypes.INTEGER, allowNull: false },
    defender_id: { type: DataTypes.INTEGER, allowNull: false },
    winner_id:   { type: DataTypes.INTEGER, allowNull: false },
    damage_given:{ type: DataTypes.FLOAT,   allowNull: false },
    log:         { type: DataTypes.JSONB,   allowNull: false }, // <-- JSONB
  },
  { tableName: 'fights', timestamps: true },
);

export default Fight;
