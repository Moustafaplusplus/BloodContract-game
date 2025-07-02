import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';
import bcrypt from 'bcryptjs';

class User extends Model {
  validPassword(password) {
    return bcrypt.compareSync(password, this.password);
  }
}

User.init(
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 30],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    age: {
      type: DataTypes.INTEGER,
      validate: {
        min: 13,
        max: 120,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100],
      },
    },
    energy: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
    },
    money: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    stats: {
      type: DataTypes.JSONB,
      defaultValue: {
        strength: 1,
        speed: 1,
        intelligence: 1,
      },
    },
  },
  {
    sequelize,
    modelName: 'user',
    hooks: {
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 10);
      },
    },
  }
);

export default User;
