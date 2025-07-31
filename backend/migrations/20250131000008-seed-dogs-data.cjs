'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const dogsData = [
      // === BASIC DOGS (MONEY) ===

      // Common
      {
        name: "جرو ضال",
        description: "جرو ضال لطيف ووفيّ، مناسب للمبتدئين",
        powerBonus: 10,
        cost: 5000,
        currency: "money"
      },

      // Uncommon
      {
        name: "كلب ألماني",
        description: "كلب ذكي ومخلص، ممتاز للحراسة والتدريب",
        powerBonus: 25,
        cost: 15000,
        currency: "money"
      },
      {
        name: "كلب مالينوي",
        description: "كلب نشط وذكي، يستخدم في الشرطة والجيش",
        powerBonus: 30,
        cost: 25000,
        currency: "money"
      },

      // Rare
      {
        name: "كلب روتويلر",
        description: "كلب قوي وشرس، ممتاز للحراسة",
        powerBonus: 35,
        cost: 35000,
        currency: "money"
      },
      {
        name: "كلب بيت بول",
        description: "كلب قوي وعنيد، يخشاه الجميع",
        powerBonus: 40,
        cost: 45000,
        currency: "money"
      },

      // Epic
      {
        name: "كلب كان كورسو",
        description: "كلب إيطالي قوي وشرس، حارس ممتاز",
        powerBonus: 45,
        cost: 55000,
        currency: "money"
      },
      {
        name: "كلب بلادهوند",
        description: "كلب صيد ممتاز بحاسة شم قوية",
        powerBonus: 50,
        cost: 65000,
        currency: "money"
      },

      // === ADVANCED DOGS (BLACKCOIN) ===

      // Epic
      {
        name: "كلب ذئب",
        description: "كلب بري شرس، يمتلك غريزة الصيد الطبيعية",
        powerBonus: 60,
        cost: 85000,
        currency: "blackcoin"
      },

      // Legendary
      {
        name: "كلب سيبراني K9",
        description: "كلب متطور مع تقنيات سيبرانية متقدمة",
        powerBonus: 75,
        cost: 120000,
        currency: "blackcoin"
      },
      {
        name: "كلب شبح أسطوري",
        description: "كلب أسطوري خارق مع قدرات شبحية",
        powerBonus: 100,
        cost: 200000,
        currency: "blackcoin"
      }
    ];

    await queryInterface.bulkInsert('Dogs', dogsData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Dogs', null, {});
  }
}; 