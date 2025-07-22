import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/db.js';

export class User extends Model {
  async validPassword(password) {
    return bcrypt.compare(password, this.password);
  }
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }
}

User.init({
  username: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { notEmpty: true, len: [3, 30] } },
  email:    { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  age:      { type: DataTypes.INTEGER, validate: { min: 13, max: 120 } },
  gender:   { type: DataTypes.ENUM('male', 'female'), allowNull: false, validate: { notEmpty: true } },
  password: { type: DataTypes.STRING, allowNull: false, validate: { len: [6, 100] } },
  bio:       { type: DataTypes.TEXT, defaultValue: '' },
  avatarUrl: { type: DataTypes.STRING },
  isVip:     { type: DataTypes.BOOLEAN, defaultValue: false },
  money:     { type: DataTypes.INTEGER, defaultValue: 0 },
  blackcoins:{ type: DataTypes.INTEGER, defaultValue: 0 },
  isAdmin:   { type: DataTypes.BOOLEAN, defaultValue: false },
  // IP blocking fields
  isBanned:  { type: DataTypes.BOOLEAN, defaultValue: false },
  banReason: { type: DataTypes.TEXT, defaultValue: '' },
  bannedAt:  { type: DataTypes.DATE, defaultValue: null },
  isIpBanned: { type: DataTypes.BOOLEAN, defaultValue: false },
  ipBanReason: { type: DataTypes.TEXT, defaultValue: '' },
  ipBannedAt: { type: DataTypes.DATE, defaultValue: null },
  lastIpAddress: { type: DataTypes.STRING, defaultValue: null },
  // Chat moderation fields
  chatMutedUntil: { type: DataTypes.DATE, defaultValue: null },
  chatBannedUntil: { type: DataTypes.DATE, defaultValue: null },
}, {
  sequelize,
  modelName:  'User',
  tableName:  'Users',
  timestamps: false,
  hooks: {
    async beforeCreate(user) {
      user.password = await bcrypt.hash(user.password, 10);
      if (!user.avatarUrl) {
        user.avatarUrl = user.gender === 'female'
          ? '/avatars/default_avatar_female.png'
          : '/avatars/default_avatar_male.png';
      }
    },
    async beforeUpdate(user) {
      if (user.changed('password')) user.password = await bcrypt.hash(user.password, 10);
    },
  },
}); 