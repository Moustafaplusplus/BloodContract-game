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
import { Gang, GangMember, GangJoinRequest } from './Gang.js';
import { Job, JobHistory } from './Job.js';
import { JobDefinition } from './JobDefinition.js';
import { BlackMarketListing } from './BlackMarketListing.js';
import { BlackcoinTransaction, BlackcoinPackage } from './Blackcoin.js';
import { MoneyPackage } from './MoneyPackage.js';
import { Dog, UserDog } from './Dog.js';
import { Message } from './Message.js';
import { Friendship } from './Friendship.js';
import { IpTracking } from './IpTracking.js';
import { MinistryMission, UserMinistryMission } from './MinistryMission.js';
import { Suggestion } from './Suggestion.js';
import { GlobalMessage } from './GlobalMessage.js';
import BloodContractFactory from './BloodContract.js';
import { sequelize } from '../config/db.js';
import { ProfileRating } from './ProfileRating.js';
import { Task, UserTaskProgress } from './Task.js';
import { Notification } from './Notification.js';
import { SpecialItem } from './SpecialItem.js';
import { GameNews } from './GameNews.js';
import { LoginGift } from './LoginGift.js';
import { LoginGiftItem } from './LoginGiftItem.js';
import { UserLoginGift } from './UserLoginGift.js';

Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });

// Initialize BloodContract model
const BloodContract = BloodContractFactory(sequelize);

// Define associations
User.hasOne(Character, { foreignKey: 'userId' });
Character.belongsTo(User, { foreignKey: 'userId' });
Character.belongsTo(House, { foreignKey: 'equippedHouseId', as: 'equippedHouse' });
Character.belongsTo(Gang, { foreignKey: 'gangId', as: 'gang' });
Character.hasOne(Statistic, { foreignKey: 'userId' });
Statistic.belongsTo(Character, { foreignKey: 'userId' });

// Suggestion associations
User.hasMany(Suggestion, { foreignKey: 'userId' });
Suggestion.belongsTo(User, { foreignKey: 'userId' });

// BloodContract associations
User.hasMany(BloodContract, { foreignKey: 'posterId', as: 'postedContracts' });
User.hasMany(BloodContract, { foreignKey: 'targetId', as: 'targetedContracts' });
User.hasMany(BloodContract, { foreignKey: 'assassinId', as: 'fulfilledContracts' });

// After all models are initialized, set up associations
if (BloodContract.associate) {
  BloodContract.associate({ User });
}

// Set up Notification associations
Notification.belongsTo(User, { foreignKey: 'userId' });

// Set up Inventory associations
InventoryItem.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(InventoryItem, { foreignKey: 'userId' });

// Inventory item associations based on itemType
InventoryItem.belongsTo(Weapon, { foreignKey: 'itemId', as: 'weapon', constraints: false });
InventoryItem.belongsTo(Armor, { foreignKey: 'itemId', as: 'armor', constraints: false });
InventoryItem.belongsTo(SpecialItem, { foreignKey: 'itemId', as: 'specialItem', constraints: false });
InventoryItem.belongsTo(House, { foreignKey: 'itemId', as: 'house', constraints: false });
InventoryItem.belongsTo(Car, { foreignKey: 'itemId', as: 'car', constraints: false });
InventoryItem.belongsTo(Dog, { foreignKey: 'itemId', as: 'dog', constraints: false });

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
  House,
  Gang,
  Job,
  JobHistory,
  BlackMarketListing,
  BlackcoinTransaction,
  BlackcoinPackage,
  MoneyPackage,
  Dog,
  UserDog,
  Friendship,
  Message,
  IpTracking,
  MinistryMission,
  UserMinistryMission,
  Suggestion,
  GlobalMessage,
  BloodContract,
  ProfileRating,
  Task,
  UserTaskProgress,
  Notification,
  SpecialItem,
  GameNews,
  GangMember,
  GangJoinRequest,
  LoginGift,
  LoginGiftItem,
  UserLoginGift
};

// Login Gift associations
LoginGift.hasMany(LoginGiftItem, { foreignKey: 'loginGiftId', as: 'items' });
LoginGiftItem.belongsTo(LoginGift, { foreignKey: 'loginGiftId' });

User.hasOne(UserLoginGift, { foreignKey: 'userId' });
UserLoginGift.belongsTo(User, { foreignKey: 'userId' });

// Add associations for items
LoginGiftItem.belongsTo(Weapon, { foreignKey: 'itemId', as: 'weapon', constraints: false });
LoginGiftItem.belongsTo(Armor, { foreignKey: 'itemId', as: 'armor', constraints: false });
LoginGiftItem.belongsTo(SpecialItem, { foreignKey: 'itemId', as: 'specialItem', constraints: false }); 