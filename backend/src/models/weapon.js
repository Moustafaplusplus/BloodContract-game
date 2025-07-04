// backend/src/models/weapon.js
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class Weapon extends Model {}

Weapon.init(
  {
    name:        { type: DataTypes.STRING,  allowNull: false },
    type:        { type: DataTypes.STRING },        // gun, knife, etc.
    damage:      { type: DataTypes.INTEGER, defaultValue: 5 },
    price:       { type: DataTypes.INTEGER, defaultValue: 100 },
    rarity:      { type: DataTypes.STRING,  defaultValue: 'common' },
    description: { type: DataTypes.STRING },
  },
  {
    sequelize,
    modelName: 'weapon',
    timestamps: false,
  },
);

export { Weapon };   // named export (for rare cases)
export default Weapon; // default export for `import Weapon from ...`
