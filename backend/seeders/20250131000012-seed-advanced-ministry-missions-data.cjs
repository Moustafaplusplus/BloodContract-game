'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const missionsData = [
      {
        missionId: "mission_advanced_double_agent",
        title: "العميل المزدوج المتقدم",
        description: "مهمة خطيرة تتطلب التعامل مع عميل مزدوج محترف في قلب العدو",
        minLevel: 30,
        order: 11,
        isActive: true,
        missionData: JSON.stringify({
          pages: {
            start: {
              text: "أنت في مكتب الوزارة، أمامك ملف سري يحمل اسم \"العميل المزدوج المتقدم\". الوزير ينظر إليك بجدية ويقول: \"لدينا عميل مزدوج محترف في صفوف العدو، لكننا لا نعرف من هو. مهمتك هي كشفه قبل أن يكشف هو هويتك.\"",
              image: "advanced_office_ministry"
            },
            page_1: {
              text: "تبدأ بالتحقيق في الملفات المتقدمة. تجد أن العميل المزدوج يتواصل مع العدو عبر رسائل مشفرة معقدة. لديك خياران: تتبع الرسائل أم تضع فخاً متقدماً للعميل؟",
              image: "advanced_archive_room"
            },
            page_2: {
              text: "تقرر وضع فخ متقدم للعميل. تضع معلومات مزيفة متطورة في الملفات وتنتظر. لكن هل هذا آمن أم خطير جداً؟",
              image: "advanced_trap_setting"
            },
            page_3: {
              text: "العميل المزدوج يقع في الفخ! لكنه مسلح ومحترف وخطير. عليك مواجهته مباشرة أم محاولة القبض عليه بهدوء؟",
              image: "advanced_confrontation"
            },
            page_4: {
              text: "العميل المزدوج يهرب! عليك مطاردته أم محاولة كشف هويته الحقيقية من الملفات المتقدمة المتبقية؟",
              image: "advanced_chase_scene"
            },
            page_5: {
              text: "العميل المزدوج يهرب! عليك مطاردته أم محاولة كشف هويته الحقيقية من الملفات المتقدمة المتبقية؟",
              image: "advanced_chase_scene"
            },
            page_6: {
              text: "العميل المزدوج يهرب! عليك مطاردته أم محاولة كشف هويته الحقيقية من الملفات المتقدمة المتبقية؟",
              image: "advanced_chase_scene"
            }
          },
          endings: {
            ending_reject: "رفضت المهمة خوفاً من الخطر المتقدم",
            ending_combat: "واجهت العميل المزدوج المتقدم وانتصرت عليه",
            ending_stealth: "قبضت على العميل المزدوج بهدوء دون إراقة دماء",
            ending_reveal: "كشفت هوية العميل المزدوج من الملفات المتقدمة",
            ending_deception: "خدعت العميل المزدوج المتقدم وأجبرته على الاعتراف"
          }
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        missionId: "mission_advanced_encrypted_message",
        title: "الرسالة المشفرة المتقدمة",
        description: "مهمة فك تشفير رسالة سرية متقدمة قد تحمل معلومات خطيرة جداً",
        minLevel: 32,
        order: 12,
        isActive: true,
        missionData: JSON.stringify({
          pages: {
            start: {
              text: "في غرفة العمليات السرية المتقدمة، أمامك رسالة مشفرة معقدة جداً. الوزير يقول: \"هذه الرسالة قد تحمل خطط العدو القادمة المتقدمة. عليك فك تشفيرها قبل فوات الأوان.\"",
              image: "advanced_operations_room"
            },
            page_1: {
              text: "تبدأ بتحليل التشفير المتقدم. يبدو أنه نظام معقد جداً. هل تستخدم الحاسوب المتطور أم تعتمد على خبرتك اليدوية المتقدمة؟",
              image: "advanced_computer_analysis"
            },
            page_2: {
              text: "تقرر استخدام الحاسوب المتطور المتقدم. لكن هل تثق في التكنولوجيا المتقدمة أم تحافظ على السرية؟",
              image: "advanced_computer"
            },
            page_3: {
              text: "الحاسوب المتطور يكشف جزءاً من الرسالة! يبدو أنها تتحدث عن هجوم قادم متقدم. هل تتابع فك التشفير أم تحذر القيادة فوراً؟",
              image: "advanced_decoded_message"
            },
            page_4: {
              text: "الحاسوب المتطور يكشف جزءاً من الرسالة! يبدو أنها تتحدث عن هجوم قادم متقدم. هل تتابع فك التشفير أم تحذر القيادة فوراً؟",
              image: "advanced_decoded_message"
            },
            page_5: {
              text: "الحاسوب المتطور يكشف جزءاً من الرسالة! يبدو أنها تتحدث عن هجوم قادم متقدم. هل تتابع فك التشفير أم تحذر القيادة فوراً؟",
              image: "advanced_decoded_message"
            },
            page_6: {
              text: "الحاسوب المتطور يكشف جزءاً من الرسالة! يبدو أنها تتحدث عن هجوم قادم متقدم. هل تتابع فك التشفير أم تحذر القيادة فوراً؟",
              image: "advanced_decoded_message"
            }
          },
          endings: {
            ending_reject: "رفضت المهمة لصعوبتها المتقدمة",
            ending_combat: "واجهت العدو المتقدم الذي حاول منعك من فك التشفير",
            ending_stealth: "فككت التشفير المتقدم بهدوء دون أن يعلم العدو",
            ending_reveal: "كشفت الرسالة المتقدمة كاملة وحذرت القيادة",
            ending_deception: "خدعت العدو المتقدم وأجبرته على فك التشفير بنفسه"
          }
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        missionId: "mission_advanced_missing_agent",
        title: "العميل المفقود المتقدم",
        description: "مهمة إنقاذ عميل مفقود محترف في أرض العدو المتقدمة",
        minLevel: 35,
        order: 13,
        isActive: true,
        missionData: JSON.stringify({
          pages: {
            start: {
              text: "في غرفة العمليات المتقدمة، تقرأ تقريراً عن عميل مفقود محترف في أرض العدو المتقدمة. الوزير يقول: \"هذا العميل يحمل معلومات حساسة جداً. عليك إنقاذه قبل أن يقع في أيدي العدو المتقدم.\"",
              image: "advanced_operations_room_map"
            },
            page_1: {
              text: "تصل إلى المنطقة المستهدفة المتقدمة. هل تدخل مباشرة أم تدرس المنطقة أولاً؟",
              image: "advanced_enemy_territory"
            },
            page_2: {
              text: "تقرر دراسة المنطقة أولاً. تكتشف أن العدو المتقدم يراقب المكان. هل تنتظر أم تخاطر بالدخول؟",
              image: "advanced_surveillance"
            },
            page_3: {
              text: "تجد العميل المفقود المحترف! لكنه محاط بالعدو المتقدم. هل تهاجم مباشرة أم تحاول إنقاذه بهدوء؟",
              image: "advanced_surrounded_agent"
            },
            page_4: {
              text: "تجد العميل المفقود المحترف! لكنه محاط بالعدو المتقدم. هل تهاجم مباشرة أم تحاول إنقاذه بهدوء؟",
              image: "advanced_surrounded_agent"
            },
            page_5: {
              text: "تجد العميل المفقود المحترف! لكنه محاط بالعدو المتقدم. هل تهاجم مباشرة أم تحاول إنقاذه بهدوء؟",
              image: "advanced_surrounded_agent"
            },
            page_6: {
              text: "تجد العميل المفقود المحترف! لكنه محاط بالعدو المتقدم. هل تهاجم مباشرة أم تحاول إنقاذه بهدوء؟",
              image: "advanced_surrounded_agent"
            }
          },
          endings: {
            ending_reject: "رفضت المهمة لخطورتها المتقدمة",
            ending_combat: "هاجمت العدو المتقدم وأنقذت العميل المحترف",
            ending_stealth: "أنقذت العميل المحترف بهدوء دون قتال",
            ending_reveal: "كشفت خطة العدو المتقدم وأنقذت العميل",
            ending_deception: "خدعت العدو المتقدم وأجبرته على إطلاق سراح العميل"
          }
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        missionId: "mission_advanced_stolen_documents",
        title: "الوثائق المسروقة المتقدمة",
        description: "مهمة استعادة وثائق سرية متقدمة مسروقة من الوزارة",
        minLevel: 38,
        order: 14,
        isActive: true,
        missionData: JSON.stringify({
          pages: {
            start: {
              text: "في مكتب الوزير المتقدم، يخبرك أن وثائق سرية متقدمة مهمة سُرقت من الوزارة. \"هذه الوثائق تحتوي على أسرار الدولة المتقدمة. عليك استعادتها بأي ثمن.\"",
              image: "advanced_minister_office"
            },
            page_1: {
              text: "تبدأ بالتحقيق في السرق المتقدم. تكتشف أن اللص محترف متقدم. هل تتبع آثاره أم تضع فخاً متطوراً له؟",
              image: "advanced_archive_room_open"
            },
            page_2: {
              text: "تقرر وضع فخ متطور للص المتقدم. لكن هل هذا آمن أم خطير جداً؟",
              image: "advanced_trap_setting"
            },
            page_3: {
              text: "الص المتقدم يقع في الفخ! لكنه مسلح ومحترف وخطير جداً. هل تهاجمه أم تحاول التفاوض معه؟",
              image: "advanced_thief_confrontation"
            },
            page_4: {
              text: "الص المتقدم يقع في الفخ! لكنه مسلح ومحترف وخطير جداً. هل تهاجمه أم تحاول التفاوض معه؟",
              image: "advanced_thief_confrontation"
            },
            page_5: {
              text: "الص المتقدم يقع في الفخ! لكنه مسلح ومحترف وخطير جداً. هل تهاجمه أم تحاول التفاوض معه؟",
              image: "advanced_thief_confrontation"
            },
            page_6: {
              text: "الص المتقدم يقع في الفخ! لكنه مسلح ومحترف وخطير جداً. هل تهاجمه أم تحاول التفاوض معه؟",
              image: "advanced_thief_confrontation"
            }
          },
          endings: {
            ending_reject: "رفضت المهمة لخطورتها المتقدمة",
            ending_combat: "هاجمت الص المتقدم واستعدت الوثائق المتطورة",
            ending_stealth: "استعدت الوثائق المتطورة بهدوء دون قتال",
            ending_reveal: "كشفت هوية الص المتقدم واستعدت الوثائق",
            ending_deception: "خدعت الص المتقدم وأجبرته على إعادة الوثائق"
          }
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        missionId: "mission_advanced_traitor_agent",
        title: "العميل الخائن المتقدم",
        description: "مهمة كشف عميل خائن محترف في صفوف الوزارة المتقدمة",
        minLevel: 40,
        order: 15,
        isActive: true,
        missionData: JSON.stringify({
          pages: {
            start: {
              text: "في غرفة العمليات السرية المتقدمة، الوزير ينظر إليك بجدية. \"لدينا عميل خائن محترف في صفوفنا. يبيع أسرار الدولة المتقدمة للعدو. عليك كشفه قبل أن يهرب.\"",
              image: "advanced_secret_operations_room"
            },
            page_1: {
              text: "تبدأ بالتحقيق في الملفات المتقدمة. تجد أن الخائن المحترف يتواصل مع العدو سراً. هل تتابع الأدلة أم تضع فخاً متطوراً له؟",
              image: "advanced_secret_files"
            },
            page_2: {
              text: "تقرر وضع فخ متطور للخائن المحترف. تضع معلومات مزيفة متطورة وتنتظر. لكن هل هذا آمن؟",
              image: "advanced_fake_trap"
            },
            page_3: {
              text: "الخائن المحترف يقع في الفخ! لكنه محترف وخطير جداً. هل تهاجمه مباشرة أم تحاول القبض عليه بهدوء؟",
              image: "advanced_traitor_confrontation"
            },
            page_4: {
              text: "الخائن المحترف يقع في الفخ! لكنه محترف وخطير جداً. هل تهاجمه مباشرة أم تحاول القبض عليه بهدوء؟",
              image: "advanced_traitor_confrontation"
            },
            page_5: {
              text: "الخائن المحترف يقع في الفخ! لكنه محترف وخطير جداً. هل تهاجمه مباشرة أم تحاول القبض عليه بهدوء؟",
              image: "advanced_traitor_confrontation"
            },
            page_6: {
              text: "الخائن المحترف يقع في الفخ! لكنه محترف وخطير جداً. هل تهاجمه مباشرة أم تحاول القبض عليه بهدوء؟",
              image: "advanced_traitor_confrontation"
            }
          },
          endings: {
            ending_reject: "رفضت المهمة لخطورتها المتقدمة",
            ending_combat: "هاجمت الخائن المحترف وانتصرت عليه",
            ending_stealth: "قبضت على الخائن المحترف بهدوء",
            ending_reveal: "كشفت هوية الخائن المحترف من الأدلة المتقدمة",
            ending_deception: "خدعت الخائن المحترف وأجبرته على الاعتراف"
          }
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        missionId: "mission_advanced_secret_message",
        title: "الرسالة السرية المتقدمة",
        description: "مهمة توصيل رسالة سرية متقدمة إلى عميل في أرض العدو المتقدمة",
        minLevel: 42,
        order: 16,
        isActive: true,
        missionData: JSON.stringify({
          pages: {
            start: {
              text: "في مكتب الوزير المتقدم، أمامك رسالة سرية متقدمة مختومة. الوزير يقول: \"هذه الرسالة تحتوي على معلومات حساسة جداً. عليك توصيلها إلى عميلنا في أرض العدو المتقدمة بأي ثمن.\"",
              image: "advanced_sealed_message"
            },
            page_1: {
              text: "تصل إلى منطقة العدو المتقدمة. هل تدخل مباشرة أم تدرس المنطقة أولاً؟",
              image: "advanced_enemy_zone"
            },
            page_2: {
              text: "تقرر دراسة المنطقة أولاً. تكتشف أن العدو المتقدم يراقب المكان. هل تنتظر أم تخاطر بالدخول؟",
              image: "advanced_enemy_surveillance"
            },
            page_3: {
              text: "تجد العميل المتقدم! لكنه محاط بالعدو المتقدم. هل تهاجم أم تحاول الوصول إليه بهدوء؟",
              image: "advanced_surrounded_agent"
            },
            page_4: {
              text: "تجد العميل المتقدم! لكنه محاط بالعدو المتقدم. هل تهاجم أم تحاول الوصول إليه بهدوء؟",
              image: "advanced_surrounded_agent"
            },
            page_5: {
              text: "تجد العميل المتقدم! لكنه محاط بالعدو المتقدم. هل تهاجم أم تحاول الوصول إليه بهدوء؟",
              image: "advanced_surrounded_agent"
            },
            page_6: {
              text: "تجد العميل المتقدم! لكنه محاط بالعدو المتقدم. هل تهاجم أم تحاول الوصول إليه بهدوء؟",
              image: "advanced_surrounded_agent"
            }
          },
          endings: {
            ending_reject: "رفضت المهمة لخطورتها المتقدمة",
            ending_combat: "هاجمت العدو المتقدم وسلمت الرسالة المتطورة",
            ending_stealth: "سلمت الرسالة المتطورة بهدوء دون قتال",
            ending_reveal: "كشفت خطة العدو المتقدم وسلمت الرسالة",
            ending_deception: "خدعت العدو المتقدم وسلمت الرسالة"
          }
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        missionId: "mission_elite_lost_agent",
        title: "العميل المفقود النخبة",
        description: "مهمة إنقاذ عميل مفقود من النخبة في منطقة خطرة جداً",
        minLevel: 45,
        order: 17,
        isActive: true,
        missionData: JSON.stringify({
          pages: {
            start: {
              text: "في غرفة العمليات النخبة، تقرأ تقريراً عن عميل مفقود من النخبة في منطقة خطرة جداً. الوزير يقول: \"هذا العميل يحمل معلومات حساسة جداً. عليك إنقاذه قبل أن يقع في أيدي العدو النخبة.\"",
              image: "elite_operations_room_map"
            },
            page_1: {
              text: "تصل إلى المنطقة الخطرة النخبة. هل تدخل مباشرة أم تدرس المنطقة أولاً؟",
              image: "elite_dangerous_territory"
            },
            page_2: {
              text: "تقرر دراسة المنطقة أولاً. تكتشف أن العدو النخبة يراقب المكان. هل تنتظر أم تخاطر بالدخول؟",
              image: "elite_surveillance"
            },
            page_3: {
              text: "تجد العميل المفقود النخبة! لكنه محاط بالعدو النخبة. هل تهاجم مباشرة أم تحاول إنقاذه بهدوء؟",
              image: "elite_surrounded_agent"
            },
            page_4: {
              text: "تجد العميل المفقود النخبة! لكنه محاط بالعدو النخبة. هل تهاجم مباشرة أم تحاول إنقاذه بهدوء؟",
              image: "elite_surrounded_agent"
            },
            page_5: {
              text: "تجد العميل المفقود النخبة! لكنه محاط بالعدو النخبة. هل تهاجم مباشرة أم تحاول إنقاذه بهدوء؟",
              image: "elite_surrounded_agent"
            },
            page_6: {
              text: "تجد العميل المفقود النخبة! لكنه محاط بالعدو النخبة. هل تهاجم مباشرة أم تحاول إنقاذه بهدوء؟",
              image: "elite_surrounded_agent"
            }
          },
          endings: {
            ending_reject: "رفضت المهمة لخطورتها النخبة",
            ending_combat: "هاجمت العدو النخبة وأنقذت العميل النخبة",
            ending_stealth: "أنقذت العميل النخبة بهدوء دون قتال",
            ending_reveal: "كشفت خطة العدو النخبة وأنقذت العميل",
            ending_deception: "خدعت العدو النخبة وأنقذت العميل"
          }
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        missionId: "mission_elite_stolen_docs",
        title: "الوثائق المسروقة النخبة",
        description: "مهمة استعادة وثائق سرية نخبة مسروقة من الوزارة",
        minLevel: 48,
        order: 18,
        isActive: true,
        missionData: JSON.stringify({
          pages: {
            start: {
              text: "في مكتب الوزير النخبة، يخبرك أن وثائق سرية نخبة مهمة سُرقت من الوزارة. \"هذه الوثائق تحتوي على أسرار الدولة النخبة. عليك استعادتها بأي ثمن.\"",
              image: "elite_minister_office"
            },
            page_1: {
              text: "تبدأ بالتحقيق في السرق النخبة. تكتشف أن اللص محترف نخبة. هل تتبع آثاره أم تضع فخاً نخبة له؟",
              image: "elite_archive_room_open"
            },
            page_2: {
              text: "تقرر وضع فخ نخبة للص النخبة. لكن هل هذا آمن أم خطير جداً؟",
              image: "elite_trap_setting"
            },
            page_3: {
              text: "الص النخبة يقع في الفخ! لكنه مسلح ومحترف وخطير جداً. هل تهاجمه أم تحاول التفاوض معه؟",
              image: "elite_thief_confrontation"
            },
            page_4: {
              text: "الص النخبة يقع في الفخ! لكنه مسلح ومحترف وخطير جداً. هل تهاجمه أم تحاول التفاوض معه؟",
              image: "elite_thief_confrontation"
            },
            page_5: {
              text: "الص النخبة يقع في الفخ! لكنه مسلح ومحترف وخطير جداً. هل تهاجمه أم تحاول التفاوض معه؟",
              image: "elite_thief_confrontation"
            },
            page_6: {
              text: "الص النخبة يقع في الفخ! لكنه مسلح ومحترف وخطير جداً. هل تهاجمه أم تحاول التفاوض معه؟",
              image: "elite_thief_confrontation"
            }
          },
          endings: {
            ending_reject: "رفضت المهمة لخطورتها النخبة",
            ending_combat: "هاجمت الص النخبة واستعدت الوثائق النخبة",
            ending_stealth: "استعدت الوثائق النخبة بهدوء دون قتال",
            ending_reveal: "كشفت هوية الص النخبة واستعدت الوثائق",
            ending_deception: "خدعت الص النخبة وأجبرته على إعادة الوثائق"
          }
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        missionId: "mission_elite_traitor",
        title: "العميل الخائن النخبة",
        description: "مهمة كشف عميل خائن نخبة في صفوف الوزارة",
        minLevel: 50,
        order: 19,
        isActive: true,
        missionData: JSON.stringify({
          pages: {
            start: {
              text: "في غرفة العمليات السرية النخبة، الوزير ينظر إليك بجدية. \"لدينا عميل خائن نخبة في صفوفنا. يبيع أسرار الدولة النخبة للعدو. عليك كشفه قبل أن يهرب.\"",
              image: "elite_secret_operations_room"
            },
            page_1: {
              text: "تبدأ بالتحقيق في الملفات النخبة. تجد أن الخائن النخبة يتواصل مع العدو سراً. هل تتابع الأدلة أم تضع فخاً نخبة له؟",
              image: "elite_secret_files"
            },
            page_2: {
              text: "تقرر وضع فخ نخبة للخائن النخبة. تضع معلومات مزيفة نخبة وتنتظر. لكن هل هذا آمن؟",
              image: "elite_fake_trap"
            },
            page_3: {
              text: "الخائن النخبة يقع في الفخ! لكنه محترف وخطير جداً. هل تهاجمه مباشرة أم تحاول القبض عليه بهدوء؟",
              image: "elite_traitor_confrontation"
            },
            page_4: {
              text: "الخائن النخبة يقع في الفخ! لكنه محترف وخطير جداً. هل تهاجمه مباشرة أم تحاول القبض عليه بهدوء؟",
              image: "elite_traitor_confrontation"
            },
            page_5: {
              text: "الخائن النخبة يقع في الفخ! لكنه محترف وخطير جداً. هل تهاجمه مباشرة أم تحاول القبض عليه بهدوء؟",
              image: "elite_traitor_confrontation"
            },
            page_6: {
              text: "الخائن النخبة يقع في الفخ! لكنه محترف وخطير جداً. هل تهاجمه مباشرة أم تحاول القبض عليه بهدوء؟",
              image: "elite_traitor_confrontation"
            }
          },
          endings: {
            ending_reject: "رفضت المهمة لخطورتها النخبة",
            ending_combat: "هاجمت الخائن النخبة وانتصرت عليه",
            ending_stealth: "قبضت على الخائن النخبة بهدوء",
            ending_reveal: "كشفت هوية الخائن النخبة من الأدلة النخبة",
            ending_deception: "خدعت الخائن النخبة وأجبرته على الاعتراف"
          }
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        missionId: "mission_elite_secret_msg",
        title: "الرسالة السرية النخبة",
        description: "مهمة توصيل رسالة سرية نخبة إلى عميل في أرض العدو النخبة",
        minLevel: 55,
        order: 20,
        isActive: true,
        missionData: JSON.stringify({
          pages: {
            start: {
              text: "في مكتب الوزير النخبة، أمامك رسالة سرية نخبة مختومة. الوزير يقول: \"هذه الرسالة تحتوي على معلومات حساسة جداً. عليك توصيلها إلى عميلنا في أرض العدو النخبة بأي ثمن.\"",
              image: "elite_sealed_message"
            },
            page_1: {
              text: "تصل إلى منطقة العدو النخبة. هل تدخل مباشرة أم تدرس المنطقة أولاً؟",
              image: "elite_enemy_zone"
            },
            page_2: {
              text: "تقرر دراسة المنطقة أولاً. تكتشف أن العدو النخبة يراقب المكان. هل تنتظر أم تخاطر بالدخول؟",
              image: "elite_enemy_surveillance"
            },
            page_3: {
              text: "تجد العميل النخبة! لكنه محاط بالعدو النخبة. هل تهاجم أم تحاول الوصول إليه بهدوء؟",
              image: "elite_surrounded_agent"
            },
            page_4: {
              text: "تجد العميل النخبة! لكنه محاط بالعدو النخبة. هل تهاجم أم تحاول الوصول إليه بهدوء؟",
              image: "elite_surrounded_agent"
            },
            page_5: {
              text: "تجد العميل النخبة! لكنه محاط بالعدو النخبة. هل تهاجم أم تحاول الوصول إليه بهدوء؟",
              image: "elite_surrounded_agent"
            },
            page_6: {
              text: "تجد العميل النخبة! لكنه محاط بالعدو النخبة. هل تهاجم أم تحاول الوصول إليه بهدوء؟",
              image: "elite_surrounded_agent"
            }
          },
          endings: {
            ending_reject: "رفضت المهمة لخطورتها النخبة",
            ending_combat: "هاجمت العدو النخبة وسلمت الرسالة النخبة",
            ending_stealth: "سلمت الرسالة النخبة بهدوء دون قتال",
            ending_reveal: "كشفت خطة العدو النخبة وسلمت الرسالة",
            ending_deception: "خدعت العدو النخبة وسلمت الرسالة"
          }
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('ministry_missions', missionsData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ministry_missions', null, {});
  }
}; 