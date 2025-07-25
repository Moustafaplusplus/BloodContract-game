import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { User } from './User.js';

export class ProfileRating extends Model {}

ProfileRating.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  raterId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  targetId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  rating: {
    type: DataTypes.ENUM('LIKE', 'DISLIKE'),
    allowNull: false
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
  sequelize,
  modelName: 'ProfileRating',
  tableName: 'ProfileRatings',
  timestamps: false
});

ProfileRating.belongsTo(User, { as: 'Rater', foreignKey: 'raterId', targetKey: 'id' });
ProfileRating.belongsTo(User, { as: 'Target', foreignKey: 'targetId', targetKey: 'id' }); 