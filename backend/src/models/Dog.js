import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export class Dog extends Model {}

Dog.init({
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
  powerBonus: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Dog',
  tableName: 'Dogs',
  timestamps: false
});

export class UserDog extends Model {}

UserDog.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  dogId: {
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
  modelName: 'UserDog',
  tableName: 'UserDogs',
  timestamps: false
});

// Associations
Dog.hasMany(UserDog, { foreignKey: 'dogId' });
UserDog.belongsTo(Dog, { foreignKey: 'dogId' }); 