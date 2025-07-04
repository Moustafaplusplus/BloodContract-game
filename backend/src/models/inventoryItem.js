// backend/src/models/inventoryItem.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const InventoryItem = sequelize.define('InventoryItem', {
  userId:    { type: DataTypes.INTEGER, allowNull: false },
  itemType:  { type: DataTypes.STRING }, // 'weapon' or 'armor'
  itemId:    { type: DataTypes.INTEGER },
  equipped:  { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  timestamps: false,
});

export default InventoryItem;
