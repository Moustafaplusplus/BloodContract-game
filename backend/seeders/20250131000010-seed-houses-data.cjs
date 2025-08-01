'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const housesData = [
      // === BASIC HOUSES (MONEY) ===

      // Common
      {
        name: "رجل مغطى بالكرتون بجانب القمامة",
        description: "مأوى بسيط من الكرتون",
        defenseBonus: 5,
        hpBonus: 0,
        cost: 5000,
        rarity: "common",
        currency: "money"
      },
      {
        name: "منزل صغير",
        description: "منزل صغير وبسيط، مناسب للمبتدئين",
        defenseBonus: 10,
        hpBonus: 0,
        cost: 15000,
        rarity: "common",
        currency: "money"
      },
      {
        name: "كوخ خشبي",
        description: "كوخ خشبي بسيط في الغابة",
        defenseBonus: 15,
        hpBonus: 0,
        cost: 25000,
        rarity: "common",
        currency: "money"
      },

      // Uncommon
      {
        name: "منزل قديم",
        description: "منزل قديم مع تاريخ طويل",
        defenseBonus: 20,
        hpBonus: 0,
        cost: 35000,
        rarity: "uncommon",
        currency: "money"
      },
      {
        name: "منزل عربي",
        description: "منزل عربي تقليدي مع تصميم جميل",
        defenseBonus: 25,
        hpBonus: 0,
        cost: 45000,
        rarity: "uncommon",
        currency: "money"
      },

      // Rare
      {
        name: "شقة صغيرة",
        description: "شقة صغيرة في المدينة",
        defenseBonus: 30,
        hpBonus: 0,
        cost: 55000,
        rarity: "rare",
        currency: "money"
      },
      {
        name: "استوديو أنيق",
        description: "استوديو أنيق مع تصميم عصري",
        defenseBonus: 35,
        hpBonus: 0,
        cost: 65000,
        rarity: "rare",
        currency: "money"
      },

      // Epic
      {
        name: "شقة جميلة",
        description: "شقة جميلة مع إطلالة رائعة",
        defenseBonus: 40,
        hpBonus: 0,
        cost: 75000,
        rarity: "epic",
        currency: "money"
      },
      {
        name: "غرفة على السطح",
        description: "غرفة فريدة على سطح المبنى",
        defenseBonus: 45,
        hpBonus: 0,
        cost: 85000,
        rarity: "epic",
        currency: "money"
      },
      {
        name: "فيلا",
        description: "فيلا فاخرة مع حديقة خاصة",
        defenseBonus: 50,
        hpBonus: 0,
        cost: 95000,
        rarity: "epic",
        currency: "money"
      },

      // === ADVANCED HOUSES (BLACKCOIN) ===

      // Epic
      {
        name: "غرفة تحت الأرض",
        description: "غرفة مخفية تحت الأرض",
        defenseBonus: 55,
        hpBonus: 0,
        cost: 100000,
        rarity: "epic",
        currency: "blackcoin"
      },
      {
        name: "مصنع قديم",
        description: "مصنع قديم تم تحويله إلى منزل",
        defenseBonus: 65,
        hpBonus: 0,
        cost: 130000,
        rarity: "epic",
        currency: "blackcoin"
      },

      // Legendary
      {
        name: "بنتهاوس رائع في وسط المدينة",
        description: "بنتهاوس فاخر في قلب المدينة",
        defenseBonus: 60,
        hpBonus: 0,
        cost: 120000,
        rarity: "legend",
        currency: "blackcoin"
      },
      {
        name: "قصر على الجبل",
        description: "قصر أسطوري على قمة الجبل",
        defenseBonus: 75,
        hpBonus: 0,
        cost: 150000,
        rarity: "legend",
        currency: "blackcoin"
      },
      {
        name: "مخبأ في قاعدة نووية",
        description: "مخبأ محصن في قاعدة نووية",
        defenseBonus: 80,
        hpBonus: 0,
        cost: 180000,
        rarity: "legend",
        currency: "blackcoin"
      }
    ];

    await queryInterface.bulkInsert('Houses', housesData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Houses', null, {});
  }
}; 