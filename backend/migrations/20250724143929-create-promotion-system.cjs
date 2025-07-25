'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create Promotions table
    await queryInterface.createTable('Promotions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      titleEn: {
        type: Sequelize.STRING,
        allowNull: false
      },
      rank: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true
      },
      requiredPoints: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      powerBonus: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      defenseBonus: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Create UserPromotions table
    await queryInterface.createTable('UserPromotions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      currentRank: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      totalProgressPoints: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      lastPromotionDate: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Insert default promotions
    await queryInterface.bulkInsert('Promotions', [
      {
        title: 'مبتدئ',
        titleEn: 'Beginner',
        rank: 1,
        requiredPoints: 0,
        powerBonus: 0,
        defenseBonus: 0,
        description: 'الرتبة الأساسية - ابدأ رحلتك هنا',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'مقاتل',
        titleEn: 'Fighter',
        rank: 2,
        requiredPoints: 50,
        powerBonus: 5,
        defenseBonus: 3,
        description: 'مقاتل شجاع - بدأت تظهر مهاراتك',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'محارب',
        titleEn: 'Warrior',
        rank: 3,
        requiredPoints: 150,
        powerBonus: 12,
        defenseBonus: 8,
        description: 'محارب متمرس - خبرتك تتزايد',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'فارس',
        titleEn: 'Knight',
        rank: 4,
        requiredPoints: 300,
        powerBonus: 20,
        defenseBonus: 15,
        description: 'فارس نبيل - أصبحت قوة لا يستهان بها',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'قائد',
        titleEn: 'Commander',
        rank: 5,
        requiredPoints: 500,
        powerBonus: 30,
        defenseBonus: 25,
        description: 'قائد عسكري - مهارات قيادية عالية',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'جنرال',
        titleEn: 'General',
        rank: 6,
        requiredPoints: 800,
        powerBonus: 45,
        defenseBonus: 40,
        description: 'جنرال محترف - خبرة عسكرية واسعة',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'مارشال',
        titleEn: 'Marshal',
        rank: 7,
        requiredPoints: 1200,
        powerBonus: 65,
        defenseBonus: 60,
        description: 'مارشال عظيم - قوة هائلة',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'إمبراطور',
        titleEn: 'Emperor',
        rank: 8,
        requiredPoints: 1800,
        powerBonus: 90,
        defenseBonus: 85,
        description: 'إمبراطور عظيم - سيد المعارك',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'أسطورة',
        titleEn: 'Legend',
        rank: 9,
        requiredPoints: 2500,
        powerBonus: 120,
        defenseBonus: 115,
        description: 'أسطورة حية - قوة أسطورية',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'إله الحرب',
        titleEn: 'God of War',
        rank: 10,
        requiredPoints: 3500,
        powerBonus: 150,
        defenseBonus: 150,
        description: 'إله الحرب - القوة المطلقة',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserPromotions');
    await queryInterface.dropTable('Promotions');
  }
}; 