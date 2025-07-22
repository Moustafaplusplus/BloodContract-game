import { DataTypes } from 'sequelize';

const BloodContract = (sequelize) => {
  const Model = sequelize.define('BloodContract', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    posterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    targetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('open', 'fulfilled', 'expired'),
      defaultValue: 'open',
      allowNull: false,
    },
    fulfilledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    assassinId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: 'blood_contracts',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false,
  });

  Model.associate = (models) => {
    Model.belongsTo(models.User, { as: 'poster', foreignKey: 'posterId' });
    Model.belongsTo(models.User, { as: 'target', foreignKey: 'targetId' });
    Model.belongsTo(models.User, { as: 'assassin', foreignKey: 'assassinId' });
  };

  return Model;
};

export default BloodContract; 