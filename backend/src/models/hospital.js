// backend/src/models/hospital.js
import { Model, DataTypes } from 'sequelize';

export default class Hospital extends Model {
  static init(sequelize) {
    return super.init(
      {
        /* FK -------------------------------------------------------- */
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'Users', key: 'id' },
        },

        /* timers & penalties --------------------------------------- */
        minutes: {                     // minutes before auto-release
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        hpLoss: {                      // HP the player lost
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'hpLost',             // ← DB column stays “hpLost”
        },
        healRate: {                    // $ per remaining minute to heal
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 3,
        },

        /* timestamps ---------------------------------------------- */
        startedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        releasedAt: {                  // when the player is auto-released
          type: DataTypes.DATE,
          allowNull: false,
          field: 'releaseAt',
        },
      },
      {
        sequelize,
        modelName: 'Hospital',
        tableName: 'Hospitals',
        timestamps: false,
      },
    );
  }
}
