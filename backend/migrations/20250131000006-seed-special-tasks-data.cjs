'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const specialTasksData = [
      // === SPECIAL TASKS ===

      // Days in Game Tasks
      {
        title: "اللعب لمدة 7 أيام",
        description: "العب لمدة 7 أيام متتالية",
        metric: "days_in_game",
        goal: 7,
        rewardMoney: 5000,
        rewardExp: 2500,
        rewardBlackcoins: 50,
        progressPoints: 25,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "اللعب لمدة 30 يوم",
        description: "العب لمدة 30 يوم متتالية",
        metric: "days_in_game",
        goal: 30,
        rewardMoney: 25000,
        rewardExp: 12500,
        rewardBlackcoins: 250,
        progressPoints: 75,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "اللعب لمدة 100 يوم",
        description: "العب لمدة 100 يوم متتالية",
        metric: "days_in_game",
        goal: 100,
        rewardMoney: 100000,
        rewardExp: 50000,
        rewardBlackcoins: 1000,
        progressPoints: 200,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "اللعب لمدة 365 يوم",
        description: "العب لمدة 365 يوم متتالية",
        metric: "days_in_game",
        goal: 365,
        rewardMoney: 500000,
        rewardExp: 250000,
        rewardBlackcoins: 5000,
        progressPoints: 500,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Kill Count Tasks
      {
        title: "قتل أول لاعب",
        description: "اقتل أول لاعب",
        metric: "kill_count",
        goal: 1,
        rewardMoney: 1000,
        rewardExp: 500,
        rewardBlackcoins: 10,
        progressPoints: 10,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "قتل 10 لاعبين",
        description: "اقتل 10 لاعبين",
        metric: "kill_count",
        goal: 10,
        rewardMoney: 5000,
        rewardExp: 2500,
        rewardBlackcoins: 50,
        progressPoints: 25,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "قتل 50 لاعب",
        description: "اقتل 50 لاعب",
        metric: "kill_count",
        goal: 50,
        rewardMoney: 25000,
        rewardExp: 12500,
        rewardBlackcoins: 250,
        progressPoints: 75,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "قتل 100 لاعب",
        description: "اقتل 100 لاعب",
        metric: "kill_count",
        goal: 100,
        rewardMoney: 50000,
        rewardExp: 25000,
        rewardBlackcoins: 500,
        progressPoints: 150,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "قتل 500 لاعب",
        description: "اقتل 500 لاعب",
        metric: "kill_count",
        goal: 500,
        rewardMoney: 250000,
        rewardExp: 125000,
        rewardBlackcoins: 2500,
        progressPoints: 300,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "قتل 1000 لاعب",
        description: "اقتل 1000 لاعب",
        metric: "kill_count",
        goal: 1000,
        rewardMoney: 500000,
        rewardExp: 250000,
        rewardBlackcoins: 5000,
        progressPoints: 500,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Total Fights Tasks
      {
        title: "خوض أول 10 معارك",
        description: "اخض أول 10 معارك",
        metric: "total_fights",
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
        title: "خوض 50 معركة",
        description: "اخض 50 معركة",
        metric: "total_fights",
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
        title: "خوض 100 معركة",
        description: "اخض 100 معركة",
        metric: "total_fights",
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
        title: "خوض 500 معركة",
        description: "اخض 500 معركة",
        metric: "total_fights",
        goal: 500,
        rewardMoney: 100000,
        rewardExp: 50000,
        rewardBlackcoins: 1000,
        progressPoints: 150,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "خوض 1000 معركة",
        description: "اخض 1000 معركة",
        metric: "total_fights",
        goal: 1000,
        rewardMoney: 200000,
        rewardExp: 100000,
        rewardBlackcoins: 2000,
        progressPoints: 250,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Gang Tasks
      {
        title: "الانضمام لأول عصابة",
        description: "انضم لأول عصابة",
        metric: "gang_joined",
        goal: 1,
        rewardMoney: 5000,
        rewardExp: 2500,
        rewardBlackcoins: 50,
        progressPoints: 25,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "إنشاء أول عصابة",
        description: "أنشئ أول عصابة",
        metric: "gang_created",
        goal: 1,
        rewardMoney: 10000,
        rewardExp: 5000,
        rewardBlackcoins: 100,
        progressPoints: 50,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "المساهمة بمبلغ 10000$ في العصابة",
        description: "ساهم بمبلغ 10000$ في العصابة",
        metric: "gang_money_contributed",
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
        title: "المساهمة بمبلغ 100000$ في العصابة",
        description: "ساهم بمبلغ 100000$ في العصابة",
        metric: "gang_money_contributed",
        goal: 100000,
        rewardMoney: 50000,
        rewardExp: 25000,
        rewardBlackcoins: 500,
        progressPoints: 100,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // === FUTURE TASKS (Placeholder for future features) ===

      // Ministry Missions (when implemented)
      {
        title: "إكمال أول مهمة وزارية",
        description: "أكمل أول مهمة وزارية",
        metric: "ministry_missions_completed",
        goal: 1,
        rewardMoney: 5000,
        rewardExp: 2500,
        rewardBlackcoins: 50,
        progressPoints: 25,
        isActive: false, // Disabled until feature is implemented
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "إكمال 10 مهام وزارية",
        description: "أكمل 10 مهام وزارية",
        metric: "ministry_missions_completed",
        goal: 10,
        rewardMoney: 25000,
        rewardExp: 12500,
        rewardBlackcoins: 250,
        progressPoints: 75,
        isActive: false, // Disabled until feature is implemented
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "إكمال 50 مهمة وزارية",
        description: "أكمل 50 مهمة وزارية",
        metric: "ministry_missions_completed",
        goal: 50,
        rewardMoney: 125000,
        rewardExp: 62500,
        rewardBlackcoins: 1250,
        progressPoints: 200,
        isActive: false, // Disabled until feature is implemented
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Jobs (when implemented)
      {
        title: "إكمال أول وظيفة",
        description: "أكمل أول وظيفة",
        metric: "jobs_completed",
        goal: 1,
        rewardMoney: 2000,
        rewardExp: 1000,
        rewardBlackcoins: 20,
        progressPoints: 15,
        isActive: false, // Disabled until feature is implemented
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "إكمال 10 وظائف",
        description: "أكمل 10 وظائف",
        metric: "jobs_completed",
        goal: 10,
        rewardMoney: 10000,
        rewardExp: 5000,
        rewardBlackcoins: 100,
        progressPoints: 40,
        isActive: false, // Disabled until feature is implemented
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "إكمال 50 وظيفة",
        description: "أكمل 50 وظيفة",
        metric: "jobs_completed",
        goal: 50,
        rewardMoney: 50000,
        rewardExp: 25000,
        rewardBlackcoins: 500,
        progressPoints: 100,
        isActive: false, // Disabled until feature is implemented
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Blackmarket (when implemented)
      {
        title: "شراء أول عنصر من السوق السوداء",
        description: "اشتر أول عنصر من السوق السوداء",
        metric: "blackmarket_items_bought",
        goal: 1,
        rewardMoney: 2000,
        rewardExp: 1000,
        rewardBlackcoins: 20,
        progressPoints: 15,
        isActive: false, // Disabled until feature is implemented
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "شراء 10 عناصر من السوق السوداء",
        description: "اشتر 10 عناصر من السوق السوداء",
        metric: "blackmarket_items_bought",
        goal: 10,
        rewardMoney: 10000,
        rewardExp: 5000,
        rewardBlackcoins: 100,
        progressPoints: 40,
        isActive: false, // Disabled until feature is implemented
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "بيع أول عنصر في السوق السوداء",
        description: "بع أول عنصر في السوق السوداء",
        metric: "blackmarket_items_sold",
        goal: 1,
        rewardMoney: 2000,
        rewardExp: 1000,
        rewardBlackcoins: 20,
        progressPoints: 15,
        isActive: false, // Disabled until feature is implemented
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "بيع 10 عناصر في السوق السوداء",
        description: "بع 10 عناصر في السوق السوداء",
        metric: "blackmarket_items_sold",
        goal: 10,
        rewardMoney: 10000,
        rewardExp: 5000,
        rewardBlackcoins: 100,
        progressPoints: 40,
        isActive: false, // Disabled until feature is implemented
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Houses (when implemented)
      {
        title: "امتلاك أول منزل",
        description: "امتلك أول منزل",
        metric: "houses_owned",
        goal: 1,
        rewardMoney: 10000,
        rewardExp: 5000,
        rewardBlackcoins: 100,
        progressPoints: 50,
        isActive: false, // Disabled until feature is implemented
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "امتلاك 5 منازل",
        description: "امتلك 5 منازل",
        metric: "houses_owned",
        goal: 5,
        rewardMoney: 50000,
        rewardExp: 25000,
        rewardBlackcoins: 500,
        progressPoints: 150,
        isActive: false, // Disabled until feature is implemented
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "امتلاك 10 منازل",
        description: "امتلك 10 منازل",
        metric: "houses_owned",
        goal: 10,
        rewardMoney: 100000,
        rewardExp: 50000,
        rewardBlackcoins: 1000,
        progressPoints: 250,
        isActive: false, // Disabled until feature is implemented
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Dogs (when implemented)
      {
        title: "امتلاك أول كلب",
        description: "امتلك أول كلب",
        metric: "dogs_owned",
        goal: 1,
        rewardMoney: 5000,
        rewardExp: 2500,
        rewardBlackcoins: 50,
        progressPoints: 25,
        isActive: false, // Disabled until feature is implemented
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "امتلاك 5 كلاب",
        description: "امتلك 5 كلاب",
        metric: "dogs_owned",
        goal: 5,
        rewardMoney: 25000,
        rewardExp: 12500,
        rewardBlackcoins: 250,
        progressPoints: 75,
        isActive: false, // Disabled until feature is implemented
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "امتلاك 10 كلاب",
        description: "امتلك 10 كلاب",
        metric: "dogs_owned",
        goal: 10,
        rewardMoney: 50000,
        rewardExp: 25000,
        rewardBlackcoins: 500,
        progressPoints: 150,
        isActive: false, // Disabled until feature is implemented
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Suggestions (when implemented)
      {
        title: "تقديم أول اقتراح",
        description: "قدم أول اقتراح",
        metric: "suggestions_submitted",
        goal: 1,
        rewardMoney: 1000,
        rewardExp: 500,
        rewardBlackcoins: 10,
        progressPoints: 10,
        isActive: false, // Disabled until feature is implemented
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "تقديم 10 اقتراحات",
        description: "قدم 10 اقتراحات",
        metric: "suggestions_submitted",
        goal: 10,
        rewardMoney: 5000,
        rewardExp: 2500,
        rewardBlackcoins: 50,
        progressPoints: 25,
        isActive: false, // Disabled until feature is implemented
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "تقديم 50 اقتراح",
        description: "قدم 50 اقتراح",
        metric: "suggestions_submitted",
        goal: 50,
        rewardMoney: 25000,
        rewardExp: 12500,
        rewardBlackcoins: 250,
        progressPoints: 75,
        isActive: false, // Disabled until feature is implemented
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Money Withdrawn (when implemented)
      {
        title: "سحب أول 5000$ من البنك",
        description: "اسحب أول 5000$ من البنك",
        metric: "money_withdrawn",
        goal: 5000,
        rewardMoney: 2000,
        rewardExp: 1000,
        rewardBlackcoins: 20,
        progressPoints: 15,
        isActive: false, // Disabled until feature is implemented
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "سحب أول 25000$ من البنك",
        description: "اسحب أول 25000$ من البنك",
        metric: "money_withdrawn",
        goal: 25000,
        rewardMoney: 10000,
        rewardExp: 5000,
        rewardBlackcoins: 100,
        progressPoints: 40,
        isActive: false, // Disabled until feature is implemented
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "سحب أول 100000$ من البنك",
        description: "اسحب أول 100000$ من البنك",
        metric: "money_withdrawn",
        goal: 100000,
        rewardMoney: 50000,
        rewardExp: 25000,
        rewardBlackcoins: 500,
        progressPoints: 100,
        isActive: false, // Disabled until feature is implemented
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Damage Dealt (when implemented)
      {
        title: "إلحاق 10000 ضرر",
        description: "ألحق 10000 ضرر",
        metric: "damage_dealt",
        goal: 10000,
        rewardMoney: 5000,
        rewardExp: 2500,
        rewardBlackcoins: 50,
        progressPoints: 25,
        isActive: false, // Disabled until feature is implemented
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "إلحاق 50000 ضرر",
        description: "ألحق 50000 ضرر",
        metric: "damage_dealt",
        goal: 50000,
        rewardMoney: 25000,
        rewardExp: 12500,
        rewardBlackcoins: 250,
        progressPoints: 75,
        isActive: false, // Disabled until feature is implemented
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "إلحاق 100000 ضرر",
        description: "ألحق 100000 ضرر",
        metric: "damage_dealt",
        goal: 100000,
        rewardMoney: 50000,
        rewardExp: 25000,
        rewardBlackcoins: 500,
        progressPoints: 150,
        isActive: false, // Disabled until feature is implemented
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Tasks', specialTasksData, {});
  },

  async down(queryInterface, Sequelize) {
    // Remove only the special and future tasks by their titles
    const specialTaskTitles = [
      // Special Tasks
      "اللعب لمدة 7 أيام", "اللعب لمدة 30 يوم", "اللعب لمدة 100 يوم", "اللعب لمدة 365 يوم",
      "قتل أول لاعب", "قتل 10 لاعبين", "قتل 50 لاعب", "قتل 100 لاعب", "قتل 500 لاعب", "قتل 1000 لاعب",
      "خوض أول 10 معارك", "خوض 50 معركة", "خوض 100 معركة", "خوض 500 معركة", "خوض 1000 معركة",
      "الانضمام لأول عصابة", "إنشاء أول عصابة", "المساهمة بمبلغ 10000$ في العصابة", "المساهمة بمبلغ 100000$ في العصابة",
      // Future Tasks
      "إكمال أول مهمة وزارية", "إكمال 10 مهام وزارية", "إكمال 50 مهمة وزارية",
      "إكمال أول وظيفة", "إكمال 10 وظائف", "إكمال 50 وظيفة",
      "شراء أول عنصر من السوق السوداء", "شراء 10 عناصر من السوق السوداء", "بيع أول عنصر في السوق السوداء", "بيع 10 عناصر في السوق السوداء",
      "امتلاك أول منزل", "امتلاك 5 منازل", "امتلاك 10 منازل",
      "امتلاك أول كلب", "امتلاك 5 كلاب", "امتلاك 10 كلاب",
      "تقديم أول اقتراح", "تقديم 10 اقتراحات", "تقديم 50 اقتراح",
      "سحب أول 5000$ من البنك", "سحب أول 25000$ من البنك", "سحب أول 100000$ من البنك",
      "إلحاق 10000 ضرر", "إلحاق 50000 ضرر", "إلحاق 100000 ضرر"
    ];
    
    await queryInterface.bulkDelete('Tasks', {
      title: specialTaskTitles
    }, {});
  }
}; 