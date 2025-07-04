//src/models/armor.js

import { DataTypes } from 'sequelize';
import { sequelize }  from '../config/db.js';

const Armor = sequelize.define(
  'Armor',
  {
    name:   { type: DataTypes.STRING, allowNull: false },
    def:    { type: DataTypes.INTEGER, defaultValue: 5 },
    rarity: { type: DataTypes.STRING,  defaultValue: 'common' }, // common/rare/legendary
    price:  { type: DataTypes.INTEGER, defaultValue: 100 },
  },
  { timestamps: false }
);

export default Armor;
