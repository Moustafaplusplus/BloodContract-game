'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const armorsData = [
      {
        name: "قميص قديم وغبار",
        def: 5,
        hpBonus: 0,
        price: 2000,
        rarity: "common",
        imageUrl: "",
        currency: "money"
      },
      {
        name: "سترة درع جلدية",
        def: 15,
        hpBonus: 0,
        price: 8000,
        rarity: "uncommon",
        imageUrl: "",
        currency: "money"
      },
      {
        name: "درع معدني",
        def: 25,
        hpBonus: 0,
        price: 15000,
        rarity: "uncommon",
        imageUrl: "",
        currency: "money"
      },
      {
        name: "سترة SWAT",
        def: 30,
        hpBonus: 0,
        price: 25000,
        rarity: "rare",
        imageUrl: "",
        currency: "money"
      },
      {
        name: "بدلة محسنة",
        def: 35,
        hpBonus: 0,
        price: 45000,
        rarity: "rare",
        imageUrl: "",
        currency: "money"
      },
      {
        name: "بدلة تمويه",
        def: 40,
        hpBonus: 0,
        price: 65000,
        rarity: "epic",
        imageUrl: "",
        currency: "blackcoin"
      },
      {
        name: "درع نانو تكنولوجي",
        def: 45,
        hpBonus: 0,
        price: 75000,
        rarity: "epic",
        imageUrl: "",
        currency: "blackcoin"
      },
      {
        name: "بدلة سيبرانية",
        def: 50,
        hpBonus: 0,
        price: 85000,
        rarity: "epic",
        imageUrl: "",
        currency: "blackcoin"
      },
      {
        name: "درع تنين",
        def: 60,
        hpBonus: 0,
        price: 120000,
        rarity: "legend",
        imageUrl: "",
        currency: "blackcoin"
      },
      {
        name: "بدلة شبح أسطورية",
        def: 75,
        hpBonus: 0,
        price: 150000,
        rarity: "legend",
        imageUrl: "",
        currency: "blackcoin"
      }
    ];

    await queryInterface.bulkInsert('Armors', armorsData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Armors', null, {});
  }
}; 