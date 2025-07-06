// ============================
// backend/src/models/house.js – final
// ============================
import { Model, DataTypes } from 'sequelize';

/* ─────────── House catalog ─────────── */
export class House extends Model {
  static init(sequelize) {
    return super.init(
      {
        name:          { type: DataTypes.STRING,  allowNull: false },
        cost:          { type: DataTypes.INTEGER, allowNull: false },  // ← was “price”
        energyRegen:   { type: DataTypes.INTEGER, allowNull: false },
        defenseBonus:  { type: DataTypes.INTEGER, allowNull: false },
        description:   { type: DataTypes.TEXT,    allowNull: false },
      },
      { sequelize, modelName: 'House', tableName: 'Houses', timestamps: false },
    );
  }

  static associate(models) {
    // Users buy exactly one house, so we model it through UserHouse
    this.belongsToMany(models.User, {
      through: models.UserHouse,
      foreignKey: 'houseId',
      as: 'owners',
    });
  }
}

/* ─────────── Junction: which user owns which house ─────────── */
export class UserHouse extends Model {
  static init(sequelize) {
    return super.init(
      {
        userId:     { type: DataTypes.INTEGER, allowNull: false },
        houseId:    { type: DataTypes.INTEGER, allowNull: false },
        purchasedAt:{ type: DataTypes.DATE,    defaultValue: DataTypes.NOW },
      },
      { sequelize, modelName: 'UserHouse', tableName: 'UserHouses', timestamps: false },
    );
  }

  static associate(models) {
    this.belongsTo(models.User,  { foreignKey: 'userId'  });
    this.belongsTo(models.House, { foreignKey: 'houseId', as: 'house' }); // ← alias “house”
  }
}