import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export class Car extends Model {}

Car.init({
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
  defenseBonus: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  attackBonus: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  rarity: {
    type: DataTypes.STRING,
    defaultValue: 'COMMON'
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  currency: {
    type: DataTypes.ENUM('money', 'blackcoin'),
    defaultValue: 'money'
  }
}, {
  sequelize,
  modelName: 'Car',
  tableName: 'Cars',
  timestamps: false
});

export class UserCar extends Model {}

UserCar.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  carId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  purchasedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'UserCar',
  tableName: 'UserCars',
  timestamps: false
});

// Associations
Car.hasMany(UserCar, { foreignKey: 'carId' });
UserCar.belongsTo(Car, { foreignKey: 'carId' }); 