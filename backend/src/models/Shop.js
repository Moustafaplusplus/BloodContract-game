import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export class Weapon extends Model {}
Weapon.init({
  name:         DataTypes.STRING,
  damage:       DataTypes.INTEGER,
  energyBonus:  DataTypes.INTEGER,  // extra max-energy
  price:        DataTypes.INTEGER,
  rarity:       DataTypes.STRING,
  imageUrl:     DataTypes.STRING,   // placeholder for item image
  currency:    { type: DataTypes.ENUM('money', 'blackcoin'), defaultValue: 'money' },
}, { sequelize, modelName: 'Weapon', timestamps: false });

export class Armor extends Model {}
Armor.init({
  name:      DataTypes.STRING,
  def:       DataTypes.INTEGER,
  hpBonus:   DataTypes.INTEGER,     // extra max-hp
  price:     DataTypes.INTEGER,
  rarity:    DataTypes.STRING,
  imageUrl:  DataTypes.STRING,      // placeholder for item image
  currency:    { type: DataTypes.ENUM('money', 'blackcoin'), defaultValue: 'money' },
}, { sequelize, modelName: 'Armor', timestamps: false });

export class VIPPackage extends Model {}
VIPPackage.init({
  name:         DataTypes.STRING,
  durationDays: DataTypes.INTEGER,
  price:        DataTypes.INTEGER,
  isActive:     { type: DataTypes.BOOLEAN, defaultValue: true },
}, { sequelize, modelName: 'VIPPackage', timestamps: false }); 