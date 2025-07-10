import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const BankAccount = sequelize.define(
  'BankAccount',
  {
    userId:         { type: DataTypes.INTEGER, allowNull: false, unique: true },
    balance:        { type: DataTypes.INTEGER, defaultValue: 0 },
    lastInterestAt: { type: DataTypes.DATE,    defaultValue: DataTypes.NOW },
  },
  { timestamps: false }
);

export const BankTxn = sequelize.define(
  'BankTxn',
  {
    userId:  { type: DataTypes.INTEGER, allowNull: false },
    amount:  { type: DataTypes.INTEGER, allowNull: false }, // positive = credit
    type:    { type: DataTypes.STRING,  allowNull: false }, // "interest"
  },
  { timestamps: true }
); 