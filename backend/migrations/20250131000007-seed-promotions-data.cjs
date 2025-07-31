'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const promotionsData = [
      // === BEGINNER RANKS (Ranks 1-3) ===

      // Rank 1 - New Recruit
      {
        title: "مبتدئ",
        titleEn: "Beginner",
        rank: 1,
        requiredPoints: 0,
        powerBonus: 0,
        defenseBonus: 0,
        description: "مبتدئ في عالم القتلة. بداية رحلتك في عالم الجريمة والقتل.",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Rank 2 - Street Thug
      {
        title: "عضو الشارع",
        titleEn: "Street Thug",
        rank: 2,
        requiredPoints: 50,
        powerBonus: 5,
        defenseBonus: 3,
        description: "عضو الشارع. تعلمت أساسيات البقاء في عالم الجريمة.",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Rank 3 - Gang Member
      {
        title: "عضو العصابة",
        titleEn: "Gang Member",
        rank: 3,
        requiredPoints: 150,
        powerBonus: 10,
        defenseBonus: 8,
        description: "عضو العصابة. انضمت لعصابة وبدأت تتعلم العمل الجماعي.",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // === INTERMEDIATE RANKS (Ranks 4-6) ===

      // Rank 4 - Hitman
      {
        title: "قاتل محترف",
        titleEn: "Hitman",
        rank: 4,
        requiredPoints: 350,
        powerBonus: 20,
        defenseBonus: 15,
        description: "قاتل محترف. أصبحت قاتلاً محترفاً ومطلوباً في السوق السوداء.",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Rank 5 - Crime Boss
      {
        title: "زعيم الجريمة",
        titleEn: "Crime Boss",
        rank: 5,
        requiredPoints: 700,
        powerBonus: 35,
        defenseBonus: 25,
        description: "زعيم الجريمة. أصبحت زعيماً للجريمة في منطقتك.",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Rank 6 - Syndicate Leader
      {
        title: "قائد العصبة",
        titleEn: "Syndicate Leader",
        rank: 6,
        requiredPoints: 1200,
        powerBonus: 50,
        defenseBonus: 40,
        description: "قائد العصبة. أصبحت قائداً لعصبة كاملة من المجرمين.",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // === ADVANCED RANKS (Ranks 7-8) ===

      // Rank 7 - Crime Lord
      {
        title: "إمبراطور الجريمة",
        titleEn: "Crime Lord",
        rank: 7,
        requiredPoints: 2000,
        powerBonus: 75,
        defenseBonus: 60,
        description: "إمبراطور الجريمة. أصبحت إمبراطوراً للجريمة في المدينة.",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Rank 8 - Master Assassin
      {
        title: "القاتل الماجستير",
        titleEn: "Master Assassin",
        rank: 8,
        requiredPoints: 3500,
        powerBonus: 100,
        defenseBonus: 80,
        description: "القاتل الماجستير. أصبحت قاتلاً ماجستيراً ومخيفاً في جميع أنحاء المدينة.",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // === EXPERT RANKS (Ranks 9-10) ===

      // Rank 9 - Shadow King
      {
        title: "ملك الظلال",
        titleEn: "Shadow King",
        rank: 9,
        requiredPoints: 6000,
        powerBonus: 150,
        defenseBonus: 120,
        description: "ملك الظلال. أصبحت ملك الظلال وحاكماً للعالم السفلي.",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Rank 10 - Blood Contract Legend
      {
        title: "أسطورة عقد الدم",
        titleEn: "Blood Contract Legend",
        rank: 10,
        requiredPoints: 10000,
        powerBonus: 200,
        defenseBonus: 150,
        description: "أسطورة عقد الدم. أصبحت أسطورة في عالم القتلة والجريمة. لا أحد يجرؤ على تحديك.",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // === SPECIAL RANKS (Optional for future expansion) ===

      // Rank 11 - Phantom Emperor (Future expansion)
      {
        title: "إمبراطور الشبح",
        titleEn: "Phantom Emperor",
        rank: 11,
        requiredPoints: 20000,
        powerBonus: 300,
        defenseBonus: 250,
        description: "إمبراطور الشبح. أصبحت إمبراطوراً للشبح وحاكماً للعالم السفلي بأكمله.",
        isActive: false, // Disabled for future expansion
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Rank 12 - Blood God (Future expansion)
      {
        title: "إله الدم",
        titleEn: "Blood God",
        rank: 12,
        requiredPoints: 50000,
        powerBonus: 500,
        defenseBonus: 400,
        description: "إله الدم. أصبحت إلهاً للدم وحاكماً مطلقاً للعالم السفلي.",
        isActive: false, // Disabled for future expansion
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Promotions', promotionsData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Promotions', null, {});
  }
}; 