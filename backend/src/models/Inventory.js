import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const InventoryItem = sequelize.define('InventoryItem', {
  userId:   { type: DataTypes.INTEGER, allowNull: false },
  itemType: { type: DataTypes.STRING },   // weapon | armor
  itemId:   { type: DataTypes.INTEGER },
  equipped: { type: DataTypes.BOOLEAN, defaultValue: false },
  slot:     { type: DataTypes.STRING, allowNull: true }, // weapon1, weapon2, armor
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
}, { timestamps: false }); 