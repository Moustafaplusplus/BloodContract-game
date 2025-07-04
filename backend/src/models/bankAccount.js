// backend/src/models/bankAccount.js
import { DataTypes } from 'sequelize';
import { sequelize }  from '../config/db.js';

const BankAccount = sequelize.define(
  'BankAccount',
  {
    userId:   { type: DataTypes.INTEGER, allowNull: false, unique: true },
    balance:  { type: DataTypes.INTEGER, defaultValue: 0 },
    lastInterestAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { timestamps: false },
);

export default BankAccount;
