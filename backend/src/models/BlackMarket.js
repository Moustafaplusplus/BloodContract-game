import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export class BlackMarketItem extends Model {}

BlackMarketItem.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  cost: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('WEAPON', 'ARMOR', 'CONSUMABLE', 'SPECIAL'),
    allowNull: false
  },
  rarity: {
    type: DataTypes.STRING,
    defaultValue: 'RARE'
  },
  stats: {
    type: DataTypes.JSON,
    allowNull: true
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: -1 // -1 means unlimited
  }
}, {
  sequelize,
  modelName: 'BlackMarketItem',
  tableName: 'BlackMarketItems',
  timestamps: false
});

export class BlackMarketTransaction extends Model {}

BlackMarketTransaction.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  itemId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  totalCost: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  purchasedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'BlackMarketTransaction',
  tableName: 'BlackMarketTransactions'
});

// Associations
BlackMarketItem.hasMany(BlackMarketTransaction, { foreignKey: 'itemId' });
BlackMarketTransaction.belongsTo(BlackMarketItem, { foreignKey: 'itemId' }); 