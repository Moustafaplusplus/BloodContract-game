import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export class GoldTransaction extends Model {}

GoldTransaction.init({
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
  modelName: 'GoldTransaction',
  tableName: 'GoldTransactions'
});

export class GoldPackage extends Model {}

GoldPackage.init({
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
  goldAmount: {
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
  modelName: 'GoldPackage',
  tableName: 'GoldPackages',
  timestamps: false
});

export class VIPMembership extends Model {}

VIPMembership.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tier: {
    type: DataTypes.ENUM('SILVER', 'GOLD', 'PLATINUM'),
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'VIPMembership',
  tableName: 'VIPMemberships'
});

// Associations
GoldTransaction.belongsTo(sequelize.models.User, { foreignKey: 'userId' });
VIPMembership.belongsTo(sequelize.models.User, { foreignKey: 'userId' }); 