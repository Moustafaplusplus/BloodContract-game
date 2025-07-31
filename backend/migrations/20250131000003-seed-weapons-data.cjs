'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const weaponsData = [
      {
        name: "بندقية AK-47",
        damage: 85,
        energyBonus: 0,
        price: 15000,
        rarity: "common",
        imageUrl: "",
        currency: "money"
      },
      {
        name: "بندقية محسنة",
        damage: 95,
        energyBonus: 0,
        price: 25000,
        rarity: "uncommon",
        imageUrl: "",
        currency: "money"
      },
      {
        name: "قناص عادي",
        damage: 100,
        energyBonus: 0,
        price: 35000,
        rarity: "uncommon",
        imageUrl: "",
        currency: "money"
      },
      {
        name: "مسدس جلاك",
        damage: 65,
        energyBonus: 0,
        price: 8000,
        rarity: "common",
        imageUrl: "",
        currency: "money"
      },
      {
        name: "مسدس ديزرت إيجل",
        damage: 75,
        energyBonus: 0,
        price: 12000,
        rarity: "uncommon",
        imageUrl: "",
        currency: "money"
      },
      {
        name: "رشاش أوزي",
        damage: 70,
        energyBonus: 0,
        price: 18000,
        rarity: "uncommon",
        imageUrl: "",
        currency: "money"
      },
      {
        name: "رشاش أوزي محسن مع كاتم صوت",
        damage: 80,
        energyBonus: 0,
        price: 28000,
        rarity: "rare",
        imageUrl: "",
        currency: "money"
      },
      {
        name: "رشاش مينيغان آلي",
        damage: 110,
        energyBonus: 0,
        price: 55000,
        rarity: "rare",
        imageUrl: "",
        currency: "money"
      },
      {
        name: "بندقية خرطوش",
        damage: 90,
        energyBonus: 0,
        price: 22000,
        rarity: "uncommon",
        imageUrl: "",
        currency: "money"
      },
      {
        name: "قاذف اللهب",
        damage: 130,
        energyBonus: 0,
        price: 65000,
        rarity: "rare",
        imageUrl: "",
        currency: "money"
      },
      {
        name: "قاذف قنابل",
        damage: 150,
        energyBonus: 0,
        price: 75000,
        rarity: "epic",
        imageUrl: "",
        currency: "money"
      },
      {
        name: "قاذف صواريخ RPG",
        damage: 200,
        energyBonus: 0,
        price: 95000,
        rarity: "epic",
        imageUrl: "",
        currency: "money"
      },
      {
        name: "فأس يدوي",
        damage: 45,
        energyBonus: 0,
        price: 5000,
        rarity: "common",
        imageUrl: "",
        currency: "money"
      },
      {
        name: "سكين تكتيكي",
        damage: 35,
        energyBonus: 0,
        price: 3000,
        rarity: "common",
        imageUrl: "",
        currency: "money"
      },
      {
        name: "قناص متقدم",
        damage: 120,
        energyBonus: 0,
        price: 45000,
        rarity: "rare",
        imageUrl: "",
        currency: "blackcoin"
      },
      {
        name: "مسدس ليزر",
        damage: 120,
        energyBonus: 0,
        price: 70000,
        rarity: "epic",
        imageUrl: "",
        currency: "blackcoin"
      },
      {
        name: "مسدس صدمة",
        damage: 100,
        energyBonus: 0,
        price: 60000,
        rarity: "epic",
        imageUrl: "",
        currency: "blackcoin"
      },
      {
        name: "مسدس صدمة كبير",
        damage: 180,
        energyBonus: 0,
        price: 110000,
        rarity: "legend",
        imageUrl: "",
        currency: "blackcoin"
      },
      {
        name: "بندقية بلازما",
        damage: 140,
        energyBonus: 0,
        price: 85000,
        rarity: "epic",
        imageUrl: "",
        currency: "blackcoin"
      },
      {
        name: "بندقية نبض X9",
        damage: 160,
        energyBonus: 0,
        price: 95000,
        rarity: "epic",
        imageUrl: "",
        currency: "blackcoin"
      },
      {
        name: "مدفع صوتي",
        damage: 110,
        energyBonus: 0,
        price: 65000,
        rarity: "rare",
        imageUrl: "",
        currency: "blackcoin"
      },
      {
        name: "قنبلة سرب نانو",
        damage: 160,
        energyBonus: 0,
        price: 90000,
        rarity: "epic",
        imageUrl: "",
        currency: "blackcoin"
      },
      {
        name: "قوس ليزر أسطوري",
        damage: 200,
        energyBonus: 0,
        price: 150000,
        rarity: "legend",
        imageUrl: "",
        currency: "blackcoin"
      }
    ];

    await queryInterface.bulkInsert('Weapons', weaponsData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Weapons', null, {});
  }
}; 