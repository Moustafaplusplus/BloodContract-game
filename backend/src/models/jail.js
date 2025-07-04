// jail.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Jail = sequelize.define(
  'Jail',
  {
    userId:   { type: DataTypes.INTEGER, unique: true },
    minutes:  DataTypes.INTEGER,
    startedAt:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { timestamps: false },
);

export default Jail;
