import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { Character } from './Character.js';

export class BlackMarketListing extends Model {}

BlackMarketListing.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  sellerId: { type: DataTypes.INTEGER, allowNull: false },
  itemType: { type: DataTypes.STRING, allowNull: false },
  itemId: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  price: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('active', 'sold', 'cancelled'), allowNull: false, defaultValue: 'active' },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  soldAt: { type: DataTypes.DATE, allowNull: true },
  buyerId: { type: DataTypes.INTEGER, allowNull: true },
  // Snapshots for display
  name: { type: DataTypes.STRING },
  imageUrl: { type: DataTypes.STRING },
  rarity: { type: DataTypes.STRING },
  stats: { type: DataTypes.JSON },
}, {
  sequelize,
  modelName: 'BlackMarketListing',
  tableName: 'BlackMarketListings',
  timestamps: false,
});

BlackMarketListing.belongsTo(Character, { as: 'seller', foreignKey: 'sellerId' });
BlackMarketListing.belongsTo(Character, { as: 'buyer', foreignKey: 'buyerId' }); 