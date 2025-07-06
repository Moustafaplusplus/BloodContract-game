// backend/src/seed/crimes.js — 25 Arabic crimes covering all levels
// -----------------------------------------------------------------------------
// Usage:
//   pnpm node src/seed/crimes.js    # or: node src/seed/crimes.js
// -----------------------------------------------------------------------------
import { sequelize } from "../config/db.js";
import Crime from "../models/crime.js";

// Ensure schema is up‑to‑date
await sequelize.sync();

/* ---------------- helper: make unique slug ---------------- */
const toSlug = (str) =>
  str
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();

/* ---------------- base list (Arabic names) ---------------- */
const baseCrimes = [
  /* lvl 1‑2 */
  { name: "سرقة محفظة في الزحام",               lvl: 1, energy: 3,  rate: 0.9,  min: 15,  max: 40,  cd: 20  },
  { name: "رشّ كتابات على حائط عام",            lvl: 1, energy: 4,  rate: 0.88, min: 20,  max: 45,  cd: 25 },
  { name: "سرقة دراجة هوائية",                 lvl: 2, energy: 5,  rate: 0.85, min: 25,  max: 60,  cd: 35 },
  { name: "تفكيك سيارة خردة لبيع قطعها",        lvl: 2, energy: 6,  rate: 0.8,  min: 30,  max: 70,  cd: 40 },
  /* lvl 3‑4 */
  { name: "سطو على بقالة صغيرة",               lvl: 3, energy: 8,  rate: 0.75, min: 50,  max: 120, cd: 60 },
  { name: "خطف حقيبة يد",                      lvl: 3, energy: 7,  rate: 0.78, min: 45,  max: 110, cd: 55 },
  { name: "بيع مواد مقلدة في السوق",           lvl: 4, energy: 9,  rate: 0.72, min: 60,  max: 140, cd: 70 },
  { name: "تهريب سجائر عبر الحدود",            lvl: 4, energy: 10, rate: 0.7,  min: 75,  max: 160, cd: 75 },
  /* lvl 5‑6 */
  { name: "سرقة سيارة فارهة",                  lvl: 5, energy: 12, rate: 0.65, min: 90,  max: 200, cd: 90 },
  { name: "ابتزاز صاحب متجر",                  lvl: 5, energy: 11, rate: 0.68, min: 85,  max: 190, cd: 85 },
  { name: "تهريب مخدرات خفيفة",                lvl: 6, energy: 14, rate: 0.6,  min: 120, max: 260, cd: 110 },
  { name: "سرقة أجهزة إلكترونية من شاحنة",     lvl: 6, energy: 13, rate: 0.58, min: 110, max: 240, cd: 105 },
  /* lvl 7‑8 */
  { name: "سطو مسلح على بنك محلي",             lvl: 7, energy: 18, rate: 0.5,  min: 180, max: 400, cd: 180 },
  { name: "اختطاف رجل أعمال",                 lvl: 7, energy: 17, rate: 0.52, min: 170, max: 380, cd: 170 },
  { name: "تفجير سيارة مستهدفة",               lvl: 8, energy: 20, rate: 0.48, min: 200, max: 450, cd: 200 },
  { name: "تزوير جوازات سفر",                  lvl: 8, energy: 19, rate: 0.46, min: 190, max: 420, cd: 190 },
  /* lvl 9‑10 */
  { name: "تهريب أسلحة خفيفة",                 lvl: 9,  energy: 22, rate: 0.42, min: 230, max: 500, cd: 220 },
  { name: "سرقة بيانات بطاقات ائتمان",         lvl: 9,  energy: 21, rate: 0.4,  min: 220, max: 480, cd: 210 },
  { name: "تفجير مخزن حكومي",                  lvl: 10, energy: 24, rate: 0.35, min: 260, max: 600, cd: 260 },
  { name: "اختراق شبكة بنك",                  lvl: 10, energy: 23, rate: 0.33, min: 250, max: 580, cd: 250 },
  /* lvl 11‑12 */
  { name: "تهريب مخدرات عالية الخطورة",        lvl: 11, energy: 26, rate: 0.3,  min: 300, max: 700, cd: 300 },
  { name: "اغتيال شخصية سياسية",              lvl: 11, energy: 28, rate: 0.28, min: 330, max: 750, cd: 320 },
  { name: "سرقة مجوهرات من معرض",             lvl: 12, energy: 30, rate: 0.25, min: 360, max: 820, cd: 360 },
  { name: "تفجير مركز قيادة عسكري",            lvl: 12, energy: 32, rate: 0.22, min: 380, max: 880, cd: 380 },
  /* lvl 13‑14 */
  { name: "اختطاف عالم نووي",                  lvl: 13, energy: 34, rate: 0.2,  min: 420, max: 950, cd: 420 },
  { name: "الاستيلاء على موكب أموال",         lvl: 14, energy: 36, rate: 0.18, min: 450, max: 1000, cd: 450 },
  { name: "سرقة بيانات نووية سرية",           lvl: 15, energy: 38, rate: 0.16, min: 480, max: 1100, cd: 480 },
];

/* --------- convert to full objects with unique slug + extras --------- */
const crimes = baseCrimes.map((c, idx) => ({
  name: c.name,
  slug: `${toSlug(c.name)}-${idx + 1}`,
  isEnabled: true,
  req_level: c.lvl,
  req_intel: Math.max(1, Math.floor(c.lvl / 2)),
  energyCost: c.energy,
  successRate: c.rate,
  minReward: c.min,
  maxReward: c.max,
  cooldown: c.cd,
  failOutcome: c.lvl % 3 === 0 ? "both" : c.lvl % 2 === 0 ? "hospital" : "jail",
  jailMinutes: Math.ceil(c.lvl / 2),
  hospitalMinutes: Math.ceil(c.lvl / 3),
  hpLoss: 10 + c.lvl * 2,
  bailRate: 50 * Math.ceil(c.lvl / 2),
  healRate: 40 * Math.ceil(c.lvl / 3),
}));

/* --------------------- seed --------------------- */
console.log("⏳ Truncating crimes table …");
await Crime.destroy({ where: {} });

console.log("⏳ Inserting", crimes.length, "crimes …");
await Crime.bulkCreate(crimes);
console.log("✅ Seeded", crimes.length, "Arabic crimes");

process.exit();
