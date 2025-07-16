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
import { Job, JobHistory } from './Job.js';
import { BlackMarketListing } from './BlackMarketListing.js';
import { BlackcoinTransaction, BlackcoinPackage } from './Blackcoin.js';
import { Dog, UserDog } from './Dog.js';
import { Message } from './Message.js';
import { Friendship } from './Friendship.js';
import { Notification } from './Social.js';

Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });

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
  Car,
  Job,
  JobHistory,
  BlackMarketListing,
  BlackcoinTransaction,
  BlackcoinPackage,
  Dog,
  UserDog,
  Friendship,
  Message,
  Notification
}; 