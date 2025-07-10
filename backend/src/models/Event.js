import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export class Event extends Model {}

Event.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('CRIME', 'FIGHT', 'SPECIAL', 'HOLIDAY'),
    defaultValue: 'SPECIAL'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  rewards: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  requirements: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  maxParticipants: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  currentParticipants: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: 'Event',
  tableName: 'Events',
  timestamps: true
});

export class EventParticipation extends Model {}

EventParticipation.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  characterId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rewardsClaimed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: 'EventParticipation',
  tableName: 'EventParticipations',
  timestamps: false
});

// Associations
Event.hasMany(EventParticipation, { foreignKey: 'eventId' });
EventParticipation.belongsTo(Event, { foreignKey: 'eventId' }); 