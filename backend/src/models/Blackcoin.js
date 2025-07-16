import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export class BlackcoinTransaction extends Model {}

BlackcoinTransaction.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('PURCHASE', 'SPEND', 'REFUND'),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'BlackcoinTransaction',
  tableName: 'BlackcoinTransactions'
});

export class BlackcoinPackage extends Model {}

BlackcoinPackage.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  usdPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  blackcoinAmount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bonus: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'BlackcoinPackage',
  tableName: 'BlackcoinPackages',
  timestamps: false
}); 