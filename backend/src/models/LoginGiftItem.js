import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export class LoginGiftItem extends Model {}

LoginGiftItem.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  loginGiftId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'login_gifts',
      key: 'id'
    }
  },
  itemType: {
    type: DataTypes.ENUM('weapon', 'armor', 'special_item'),
    allowNull: false
  },
  itemId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'LoginGiftItem',
  tableName: 'login_gift_items',
  timestamps: true
}); 