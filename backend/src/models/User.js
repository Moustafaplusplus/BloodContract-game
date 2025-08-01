import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 20],
      is: /^[a-zA-Z0-9_\u0600-\u06FF]+$/
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 13,
      max: 100
    }
  },
  gender: {
    type: DataTypes.ENUM('male', 'female'),
    allowNull: false
  },
  avatarUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isVip: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isGuest: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  hasSeenIntro: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Firebase Auth fields
  firebaseUid: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  // Legacy Google OAuth fields (for migration)
  googleId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  // Ban/IP blocking fields
  isBanned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  banReason: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  bannedAt: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  isIpBanned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ipBanReason: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  ipBannedAt: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  lastIpAddress: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  // Chat moderation fields
  chatMutedUntil: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  chatBannedUntil: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  // Additional fields that might be needed
  bio: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  money: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  blackcoins: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password && !user.isGuest) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password') && !user.isGuest) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

// Add the missing validPassword method
User.prototype.validPassword = async function(password) {
  if (this.isGuest) {
    return false; // Guest users can't use password comparison
  }
  return bcrypt.compare(password, this.password);
};

// Keep the comparePassword method for compatibility
User.prototype.comparePassword = async function(candidatePassword) {
  if (this.isGuest) {
    return false; // Guest users can't use password comparison
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Add toJSON method to exclude password from serialization
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

export { User }; 