'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const carsData = [
      // === COMMON CARS (Basic vehicles) ===
      {
        name: "سوزوكي سويفت",
        description: "سيارة اقتصادية صغيرة، مثالية للتنقل اليومي في المدينة. سريعة وموفرة للوقود.",
        cost: 5000,
        attackBonus: 0,
        defenseBonus: 5,
        rarity: "common",
        currency: "money"
      },
      {
        name: "هوندا سيفيك",
        description: "سيارة عائلية موثوقة، توازن مثالي بين الأداء والاقتصادية.",
        cost: 8000,
        attackBonus: 0,
        defenseBonus: 8,
        rarity: "common",
        currency: "money"
      },
      {
        name: "سيارة الشرطة",
        description: "سيارة رسمية للشرطة، مجهزة بأحدث التقنيات الأمنية.",
        cost: 12000,
        attackBonus: 5,
        defenseBonus: 15,
        rarity: "uncommon",
        currency: "money"
      },

      // === UNCOMMON CARS (Mid-tier vehicles) ===
      {
        name: "سيارة أمريكية كلاسيكية",
        description: "سيارة أمريكية كلاسيكية بقوة محرك هائلة ومظهر أنيق.",
        cost: 15000,
        attackBonus: 8,
        defenseBonus: 10,
        rarity: "uncommon",
        currency: "money"
      },
      {
        name: "سيارة فانتوم تاكسي",
        description: "سيارة تاكسي كلاسيكية، مثالية للتنقل في المدينة.",
        cost: 18000,
        attackBonus: 3,
        defenseBonus: 12,
        rarity: "uncommon",
        currency: "money"
      },
      {
        name: "سيارة ديزرت روفر",
        description: "سيارة دفع رباعي قوية، مصممة للطرق الوعرة والصحاري.",
        cost: 22000,
        attackBonus: 5,
        defenseBonus: 15,
        rarity: "uncommon",
        currency: "money"
      },
      {
        name: "سيارة رايدر 4x4",
        description: "سيارة رياضية للطرق الوعرة، تجمع بين القوة والأناقة.",
        cost: 25000,
        attackBonus: 7,
        defenseBonus: 13,
        rarity: "uncommon",
        currency: "money"
      },

      // === RARE CARS (High-performance vehicles) ===
      {
        name: "سيارة بانتشر جي تي آر",
        description: "سيارة رياضية عالية الأداء، مصممة للسرعة والتحكم المثالي.",
        cost: 35000,
        attackBonus: 12,
        defenseBonus: 8,
        rarity: "rare",
        currency: "money"
      },
      {
        name: "سيارة سيربنت الرياضية",
        description: "سيارة رياضية أنيقة، تجمع بين السرعة والأناقة في تصميم واحد.",
        cost: 40000,
        attackBonus: 15,
        defenseBonus: 6,
        rarity: "rare",
        currency: "money"
      },
      {
        name: "سيارة إنفيرنو الرياضية",
        description: "سيارة رياضية حارقة، مصممة للسرعة القصوى والأداء المذهل.",
        cost: 45000,
        attackBonus: 18,
        defenseBonus: 5,
        rarity: "rare",
        currency: "money"
      },
      {
        name: "سيارة بوجاتي",
        description: "سيارة فاخرة عالية الأداء، رمز للفخامة والسرعة.",
        cost: 60000,
        attackBonus: 20,
        defenseBonus: 10,
        rarity: "rare",
        currency: "blackcoin"
      },

      // === EPIC CARS (Premium vehicles) ===
      {
        name: "سيارة سينتينل",
        description: "سيارة فاخرة مصممة للحماية، مجهزة بأحدث تقنيات الأمان.",
        cost: 75000,
        attackBonus: 15,
        defenseBonus: 25,
        rarity: "epic",
        currency: "blackcoin"
      },
      {
        name: "سيارة تيتان بيك أب",
        description: "شاحنة بيك أب قوية، مثالية لنقل البضائع الثقيلة.",
        cost: 80000,
        attackBonus: 10,
        defenseBonus: 30,
        rarity: "epic",
        currency: "blackcoin"
      },
      {
        name: "سيارة رينو هولر",
        description: "شاحنة نقل كبيرة، مصممة لحمل الأوزان الثقيلة.",
        cost: 85000,
        attackBonus: 8,
        defenseBonus: 35,
        rarity: "epic",
        currency: "blackcoin"
      },
      {
        name: "سيارة جوجرنوت إس يو في",
        description: "سيارة رياضية متعددة الاستخدامات، تجمع بين القوة والفخامة.",
        cost: 90000,
        attackBonus: 18,
        defenseBonus: 20,
        rarity: "epic",
        currency: "blackcoin"
      },

      // === LEGENDARY CARS (Ultimate vehicles) ===
      {
        name: "سيارة وارلورد المدرعة",
        description: "سيارة مدرعة فائقة القوة، مصممة للحماية القصوى والهجوم.",
        cost: 120000,
        attackBonus: 25,
        defenseBonus: 40,
        rarity: "legend",
        currency: "blackcoin"
      }
    ];

    await queryInterface.bulkInsert('Cars', carsData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Cars', null, {});
  }
}; 