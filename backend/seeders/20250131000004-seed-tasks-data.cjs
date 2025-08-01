'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tasksData = [
      // === BEGINNER TASKS (Levels 1-10) ===
      
      // Level Progression Tasks
      {
        title: "الوصول للمستوى 5",
        description: "أكمل رحلتك الأولى ووصل للمستوى 5",
        metric: "level",
        goal: 5,
        rewardMoney: 1000,
        rewardExp: 500,
        rewardBlackcoins: 10,
        progressPoints: 5,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول للمستوى 10",
        description: "أكمل المرحلة الأولى ووصل للمستوى 10",
        metric: "level",
        goal: 10,
        rewardMoney: 2500,
        rewardExp: 1000,
        rewardBlackcoins: 25,
        progressPoints: 10,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول للمستوى 15",
        description: "أكمل المرحلة الثانية ووصل للمستوى 15",
        metric: "level",
        goal: 15,
        rewardMoney: 5000,
        rewardExp: 2000,
        rewardBlackcoins: 50,
        progressPoints: 15,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول للمستوى 20",
        description: "أكمل المرحلة الثالثة ووصل للمستوى 20",
        metric: "level",
        goal: 20,
        rewardMoney: 10000,
        rewardExp: 4000,
        rewardBlackcoins: 100,
        progressPoints: 20,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Money Tasks
      {
        title: "جمع أول 1000$",
        description: "اجمع أول 1000$ من اللعبة",
        metric: "money",
        goal: 1000,
        rewardMoney: 500,
        rewardExp: 200,
        rewardBlackcoins: 5,
        progressPoints: 5,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "جمع أول 5000$",
        description: "اجمع أول 5000$ من اللعبة",
        metric: "money",
        goal: 5000,
        rewardMoney: 1000,
        rewardExp: 500,
        rewardBlackcoins: 10,
        progressPoints: 10,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "جمع أول 10000$",
        description: "اجمع أول 10000$ من اللعبة",
        metric: "money",
        goal: 10000,
        rewardMoney: 2000,
        rewardExp: 1000,
        rewardBlackcoins: 20,
        progressPoints: 15,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "جمع أول 25000$",
        description: "اجمع أول 25000$ من اللعبة",
        metric: "money",
        goal: 25000,
        rewardMoney: 5000,
        rewardExp: 2500,
        rewardBlackcoins: 50,
        progressPoints: 25,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Blackcoins Tasks
      {
        title: "جمع أول 10 بلاك كوين",
        description: "اجمع أول 10 بلاك كوين",
        metric: "blackcoins",
        goal: 10,
        rewardMoney: 500,
        rewardExp: 100,
        rewardBlackcoins: 5,
        progressPoints: 5,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "جمع أول 50 بلاك كوين",
        description: "اجمع أول 50 بلاك كوين",
        metric: "blackcoins",
        goal: 50,
        rewardMoney: 1000,
        rewardExp: 250,
        rewardBlackcoins: 10,
        progressPoints: 10,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "جمع أول 100 بلاك كوين",
        description: "اجمع أول 100 بلاك كوين",
        metric: "blackcoins",
        goal: 100,
        rewardMoney: 2000,
        rewardExp: 500,
        rewardBlackcoins: 20,
        progressPoints: 15,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Fame Tasks
      {
        title: "الوصول لشهرة 100",
        description: "وصل لشهرة 100",
        metric: "fame",
        goal: 100,
        rewardMoney: 1000,
        rewardExp: 500,
        rewardBlackcoins: 10,
        progressPoints: 10,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول لشهرة 500",
        description: "وصل لشهرة 500",
        metric: "fame",
        goal: 500,
        rewardMoney: 2500,
        rewardExp: 1000,
        rewardBlackcoins: 25,
        progressPoints: 20,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول لشهرة 1000",
        description: "وصل لشهرة 1000",
        metric: "fame",
        goal: 1000,
        rewardMoney: 5000,
        rewardExp: 2000,
        rewardBlackcoins: 50,
        progressPoints: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Fight Tasks
      {
        title: "الفوز في أول معركة",
        description: "فز في أول معركة",
        metric: "fights_won",
        goal: 1,
        rewardMoney: 500,
        rewardExp: 200,
        rewardBlackcoins: 5,
        progressPoints: 5,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الفوز في 5 معارك",
        description: "فز في 5 معارك",
        metric: "fights_won",
        goal: 5,
        rewardMoney: 1000,
        rewardExp: 500,
        rewardBlackcoins: 10,
        progressPoints: 10,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الفوز في 10 معارك",
        description: "فز في 10 معارك",
        metric: "fights_won",
        goal: 10,
        rewardMoney: 2000,
        rewardExp: 1000,
        rewardBlackcoins: 20,
        progressPoints: 15,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الفوز في 25 معركة",
        description: "فز في 25 معركة",
        metric: "fights_won",
        goal: 25,
        rewardMoney: 5000,
        rewardExp: 2500,
        rewardBlackcoins: 50,
        progressPoints: 25,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Crime Tasks
      {
        title: "ارتكاب أول جريمة",
        description: "ارتكب أول جريمة",
        metric: "crimes_committed",
        goal: 1,
        rewardMoney: 500,
        rewardExp: 200,
        rewardBlackcoins: 5,
        progressPoints: 5,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "ارتكاب 5 جرائم",
        description: "ارتكب 5 جرائم",
        metric: "crimes_committed",
        goal: 5,
        rewardMoney: 1000,
        rewardExp: 500,
        rewardBlackcoins: 10,
        progressPoints: 10,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "ارتكاب 10 جرائم",
        description: "ارتكب 10 جرائم",
        metric: "crimes_committed",
        goal: 10,
        rewardMoney: 2000,
        rewardExp: 1000,
        rewardBlackcoins: 20,
        progressPoints: 15,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "ارتكاب 25 جريمة",
        description: "ارتكب 25 جريمة",
        metric: "crimes_committed",
        goal: 25,
        rewardMoney: 5000,
        rewardExp: 2500,
        rewardBlackcoins: 50,
        progressPoints: 25,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // === INTERMEDIATE TASKS (Levels 11-50) ===

      // Level Progression Tasks
      {
        title: "الوصول للمستوى 25",
        description: "وصل للمستوى 25",
        metric: "level",
        goal: 25,
        rewardMoney: 15000,
        rewardExp: 6000,
        rewardBlackcoins: 150,
        progressPoints: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول للمستوى 30",
        description: "وصل للمستوى 30",
        metric: "level",
        goal: 30,
        rewardMoney: 20000,
        rewardExp: 8000,
        rewardBlackcoins: 200,
        progressPoints: 35,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول للمستوى 35",
        description: "وصل للمستوى 35",
        metric: "level",
        goal: 35,
        rewardMoney: 25000,
        rewardExp: 10000,
        rewardBlackcoins: 250,
        progressPoints: 40,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول للمستوى 40",
        description: "وصل للمستوى 40",
        metric: "level",
        goal: 40,
        rewardMoney: 30000,
        rewardExp: 12000,
        rewardBlackcoins: 300,
        progressPoints: 45,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول للمستوى 45",
        description: "وصل للمستوى 45",
        metric: "level",
        goal: 45,
        rewardMoney: 35000,
        rewardExp: 14000,
        rewardBlackcoins: 350,
        progressPoints: 50,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول للمستوى 50",
        description: "وصل للمستوى 50",
        metric: "level",
        goal: 50,
        rewardMoney: 40000,
        rewardExp: 16000,
        rewardBlackcoins: 400,
        progressPoints: 55,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Money Tasks
      {
        title: "جمع أول 50000$",
        description: "اجمع أول 50000$ من اللعبة",
        metric: "money",
        goal: 50000,
        rewardMoney: 10000,
        rewardExp: 5000,
        rewardBlackcoins: 100,
        progressPoints: 40,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "جمع أول 100000$",
        description: "اجمع أول 100000$ من اللعبة",
        metric: "money",
        goal: 100000,
        rewardMoney: 20000,
        rewardExp: 10000,
        rewardBlackcoins: 200,
        progressPoints: 50,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "جمع أول 250000$",
        description: "اجمع أول 250000$ من اللعبة",
        metric: "money",
        goal: 250000,
        rewardMoney: 50000,
        rewardExp: 25000,
        rewardBlackcoins: 500,
        progressPoints: 75,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "جمع أول 500000$",
        description: "اجمع أول 500000$ من اللعبة",
        metric: "money",
        goal: 500000,
        rewardMoney: 100000,
        rewardExp: 50000,
        rewardBlackcoins: 1000,
        progressPoints: 100,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Blackcoins Tasks
      {
        title: "جمع أول 250 بلاك كوين",
        description: "اجمع أول 250 بلاك كوين",
        metric: "blackcoins",
        goal: 250,
        rewardMoney: 5000,
        rewardExp: 1250,
        rewardBlackcoins: 50,
        progressPoints: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "جمع أول 500 بلاك كوين",
        description: "اجمع أول 500 بلاك كوين",
        metric: "blackcoins",
        goal: 500,
        rewardMoney: 10000,
        rewardExp: 2500,
        rewardBlackcoins: 100,
        progressPoints: 40,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "جمع أول 1000 بلاك كوين",
        description: "اجمع أول 1000 بلاك كوين",
        metric: "blackcoins",
        goal: 1000,
        rewardMoney: 20000,
        rewardExp: 5000,
        rewardBlackcoins: 200,
        progressPoints: 50,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "جمع أول 2500 بلاك كوين",
        description: "اجمع أول 2500 بلاك كوين",
        metric: "blackcoins",
        goal: 2500,
        rewardMoney: 50000,
        rewardExp: 12500,
        rewardBlackcoins: 500,
        progressPoints: 75,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Fame Tasks
      {
        title: "الوصول لشهرة 2500",
        description: "وصل لشهرة 2500",
        metric: "fame",
        goal: 2500,
        rewardMoney: 10000,
        rewardExp: 5000,
        rewardBlackcoins: 100,
        progressPoints: 40,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول لشهرة 5000",
        description: "وصل لشهرة 5000",
        metric: "fame",
        goal: 5000,
        rewardMoney: 20000,
        rewardExp: 10000,
        rewardBlackcoins: 200,
        progressPoints: 50,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول لشهرة 10000",
        description: "وصل لشهرة 10000",
        metric: "fame",
        goal: 10000,
        rewardMoney: 50000,
        rewardExp: 25000,
        rewardBlackcoins: 500,
        progressPoints: 75,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول لشهرة 25000",
        description: "وصل لشهرة 25000",
        metric: "fame",
        goal: 25000,
        rewardMoney: 100000,
        rewardExp: 50000,
        rewardBlackcoins: 1000,
        progressPoints: 100,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Fight Tasks
      {
        title: "الفوز في 50 معركة",
        description: "فز في 50 معركة",
        metric: "fights_won",
        goal: 50,
        rewardMoney: 10000,
        rewardExp: 5000,
        rewardBlackcoins: 100,
        progressPoints: 40,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الفوز في 100 معركة",
        description: "فز في 100 معركة",
        metric: "fights_won",
        goal: 100,
        rewardMoney: 20000,
        rewardExp: 10000,
        rewardBlackcoins: 200,
        progressPoints: 50,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الفوز في 250 معركة",
        description: "فز في 250 معركة",
        metric: "fights_won",
        goal: 250,
        rewardMoney: 50000,
        rewardExp: 25000,
        rewardBlackcoins: 500,
        progressPoints: 75,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الفوز في 500 معركة",
        description: "فز في 500 معركة",
        metric: "fights_won",
        goal: 500,
        rewardMoney: 100000,
        rewardExp: 50000,
        rewardBlackcoins: 1000,
        progressPoints: 100,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Crime Tasks
      {
        title: "ارتكاب 50 جريمة",
        description: "ارتكب 50 جريمة",
        metric: "crimes_committed",
        goal: 50,
        rewardMoney: 10000,
        rewardExp: 5000,
        rewardBlackcoins: 100,
        progressPoints: 40,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "ارتكاب 100 جريمة",
        description: "ارتكب 100 جريمة",
        metric: "crimes_committed",
        goal: 100,
        rewardMoney: 20000,
        rewardExp: 10000,
        rewardBlackcoins: 200,
        progressPoints: 50,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "ارتكاب 250 جريمة",
        description: "ارتكب 250 جريمة",
        metric: "crimes_committed",
        goal: 250,
        rewardMoney: 50000,
        rewardExp: 25000,
        rewardBlackcoins: 500,
        progressPoints: 75,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "ارتكاب 500 جريمة",
        description: "ارتكب 500 جريمة",
        metric: "crimes_committed",
        goal: 500,
        rewardMoney: 100000,
        rewardExp: 50000,
        rewardBlackcoins: 1000,
        progressPoints: 100,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Bank Tasks
      {
        title: "إيداع أول 10000$",
        description: "أودع أول 10000$ في البنك",
        metric: "money_deposited",
        goal: 10000,
        rewardMoney: 5000,
        rewardExp: 2500,
        rewardBlackcoins: 50,
        progressPoints: 25,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "إيداع أول 50000$",
        description: "أودع أول 50000$ في البنك",
        metric: "money_deposited",
        goal: 50000,
        rewardMoney: 25000,
        rewardExp: 12500,
        rewardBlackcoins: 250,
        progressPoints: 50,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "إيداع أول 100000$",
        description: "أودع أول 100000$ في البنك",
        metric: "money_deposited",
        goal: 100000,
        rewardMoney: 50000,
        rewardExp: 25000,
        rewardBlackcoins: 500,
        progressPoints: 75,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول لرصيد بنكي 25000$",
        description: "وصل لرصيد بنكي 25000$",
        metric: "bank_balance",
        goal: 25000,
        rewardMoney: 10000,
        rewardExp: 5000,
        rewardBlackcoins: 100,
        progressPoints: 40,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "الوصول لرصيد بنكي 100000$",
        description: "وصل لرصيد بنكي 100000$",
        metric: "bank_balance",
        goal: 100000,
        rewardMoney: 50000,
        rewardExp: 25000,
        rewardBlackcoins: 500,
        progressPoints: 75,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Tasks', tasksData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Tasks', null, {});
  }
}; 