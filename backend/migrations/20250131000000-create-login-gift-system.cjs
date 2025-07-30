'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create login_gifts table
    await queryInterface.createTable('login_gifts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      dayNumber: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      expReward: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      moneyReward: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      blackcoinReward: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create login_gift_items table
    await queryInterface.createTable('login_gift_items', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      loginGiftId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'login_gifts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      itemType: {
        type: Sequelize.ENUM('weapon', 'armor', 'special_item'),
        allowNull: false
      },
      itemId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create user_login_gifts table
    await queryInterface.createTable('user_login_gifts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      currentStreak: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      lastClaimDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      claimedDays: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      isCompleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Insert default 15-day configuration
    const defaultGifts = [];
    for (let day = 1; day <= 15; day++) {
      defaultGifts.push({
        dayNumber: day,
        expReward: day * 100,
        moneyReward: day * 500,
        blackcoinReward: day <= 5 ? 0 : Math.floor(day / 3),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    await queryInterface.bulkInsert('login_gifts', defaultGifts);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_login_gifts');
    await queryInterface.dropTable('login_gift_items');
    await queryInterface.dropTable('login_gifts');
  }
}; 