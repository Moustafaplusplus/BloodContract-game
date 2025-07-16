import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export class House extends Model {}

House.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cost: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  energyRegen: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  defenseBonus: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  hpBonus: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'House',
  tableName: 'Houses',
  timestamps: false
});

export class UserHouse extends Model {}

UserHouse.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  houseId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  purchasedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'UserHouse',
  tableName: 'UserHouses',
  timestamps: false
});

// Associations
House.hasMany(UserHouse, { foreignKey: 'houseId' });
UserHouse.belongsTo(House, { foreignKey: 'houseId' }); 