'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const missionsData = [
      {
        missionId: "mission_double_agent",
        title: "العميل المزدوج",
        description: "مهمة خطيرة تتطلب التعامل مع عميل مزدوج في قلب العدو",
        minLevel: 5,
        order: 1,
        isActive: true,
        missionData: JSON.stringify({
          pages: {
            start: {
              text: "أنت في مكتب الوزارة، أمامك ملف سري يحمل اسم \"العميل المزدوج\". الوزير ينظر إليك بجدية ويقول: \"لدينا عميل مزدوج في صفوف العدو، لكننا لا نعرف من هو. مهمتك هي كشفه قبل أن يكشف هو هويتك.\"",
              image: "office_ministry"
            },
            page_1: {
              text: "تبدأ بالتحقيق في الملفات. تجد أن العميل المزدوج يتواصل مع العدو عبر رسائل مشفرة. لديك خياران: تتبع الرسائل أم تضع فخاً للعميل؟",
              image: "archive_room"
            },
            page_2: {
              text: "تقرر وضع فخ للعميل. تضع معلومات مزيفة في الملفات وتنتظر. لكن هل هذا آمن أم خطير جداً؟",
              image: "trap_setting"
            },
            page_3: {
              text: "العميل المزدوج يقع في الفخ! لكنه مسلح وخطير. عليك مواجهته مباشرة أم محاولة القبض عليه بهدوء؟",
              image: "confrontation"
            },
            page_4: {
              text: "العميل المزدوج يهرب! عليك مطاردته أم محاولة كشف هويته الحقيقية من الملفات المتبقية؟",
              image: "chase_scene"
            },
            page_5: {
              text: "العميل المزدوج يهرب! عليك مطاردته أم محاولة كشف هويته الحقيقية من الملفات المتبقية؟",
              image: "chase_scene"
            },
            page_6: {
              text: "العميل المزدوج يهرب! عليك مطاردته أم محاولة كشف هويته الحقيقية من الملفات المتبقية؟",
              image: "chase_scene"
            }
          },
          endings: {
            ending_reject: "رفضت المهمة خوفاً من الخطر",
            ending_combat: "واجهت العميل المزدوج وانتصرت عليه",
            ending_stealth: "قبضت على العميل بهدوء دون إراقة دماء",
            ending_reveal: "كشفت هوية العميل المزدوج من الملفات",
            ending_deception: "خدعت العميل المزدوج وأجبرته على الاعتراف"
          }
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        missionId: "mission_encrypted_message",
        title: "الرسالة المشفرة",
        description: "مهمة فك تشفير رسالة سرية قد تحمل معلومات خطيرة",
        minLevel: 8,
        order: 2,
        isActive: true,
        missionData: JSON.stringify({
          pages: {
            start: {
              text: "في غرفة العمليات السرية، أمامك رسالة مشفرة معقدة. الوزير يقول: \"هذه الرسالة قد تحمل خطط العدو القادمة. عليك فك تشفيرها قبل فوات الأوان.\"",
              image: "operations_room"
            },
            page_1: {
              text: "تبدأ بتحليل التشفير. يبدو أنه نظام معقد. هل تستخدم الحاسوب أم تعتمد على خبرتك اليدوية؟",
              image: "computer_analysis"
            },
            page_2: {
              text: "تقرر استخدام الحاسوب المتقدم. لكن هل تثق في التكنولوجيا أم تحافظ على السرية؟",
              image: "advanced_computer"
            },
            page_3: {
              text: "الحاسوب يكشف جزءاً من الرسالة! يبدو أنها تتحدث عن هجوم قادم. هل تتابع فك التشفير أم تحذر القيادة فوراً؟",
              image: "decoded_message"
            },
            page_4: {
              text: "الحاسوب يكشف جزءاً من الرسالة! يبدو أنها تتحدث عن هجوم قادم. هل تتابع فك التشفير أم تحذر القيادة فوراً؟",
              image: "decoded_message"
            },
            page_5: {
              text: "الحاسوب يكشف جزءاً من الرسالة! يبدو أنها تتحدث عن هجوم قادم. هل تتابع فك التشفير أم تحذر القيادة فوراً؟",
              image: "decoded_message"
            },
            page_6: {
              text: "الحاسوب يكشف جزءاً من الرسالة! يبدو أنها تتحدث عن هجوم قادم. هل تتابع فك التشفير أم تحذر القيادة فوراً؟",
              image: "decoded_message"
            }
          },
          endings: {
            ending_reject: "رفضت المهمة لصعوبتها",
            ending_combat: "واجهت العدو الذي حاول منعك من فك التشفير",
            ending_stealth: "فككت التشفير بهدوء دون أن يعلم العدو",
            ending_reveal: "كشفت الرسالة كاملة وحذرت القيادة",
            ending_deception: "خدعت العدو وأجبرته على فك التشفير بنفسه"
          }
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        missionId: "mission_missing_agent",
        title: "العميل المفقود",
        description: "مهمة إنقاذ عميل مفقود في أرض العدو",
        minLevel: 10,
        order: 3,
        isActive: true,
        missionData: JSON.stringify({
          pages: {
            start: {
              text: "في غرفة العمليات، تقرأ تقريراً عن عميل مفقود في أرض العدو. الوزير يقول: \"هذا العميل يحمل معلومات حساسة. عليك إنقاذه قبل أن يقع في أيدي العدو.\"",
              image: "operations_room_map"
            },
            page_1: {
              text: "تصل إلى المنطقة المستهدفة. هل تدخل مباشرة أم تدرس المنطقة أولاً؟",
              image: "enemy_territory"
            },
            page_2: {
              text: "تقرر دراسة المنطقة أولاً. تكتشف أن العدو يراقب المكان. هل تنتظر أم تخاطر بالدخول؟",
              image: "surveillance"
            },
            page_3: {
              text: "تجد العميل المفقود! لكنه محاط بالعدو. هل تهاجم مباشرة أم تحاول إنقاذه بهدوء؟",
              image: "surrounded_agent"
            },
            page_4: {
              text: "تجد العميل المفقود! لكنه محاط بالعدو. هل تهاجم مباشرة أم تحاول إنقاذه بهدوء؟",
              image: "surrounded_agent"
            },
            page_5: {
              text: "تجد العميل المفقود! لكنه محاط بالعدو. هل تهاجم مباشرة أم تحاول إنقاذه بهدوء؟",
              image: "surrounded_agent"
            },
            page_6: {
              text: "تجد العميل المفقود! لكنه محاط بالعدو. هل تهاجم مباشرة أم تحاول إنقاذه بهدوء؟",
              image: "surrounded_agent"
            }
          },
          endings: {
            ending_reject: "رفضت المهمة لخطورتها",
            ending_combat: "هاجمت العدو وأنقذت العميل",
            ending_stealth: "أنقذت العميل بهدوء دون قتال",
            ending_reveal: "كشفت خطة العدو وأنقذت العميل",
            ending_deception: "خدعت العدو وأجبرته على إطلاق سراح العميل"
          }
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        missionId: "mission_stolen_documents",
        title: "الوثائق المسروقة",
        description: "مهمة استعادة وثائق سرية مسروقة من الوزارة",
        minLevel: 12,
        order: 4,
        isActive: true,
        missionData: JSON.stringify({
          pages: {
            start: {
              text: "في مكتب الوزير، يخبرك أن وثائق سرية مهمة سُرقت من الوزارة. \"هذه الوثائق تحتوي على أسرار الدولة. عليك استعادتها بأي ثمن.\"",
              image: "minister_office"
            },
            page_1: {
              text: "تبدأ بالتحقيق في السرق. تكتشف أن اللص محترف. هل تتبع آثاره أم تضع فخاً له؟",
              image: "archive_room_open"
            },
            page_2: {
              text: "تقرر وضع فخ للص. لكن هل هذا آمن أم خطير؟",
              image: "trap_setting"
            },
            page_3: {
              text: "الص يقع في الفخ! لكنه مسلح وخطير. هل تهاجمه أم تحاول التفاوض معه؟",
              image: "thief_confrontation"
            },
            page_4: {
              text: "الص يقع في الفخ! لكنه مسلح وخطير. هل تهاجمه أم تحاول التفاوض معه؟",
              image: "thief_confrontation"
            },
            page_5: {
              text: "الص يقع في الفخ! لكنه مسلح وخطير. هل تهاجمه أم تحاول التفاوض معه؟",
              image: "thief_confrontation"
            },
            page_6: {
              text: "الص يقع في الفخ! لكنه مسلح وخطير. هل تهاجمه أم تحاول التفاوض معه؟",
              image: "thief_confrontation"
            }
          },
          endings: {
            ending_reject: "رفضت المهمة لخطورتها",
            ending_combat: "هاجمت الص واستعدت الوثائق",
            ending_stealth: "استعدت الوثائق بهدوء دون قتال",
            ending_reveal: "كشفت هوية الص واستعدت الوثائق",
            ending_deception: "خدعت الص وأجبرته على إعادة الوثائق"
          }
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        missionId: "mission_traitor_agent",
        title: "العميل الخائن",
        description: "مهمة كشف عميل خائن في صفوف الوزارة",
        minLevel: 15,
        order: 5,
        isActive: true,
        missionData: JSON.stringify({
          pages: {
            start: {
              text: "في غرفة العمليات السرية، الوزير ينظر إليك بجدية. \"لدينا عميل خائن في صفوفنا. يبيع أسرار الدولة للعدو. عليك كشفه قبل أن يهرب.\"",
              image: "secret_operations_room"
            },
            page_1: {
              text: "تبدأ بالتحقيق في الملفات. تجد أن الخائن يتواصل مع العدو سراً. هل تتابع الأدلة أم تضع فخاً له؟",
              image: "secret_files"
            },
            page_2: {
              text: "تقرر وضع فخ للخائن. تضع معلومات مزيفة وتنتظر. لكن هل هذا آمن؟",
              image: "fake_trap"
            },
            page_3: {
              text: "الخائن يقع في الفخ! لكنه محترف وخطير. هل تهاجمه مباشرة أم تحاول القبض عليه بهدوء؟",
              image: "traitor_confrontation"
            },
            page_4: {
              text: "الخائن يقع في الفخ! لكنه محترف وخطير. هل تهاجمه مباشرة أم تحاول القبض عليه بهدوء؟",
              image: "traitor_confrontation"
            },
            page_5: {
              text: "الخائن يقع في الفخ! لكنه محترف وخطير. هل تهاجمه مباشرة أم تحاول القبض عليه بهدوء؟",
              image: "traitor_confrontation"
            },
            page_6: {
              text: "الخائن يقع في الفخ! لكنه محترف وخطير. هل تهاجمه مباشرة أم تحاول القبض عليه بهدوء؟",
              image: "traitor_confrontation"
            }
          },
          endings: {
            ending_reject: "رفضت المهمة لخطورتها",
            ending_combat: "هاجمت الخائن وانتصرت عليه",
            ending_stealth: "قبضت على الخائن بهدوء",
            ending_reveal: "كشفت هوية الخائن من الأدلة",
            ending_deception: "خدعت الخائن وأجبرته على الاعتراف"
          }
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        missionId: "mission_secret_message",
        title: "الرسالة السرية",
        description: "مهمة توصيل رسالة سرية إلى عميل في أرض العدو",
        minLevel: 18,
        order: 6,
        isActive: true,
        missionData: JSON.stringify({
          pages: {
            start: {
              text: "في مكتب الوزير، أمامك رسالة سرية مختومة. الوزير يقول: \"هذه الرسالة تحتوي على معلومات حساسة. عليك توصيلها إلى عميلنا في أرض العدو بأي ثمن.\"",
              image: "sealed_message"
            },
            page_1: {
              text: "تصل إلى منطقة العدو. هل تدخل مباشرة أم تدرس المنطقة أولاً؟",
              image: "enemy_zone"
            },
            page_2: {
              text: "تقرر دراسة المنطقة أولاً. تكتشف أن العدو يراقب المكان. هل تنتظر أم تخاطر بالدخول؟",
              image: "enemy_surveillance"
            },
            page_3: {
              text: "تجد العميل! لكنه محاط بالعدو. هل تهاجم أم تحاول الوصول إليه بهدوء؟",
              image: "surrounded_agent"
            },
            page_4: {
              text: "تجد العميل! لكنه محاط بالعدو. هل تهاجم أم تحاول الوصول إليه بهدوء؟",
              image: "surrounded_agent"
            },
            page_5: {
              text: "تجد العميل! لكنه محاط بالعدو. هل تهاجم أم تحاول الوصول إليه بهدوء؟",
              image: "surrounded_agent"
            },
            page_6: {
              text: "تجد العميل! لكنه محاط بالعدو. هل تهاجم أم تحاول الوصول إليه بهدوء؟",
              image: "surrounded_agent"
            }
          },
          endings: {
            ending_reject: "رفضت المهمة لخطورتها",
            ending_combat: "هاجمت العدو وسلمت الرسالة",
            ending_stealth: "سلمت الرسالة بهدوء دون قتال",
            ending_reveal: "كشفت خطة العدو وسلمت الرسالة",
            ending_deception: "خدعت العدو وسلمت الرسالة"
          }
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        missionId: "mission_lost_agent_2",
        title: "العميل المفقود",
        description: "مهمة إنقاذ عميل مفقود في منطقة خطرة",
        minLevel: 20,
        order: 7,
        isActive: true,
        missionData: JSON.stringify({
          pages: {
            start: {
              text: "في غرفة العمليات، تقرأ تقريراً عن عميل مفقود في منطقة خطرة. الوزير يقول: \"هذا العميل يحمل معلومات حساسة. عليك إنقاذه قبل أن يقع في أيدي العدو.\"",
              image: "dangerous_zone_map"
            },
            page_1: {
              text: "تصل إلى المنطقة الخطرة. هل تدخل مباشرة أم تدرس المنطقة أولاً؟",
              image: "dangerous_territory"
            },
            page_2: {
              text: "تقرر دراسة المنطقة أولاً. تكتشف أن العدو يراقب المكان. هل تنتظر أم تخاطر بالدخول؟",
              image: "dangerous_surveillance"
            },
            page_3: {
              text: "تجد العميل المفقود! لكنه محاط بالعدو. هل تهاجم مباشرة أم تحاول إنقاذه بهدوء؟",
              image: "surrounded_agent_dangerous"
            },
            page_4: {
              text: "تجد العميل المفقود! لكنه محاط بالعدو. هل تهاجم مباشرة أم تحاول إنقاذه بهدوء؟",
              image: "surrounded_agent_dangerous"
            },
            page_5: {
              text: "تجد العميل المفقود! لكنه محاط بالعدو. هل تهاجم مباشرة أم تحاول إنقاذه بهدوء؟",
              image: "surrounded_agent_dangerous"
            },
            page_6: {
              text: "تجد العميل المفقود! لكنه محاط بالعدو. هل تهاجم مباشرة أم تحاول إنقاذه بهدوء؟",
              image: "surrounded_agent_dangerous"
            }
          },
          endings: {
            ending_reject: "رفضت المهمة لخطورتها",
            ending_combat: "هاجمت العدو وأنقذت العميل",
            ending_stealth: "أنقذت العميل بهدوء دون قتال",
            ending_reveal: "كشفت خطة العدو وأنقذت العميل",
            ending_deception: "خدعت العدو وأنقذت العميل"
          }
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        missionId: "mission_stolen_docs_2",
        title: "الوثائق المسروقة",
        description: "مهمة استعادة وثائق سرية مسروقة من الوزارة",
        minLevel: 22,
        order: 8,
        isActive: true,
        missionData: JSON.stringify({
          pages: {
            start: {
              text: "في مكتب الوزير، يخبرك أن وثائق سرية مهمة سُرقت من الوزارة. \"هذه الوثائق تحتوي على أسرار الدولة. عليك استعادتها بأي ثمن.\"",
              image: "minister_office_2"
            },
            page_1: {
              text: "تبدأ بالتحقيق في السرق. تكتشف أن اللص محترف. هل تتبع آثاره أم تضع فخاً له؟",
              image: "archive_room_open_2"
            },
            page_2: {
              text: "تقرر وضع فخ للص. لكن هل هذا آمن أم خطير؟",
              image: "trap_setting_2"
            },
            page_3: {
              text: "الص يقع في الفخ! لكنه مسلح وخطير. هل تهاجمه أم تحاول التفاوض معه؟",
              image: "thief_confrontation_2"
            },
            page_4: {
              text: "الص يقع في الفخ! لكنه مسلح وخطير. هل تهاجمه أم تحاول التفاوض معه؟",
              image: "thief_confrontation_2"
            },
            page_5: {
              text: "الص يقع في الفخ! لكنه مسلح وخطير. هل تهاجمه أم تحاول التفاوض معه؟",
              image: "thief_confrontation_2"
            },
            page_6: {
              text: "الص يقع في الفخ! لكنه مسلح وخطير. هل تهاجمه أم تحاول التفاوض معه؟",
              image: "thief_confrontation_2"
            }
          },
          endings: {
            ending_reject: "رفضت المهمة لخطورتها",
            ending_combat: "هاجمت الص واستعدت الوثائق",
            ending_stealth: "استعدت الوثائق بهدوء دون قتال",
            ending_reveal: "كشفت هوية الص واستعدت الوثائق",
            ending_deception: "خدعت الص وأجبرته على إعادة الوثائق"
          }
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        missionId: "mission_traitor_2",
        title: "العميل الخائن",
        description: "مهمة كشف عميل خائن في صفوف الوزارة",
        minLevel: 25,
        order: 9,
        isActive: true,
        missionData: JSON.stringify({
          pages: {
            start: {
              text: "في غرفة العمليات السرية، الوزير ينظر إليك بجدية. \"لدينا عميل خائن في صفوفنا. يبيع أسرار الدولة للعدو. عليك كشفه قبل أن يهرب.\"",
              image: "secret_operations_room_2"
            },
            page_1: {
              text: "تبدأ بالتحقيق في الملفات. تجد أن الخائن يتواصل مع العدو سراً. هل تتابع الأدلة أم تضع فخاً له؟",
              image: "secret_files_2"
            },
            page_2: {
              text: "تقرر وضع فخ للخائن. تضع معلومات مزيفة وتنتظر. لكن هل هذا آمن؟",
              image: "fake_trap_2"
            },
            page_3: {
              text: "الخائن يقع في الفخ! لكنه محترف وخطير. هل تهاجمه مباشرة أم تحاول القبض عليه بهدوء؟",
              image: "traitor_confrontation_2"
            },
            page_4: {
              text: "الخائن يقع في الفخ! لكنه محترف وخطير. هل تهاجمه مباشرة أم تحاول القبض عليه بهدوء؟",
              image: "traitor_confrontation_2"
            },
            page_5: {
              text: "الخائن يقع في الفخ! لكنه محترف وخطير. هل تهاجمه مباشرة أم تحاول القبض عليه بهدوء؟",
              image: "traitor_confrontation_2"
            },
            page_6: {
              text: "الخائن يقع في الفخ! لكنه محترف وخطير. هل تهاجمه مباشرة أم تحاول القبض عليه بهدوء؟",
              image: "traitor_confrontation_2"
            }
          },
          endings: {
            ending_reject: "رفضت المهمة لخطورتها",
            ending_combat: "هاجمت الخائن وانتصرت عليه",
            ending_stealth: "قبضت على الخائن بهدوء",
            ending_reveal: "كشفت هوية الخائن من الأدلة",
            ending_deception: "خدعت الخائن وأجبرته على الاعتراف"
          }
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        missionId: "mission_secret_msg_2",
        title: "الرسالة السرية",
        description: "مهمة توصيل رسالة سرية إلى عميل في أرض العدو",
        minLevel: 28,
        order: 10,
        isActive: true,
        missionData: JSON.stringify({
          pages: {
            start: {
              text: "في مكتب الوزير، أمامك رسالة سرية مختومة. الوزير يقول: \"هذه الرسالة تحتوي على معلومات حساسة. عليك توصيلها إلى عميلنا في أرض العدو بأي ثمن.\"",
              image: "sealed_message_2"
            },
            page_1: {
              text: "تصل إلى منطقة العدو. هل تدخل مباشرة أم تدرس المنطقة أولاً؟",
              image: "enemy_zone_2"
            },
            page_2: {
              text: "تقرر دراسة المنطقة أولاً. تكتشف أن العدو يراقب المكان. هل تنتظر أم تخاطر بالدخول؟",
              image: "enemy_surveillance_2"
            },
            page_3: {
              text: "تجد العميل! لكنه محاط بالعدو. هل تهاجم أم تحاول الوصول إليه بهدوء؟",
              image: "surrounded_agent_2"
            },
            page_4: {
              text: "تجد العميل! لكنه محاط بالعدو. هل تهاجم أم تحاول الوصول إليه بهدوء؟",
              image: "surrounded_agent_2"
            },
            page_5: {
              text: "تجد العميل! لكنه محاط بالعدو. هل تهاجم أم تحاول الوصول إليه بهدوء؟",
              image: "surrounded_agent_2"
            },
            page_6: {
              text: "تجد العميل! لكنه محاط بالعدو. هل تهاجم أم تحاول الوصول إليه بهدوء؟",
              image: "surrounded_agent_2"
            }
          },
          endings: {
            ending_reject: "رفضت المهمة لخطورتها",
            ending_combat: "هاجمت العدو وسلمت الرسالة",
            ending_stealth: "سلمت الرسالة بهدوء دون قتال",
            ending_reveal: "كشفت خطة العدو وسلمت الرسالة",
            ending_deception: "خدعت العدو وسلمت الرسالة"
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