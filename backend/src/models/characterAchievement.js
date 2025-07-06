// backend/src/models/characterAchievement.js  (final)
import { Model, DataTypes } from 'sequelize';

export default class CharacterAchievement extends Model {
  static init(sequelize) {
    return super.init(
      {
        characterId:  { type: DataTypes.INTEGER, allowNull: false },
        achievementId:{ type: DataTypes.INTEGER, allowNull: false },
        unlockedAt:   { type: DataTypes.DATE,    defaultValue: DataTypes.NOW },
      },
      {
        sequelize,
        modelName: 'CharacterAchievement',
        tableName: 'CharacterAchievements',
        timestamps: false,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Character,   { foreignKey: 'characterId'  });
    this.belongsTo(models.Achievement, { foreignKey: 'achievementId' });

    // optional M-N convenience
    models.Character.belongsToMany(models.Achievement, {
      through: this,
      foreignKey: 'characterId',
    });
    models.Achievement.belongsToMany(models.Character, {
      through: this,
      foreignKey: 'achievementId',
    });
  }
}
