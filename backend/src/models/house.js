// File: backend/src/models/house.js

import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';
import User from './user.js';

class House extends Model {}

House.init(
  {
    name: { type: DataTypes.STRING, allowNull: false },
    cost: { type: DataTypes.INTEGER, allowNull: false },
    energyRegen: { type: DataTypes.INTEGER, defaultValue: 10 },
    defenseBonus: { type: DataTypes.INTEGER, defaultValue: 0 },
    description: { type: DataTypes.STRING },
  },
  {
    sequelize,
    modelName: 'house',
  }
);

class UserHouse extends Model {}

UserHouse.init(
  {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    houseId: { type: DataTypes.INTEGER, allowNull: false },
    purchasedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'user_house',
  }
);

UserHouse.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(UserHouse, { foreignKey: 'userId' });
UserHouse.belongsTo(House, { foreignKey: 'houseId' });

export { House, UserHouse };
