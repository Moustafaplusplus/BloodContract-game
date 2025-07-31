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

User.prototype.comparePassword = async function(candidatePassword) {
  if (this.isGuest) {
    return false; // Guest users can't use password comparison
  }
  return bcrypt.compare(candidatePassword, this.password);
};

export { User }; 