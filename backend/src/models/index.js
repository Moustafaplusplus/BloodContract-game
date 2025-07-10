// Models index file - handles associations and exports
import { User } from './User.js';
import { Character } from './Character.js';
import { Weapon, Armor } from './Shop.js';
import { Statistic } from './Statistic.js';
import { Crime, CrimeLog } from './Crime.js';
import { Jail, Hospital } from './Confinement.js';
import { Fight } from './Fight.js';
import { BankAccount, BankTxn } from './Bank.js';
import { InventoryItem } from './Inventory.js';
import { Car } from './Car.js';
import { House } from './House.js';
import { Gang } from './Gang.js';

// Define associations
User.hasOne(Character, { foreignKey: 'userId' });
Character.belongsTo(User, { foreignKey: 'userId' });
Character.belongsTo(House, { foreignKey: 'equippedHouseId', as: 'equippedHouse' });
Character.belongsTo(Gang, { foreignKey: 'gangId', as: 'gang' });

// Export all models
export {
  User,
  Character,
  Weapon,
  Armor,
  Statistic,
  Crime,
  CrimeLog,
  Jail,
  Hospital,
  Fight,
  BankAccount,
  BankTxn,
  InventoryItem,
  Car
}; 