// ============================
// backend/src/models/user.js
// ============================
import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';

export default class User extends Model {
  /* ----- instance helpers ----- */
  validPassword(password) {
    return bcrypt.compareSync(password, this.password);
  }

  /* ----- model definition ----- */
  static init(sequelize) {
    return super.init(
      {
        /* ---------- Identity ---------- */
        username: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: { notEmpty: true, len: [3, 30] },
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: { isEmail: true },
        },
        age: {
          type: DataTypes.INTEGER,
          validate: { min: 13, max: 120 },
        },

        /* ---------- Auth ---------- */
        password: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: { len: [6, 100] },
        },

        /* ---------- Gameplay ---------- */
        energy: { type: DataTypes.INTEGER, defaultValue: 100 },
        money:  { type: DataTypes.INTEGER, defaultValue: 0 },
        hp:     { type: DataTypes.INTEGER, defaultValue: 100 }, // ✅ NEW
        level:  { type: DataTypes.INTEGER, defaultValue: 1 },   // ✅ NEW
        stats: {
          type: DataTypes.JSONB,
          defaultValue: { strength: 1, speed: 1, intelligence: 1 },
        },

        /* ---------- Profile ---------- */
        bio: {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: '',
        },
        avatarUrl: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: '/avatars/default.png',
        },
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'Users',
        timestamps: false,

        /* ---------- Hooks ---------- */
        hooks: {
          // hash password on create
          beforeCreate: async (user) => {
            user.password = await bcrypt.hash(user.password, 10);
          },
          // hash password if user updates it
          beforeUpdate: async (user) => {
            if (user.changed('password')) {
              user.password = await bcrypt.hash(user.password, 10);
            }
          },
        },
      }
    );
  }

  /* ----- associations ----- */
  static associate(models) {
    this.hasOne(models.Character, { foreignKey: 'userId' });
    // any additional associations (e.g. Friendship) live in models/index.js
  }
}
