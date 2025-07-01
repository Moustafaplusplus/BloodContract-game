import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';
import bcrypt from 'bcrypt';

class User extends Model {
  validPassword(password) {
    return bcrypt.compareSync(password, this.password);
  }
}

User.init(
  {
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
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
