import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Fight = sequelize.define(
  'Fight',
  {
    attacker_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    defender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    winner_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    damage_given: { type: DataTypes.FLOAT, allowNull: false },
    log:          { type: DataTypes.JSONB, allowNull: false },
  },
  {
    tableName: 'fights',
    timestamps: true,
    indexes: [
      { fields: ['attacker_id'] },
      { fields: ['defender_id'] },
    ],
  }
);

export default Fight;
