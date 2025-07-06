// backend/src/models/event.js
import { Model, DataTypes } from 'sequelize';

export default class Event extends Model {
  static init(sequelize) {
    return super.init(
      {
        type: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        text: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        modelName: 'Event',
        tableName: 'Events',
        timestamps: false,
      }
    );
  }
}
