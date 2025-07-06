// ── backend/src/models/jail.js
import { Model, DataTypes } from 'sequelize';

export default class Jail extends Model {
  static init(sequelize) {
    return super.init(
      {
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'Users', key: 'id' },
        },
        minutes: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        bailRate: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 5, // $ per second to bail out
        },
        startedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        releasedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'releaseAt',
        },
      },
      {
        sequelize,
        modelName: 'Jail',
        tableName: 'Jails',
        timestamps: false,
      },
    );
  }
}