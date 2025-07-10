import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const InventoryItem = sequelize.define('InventoryItem', {
  userId:   { type: DataTypes.INTEGER, allowNull: false },
  itemType: { type: DataTypes.STRING },   // weapon | armor | car
  itemId:   { type: DataTypes.INTEGER },
  equipped: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: false }); 