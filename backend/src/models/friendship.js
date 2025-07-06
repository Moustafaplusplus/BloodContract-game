// Friendship model (ES modules)
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Friendship = sequelize.define('Friendship', {
  requesterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  addresseeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'blocked'),
    defaultValue: 'pending',
  },
});

export default Friendship;
