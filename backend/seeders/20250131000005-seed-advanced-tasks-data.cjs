'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const advancedTasksData = [
      // === ADVANCED TASKS (Levels 51-75) ===

      // Level Progression Tasks
      {
        title: "الوصول للمستوى 55",
        description: "وصل للمستوى 55",
        metric: "level",
        goal: 55,
        rewardMoney: 45000,
        rewardExp: 18000,
        rewardBlackcoins: 450,
        progressPoints: 60,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول للمستوى 60",
        description: "وصل للمستوى 60",
        metric: "level",
        goal: 60,
        rewardMoney: 50000,
        rewardExp: 20000,
        rewardBlackcoins: 500,
        progressPoints: 65,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول للمستوى 65",
        description: "وصل للمستوى 65",
        metric: "level",
        goal: 65,
        rewardMoney: 55000,
        rewardExp: 22000,
        rewardBlackcoins: 550,
        progressPoints: 70,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول للمستوى 70",
        description: "وصل للمستوى 70",
        metric: "level",
        goal: 70,
        rewardMoney: 60000,
        rewardExp: 24000,
        rewardBlackcoins: 600,
        progressPoints: 75,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول للمستوى 75",
        description: "وصل للمستوى 75",
        metric: "level",
        goal: 75,
        rewardMoney: 65000,
        rewardExp: 26000,
        rewardBlackcoins: 650,
        progressPoints: 80,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Money Tasks
      {
        title: "جمع أول 1000000$",
        description: "اجمع أول 1000000$ من اللعبة",
        metric: "money",
        goal: 1000000,
        rewardMoney: 200000,
        rewardExp: 100000,
        rewardBlackcoins: 2000,
        progressPoints: 150,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "جمع أول 2500000$",
        description: "اجمع أول 2500000$ من اللعبة",
        metric: "money",
        goal: 2500000,
        rewardMoney: 500000,
        rewardExp: 250000,
        rewardBlackcoins: 5000,
        progressPoints: 200,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "جمع أول 5000000$",
        description: "اجمع أول 5000000$ من اللعبة",
        metric: "money",
        goal: 5000000,
        rewardMoney: 1000000,
        rewardExp: 500000,
        rewardBlackcoins: 10000,
        progressPoints: 250,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Blackcoins Tasks
      {
        title: "جمع أول 5000 بلاك كوين",
        description: "اجمع أول 5000 بلاك كوين",
        metric: "blackcoins",
        goal: 5000,
        rewardMoney: 100000,
        rewardExp: 25000,
        rewardBlackcoins: 1000,
        progressPoints: 100,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "جمع أول 10000 بلاك كوين",
        description: "اجمع أول 10000 بلاك كوين",
        metric: "blackcoins",
        goal: 10000,
        rewardMoney: 200000,
        rewardExp: 50000,
        rewardBlackcoins: 2000,
        progressPoints: 150,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "جمع أول 25000 بلاك كوين",
        description: "اجمع أول 25000 بلاك كوين",
        metric: "blackcoins",
        goal: 25000,
        rewardMoney: 500000,
        rewardExp: 125000,
        rewardBlackcoins: 5000,
        progressPoints: 200,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Fame Tasks
      {
        title: "الوصول لشهرة 50000",
        description: "وصل لشهرة 50000",
        metric: "fame",
        goal: 50000,
        rewardMoney: 200000,
        rewardExp: 100000,
        rewardBlackcoins: 2000,
        progressPoints: 150,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول لشهرة 100000",
        description: "وصل لشهرة 100000",
        metric: "fame",
        goal: 100000,
        rewardMoney: 500000,
        rewardExp: 250000,
        rewardBlackcoins: 5000,
        progressPoints: 200,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول لشهرة 250000",
        description: "وصل لشهرة 250000",
        metric: "fame",
        goal: 250000,
        rewardMoney: 1000000,
        rewardExp: 500000,
        rewardBlackcoins: 10000,
        progressPoints: 250,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Fight Tasks
      {
        title: "الفوز في 1000 معركة",
        description: "فز في 1000 معركة",
        metric: "fights_won",
        goal: 1000,
        rewardMoney: 200000,
        rewardExp: 100000,
        rewardBlackcoins: 2000,
        progressPoints: 150,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الفوز في 2500 معركة",
        description: "فز في 2500 معركة",
        metric: "fights_won",
        goal: 2500,
        rewardMoney: 500000,
        rewardExp: 250000,
        rewardBlackcoins: 5000,
        progressPoints: 200,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الفوز في 5000 معركة",
        description: "فز في 5000 معركة",
        metric: "fights_won",
        goal: 5000,
        rewardMoney: 1000000,
        rewardExp: 500000,
        rewardBlackcoins: 10000,
        progressPoints: 250,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Crime Tasks
      {
        title: "ارتكاب 1000 جريمة",
        description: "ارتكب 1000 جريمة",
        metric: "crimes_committed",
        goal: 1000,
        rewardMoney: 200000,
        rewardExp: 100000,
        rewardBlackcoins: 2000,
        progressPoints: 150,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "ارتكاب 2500 جريمة",
        description: "ارتكب 2500 جريمة",
        metric: "crimes_committed",
        goal: 2500,
        rewardMoney: 500000,
        rewardExp: 250000,
        rewardBlackcoins: 5000,
        progressPoints: 200,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "ارتكاب 5000 جريمة",
        description: "ارتكب 5000 جريمة",
        metric: "crimes_committed",
        goal: 5000,
        rewardMoney: 1000000,
        rewardExp: 500000,
        rewardBlackcoins: 10000,
        progressPoints: 250,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Bank Tasks
      {
        title: "إيداع أول 500000$",
        description: "أودع أول 500000$ في البنك",
        metric: "money_deposited",
        goal: 500000,
        rewardMoney: 250000,
        rewardExp: 125000,
        rewardBlackcoins: 2500,
        progressPoints: 150,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "إيداع أول 1000000$",
        description: "أودع أول 1000000$ في البنك",
        metric: "money_deposited",
        goal: 1000000,
        rewardMoney: 500000,
        rewardExp: 250000,
        rewardBlackcoins: 5000,
        progressPoints: 200,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول لرصيد بنكي 500000$",
        description: "وصل لرصيد بنكي 500000$",
        metric: "bank_balance",
        goal: 500000,
        rewardMoney: 200000,
        rewardExp: 100000,
        rewardBlackcoins: 2000,
        progressPoints: 150,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول لرصيد بنكي 1000000$",
        description: "وصل لرصيد بنكي 1000000$",
        metric: "bank_balance",
        goal: 1000000,
        rewardMoney: 500000,
        rewardExp: 250000,
        rewardBlackcoins: 5000,
        progressPoints: 200,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // === EXPERT TASKS (Levels 76-100) ===

      // Level Progression Tasks
      {
        title: "الوصول للمستوى 80",
        description: "وصل للمستوى 80",
        metric: "level",
        goal: 80,
        rewardMoney: 70000,
        rewardExp: 28000,
        rewardBlackcoins: 700,
        progressPoints: 85,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول للمستوى 85",
        description: "وصل للمستوى 85",
        metric: "level",
        goal: 85,
        rewardMoney: 75000,
        rewardExp: 30000,
        rewardBlackcoins: 750,
        progressPoints: 90,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول للمستوى 90",
        description: "وصل للمستوى 90",
        metric: "level",
        goal: 90,
        rewardMoney: 80000,
        rewardExp: 32000,
        rewardBlackcoins: 800,
        progressPoints: 95,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول للمستوى 95",
        description: "وصل للمستوى 95",
        metric: "level",
        goal: 95,
        rewardMoney: 85000,
        rewardExp: 34000,
        rewardBlackcoins: 850,
        progressPoints: 100,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول للمستوى 100",
        description: "وصل للمستوى 100",
        metric: "level",
        goal: 100,
        rewardMoney: 100000,
        rewardExp: 40000,
        rewardBlackcoins: 1000,
        progressPoints: 125,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Money Tasks
      {
        title: "جمع أول 10000000$",
        description: "اجمع أول 10000000$ من اللعبة",
        metric: "money",
        goal: 10000000,
        rewardMoney: 2000000,
        rewardExp: 1000000,
        rewardBlackcoins: 20000,
        progressPoints: 300,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "جمع أول 25000000$",
        description: "اجمع أول 25000000$ من اللعبة",
        metric: "money",
        goal: 25000000,
        rewardMoney: 5000000,
        rewardExp: 2500000,
        rewardBlackcoins: 50000,
        progressPoints: 400,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "جمع أول 50000000$",
        description: "اجمع أول 50000000$ من اللعبة",
        metric: "money",
        goal: 50000000,
        rewardMoney: 10000000,
        rewardExp: 5000000,
        rewardBlackcoins: 100000,
        progressPoints: 500,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Blackcoins Tasks
      {
        title: "جمع أول 50000 بلاك كوين",
        description: "اجمع أول 50000 بلاك كوين",
        metric: "blackcoins",
        goal: 50000,
        rewardMoney: 1000000,
        rewardExp: 250000,
        rewardBlackcoins: 10000,
        progressPoints: 250,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "جمع أول 100000 بلاك كوين",
        description: "اجمع أول 100000 بلاك كوين",
        metric: "blackcoins",
        goal: 100000,
        rewardMoney: 2000000,
        rewardExp: 500000,
        rewardBlackcoins: 20000,
        progressPoints: 300,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "جمع أول 250000 بلاك كوين",
        description: "اجمع أول 250000 بلاك كوين",
        metric: "blackcoins",
        goal: 250000,
        rewardMoney: 5000000,
        rewardExp: 1250000,
        rewardBlackcoins: 50000,
        progressPoints: 400,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Fame Tasks
      {
        title: "الوصول لشهرة 500000",
        description: "وصل لشهرة 500000",
        metric: "fame",
        goal: 500000,
        rewardMoney: 2000000,
        rewardExp: 1000000,
        rewardBlackcoins: 20000,
        progressPoints: 300,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول لشهرة 1000000",
        description: "وصل لشهرة 1000000",
        metric: "fame",
        goal: 1000000,
        rewardMoney: 5000000,
        rewardExp: 2500000,
        rewardBlackcoins: 50000,
        progressPoints: 400,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول لشهرة 2500000",
        description: "وصل لشهرة 2500000",
        metric: "fame",
        goal: 2500000,
        rewardMoney: 10000000,
        rewardExp: 5000000,
        rewardBlackcoins: 100000,
        progressPoints: 500,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Fight Tasks
      {
        title: "الفوز في 10000 معركة",
        description: "فز في 10000 معركة",
        metric: "fights_won",
        goal: 10000,
        rewardMoney: 2000000,
        rewardExp: 1000000,
        rewardBlackcoins: 20000,
        progressPoints: 300,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الفوز في 25000 معركة",
        description: "فز في 25000 معركة",
        metric: "fights_won",
        goal: 25000,
        rewardMoney: 5000000,
        rewardExp: 2500000,
        rewardBlackcoins: 50000,
        progressPoints: 400,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الفوز في 50000 معركة",
        description: "فز في 50000 معركة",
        metric: "fights_won",
        goal: 50000,
        rewardMoney: 10000000,
        rewardExp: 5000000,
        rewardBlackcoins: 100000,
        progressPoints: 500,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Crime Tasks
      {
        title: "ارتكاب 10000 جريمة",
        description: "ارتكب 10000 جريمة",
        metric: "crimes_committed",
        goal: 10000,
        rewardMoney: 2000000,
        rewardExp: 1000000,
        rewardBlackcoins: 20000,
        progressPoints: 300,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "ارتكاب 25000 جريمة",
        description: "ارتكب 25000 جريمة",
        metric: "crimes_committed",
        goal: 25000,
        rewardMoney: 5000000,
        rewardExp: 2500000,
        rewardBlackcoins: 50000,
        progressPoints: 400,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "ارتكاب 50000 جريمة",
        description: "ارتكب 50000 جريمة",
        metric: "crimes_committed",
        goal: 50000,
        rewardMoney: 10000000,
        rewardExp: 5000000,
        rewardBlackcoins: 100000,
        progressPoints: 500,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Bank Tasks
      {
        title: "إيداع أول 5000000$",
        description: "أودع أول 5000000$ في البنك",
        metric: "money_deposited",
        goal: 5000000,
        rewardMoney: 2500000,
        rewardExp: 1250000,
        rewardBlackcoins: 25000,
        progressPoints: 300,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "إيداع أول 10000000$",
        description: "أودع أول 10000000$ في البنك",
        metric: "money_deposited",
        goal: 10000000,
        rewardMoney: 5000000,
        rewardExp: 2500000,
        rewardBlackcoins: 50000,
        progressPoints: 400,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول لرصيد بنكي 5000000$",
        description: "وصل لرصيد بنكي 5000000$",
        metric: "bank_balance",
        goal: 5000000,
        rewardMoney: 2000000,
        rewardExp: 1000000,
        rewardBlackcoins: 20000,
        progressPoints: 300,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول لرصيد بنكي 10000000$",
        description: "وصل لرصيد بنكي 10000000$",
        metric: "bank_balance",
        goal: 10000000,
        rewardMoney: 5000000,
        rewardExp: 2500000,
        rewardBlackcoins: 50000,
        progressPoints: 400,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Tasks', advancedTasksData, {});
  },

  async down(queryInterface, Sequelize) {
    // Remove only the advanced and expert tasks by their titles
    const advancedTaskTitles = [
      "الوصول للمستوى 55", "الوصول للمستوى 60", "الوصول للمستوى 65", "الوصول للمستوى 70", "الوصول للمستوى 75",
      "جمع أول 1000000$", "جمع أول 2500000$", "جمع أول 5000000$",
      "جمع أول 5000 بلاك كوين", "جمع أول 10000 بلاك كوين", "جمع أول 25000 بلاك كوين",
      "الوصول لشهرة 50000", "الوصول لشهرة 100000", "الوصول لشهرة 250000",
      "الفوز في 1000 معركة", "الفوز في 2500 معركة", "الفوز في 5000 معركة",
      "ارتكاب 1000 جريمة", "ارتكاب 2500 جريمة", "ارتكاب 5000 جريمة",
      "إيداع أول 500000$", "إيداع أول 1000000$", "الوصول لرصيد بنكي 500000$", "الوصول لرصيد بنكي 1000000$",
      "الوصول للمستوى 80", "الوصول للمستوى 85", "الوصول للمستوى 90", "الوصول للمستوى 95", "الوصول للمستوى 100",
      "جمع أول 10000000$", "جمع أول 25000000$", "جمع أول 50000000$",
      "جمع أول 50000 بلاك كوين", "جمع أول 100000 بلاك كوين", "جمع أول 250000 بلاك كوين",
      "الوصول لشهرة 500000", "الوصول لشهرة 1000000", "الوصول لشهرة 2500000",
      "الفوز في 10000 معركة", "الفوز في 25000 معركة", "الفوز في 50000 معركة",
      "ارتكاب 10000 جريمة", "ارتكاب 25000 جريمة", "ارتكاب 50000 جريمة",
      "إيداع أول 5000000$", "إيداع أول 10000000$", "الوصول لرصيد بنكي 5000000$", "الوصول لرصيد بنكي 10000000$"
    ];
    
    await queryInterface.bulkDelete('Tasks', {
      title: advancedTaskTitles
    }, {});
  }
}; 