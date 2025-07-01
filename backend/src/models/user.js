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
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    nickname: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    age: { type: DataTypes.INTEGER },
    password: { type: DataTypes.STRING, allowNull: false },
    energy: { type: DataTypes.INTEGER, defaultValue: 100 },
    money: { type: DataTypes.INTEGER, defaultValue: 0 },
    stats: {
      type: DataTypes.JSONB,
      defaultValue: { strength: 1, speed: 1, intelligence: 1 }
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
