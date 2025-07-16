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
  avatarUrl: { type: DataTypes.STRING, defaultValue: '/avatars/default.png' },
}, {
  sequelize,
  modelName:  'User',
  tableName:  'Users',
  timestamps: false,
  hooks: {
    async beforeCreate(user) { user.password = await bcrypt.hash(user.password, 10); },
    async beforeUpdate(user) {
      if (user.changed('password')) user.password = await bcrypt.hash(user.password, 10);
    },
  },
}); 