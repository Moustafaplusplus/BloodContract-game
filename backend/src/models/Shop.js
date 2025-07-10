import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export class Weapon extends Model {}
Weapon.init({
  name:         DataTypes.STRING,
  type:         DataTypes.STRING,   // melee | rifle | sniper …
  damage:       DataTypes.INTEGER,
  energyBonus:  DataTypes.INTEGER,  // extra max-energy
  price:        DataTypes.INTEGER,
  rarity:       DataTypes.STRING,
}, { sequelize, modelName: 'Weapon', timestamps: false });

export class Armor extends Model {}
Armor.init({
  name:      DataTypes.STRING,
  def:       DataTypes.INTEGER,
  hpBonus:   DataTypes.INTEGER,     // extra max-hp
  price:     DataTypes.INTEGER,
  rarity:    DataTypes.STRING,
}, { sequelize, modelName: 'Armor', timestamps: false }); 