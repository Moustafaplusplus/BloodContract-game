// =======================================================
//  backend/src/features/shop.js   (weapons + armor + seed)
// =======================================================
import express  from 'express';
import jwt      from 'jsonwebtoken';
import { Model, DataTypes } from 'sequelize';

import { sequelize }  from '../config/db.js';
import { auth }       from './user.js';
import { Character }  from './character.js';
import { InventoryItem } from './inventory.js';

/* ── 1) Models ────────────────────────────────────────── */
export class Weapon extends Model {}
Weapon.init({
  name:         DataTypes.STRING,
  type:         DataTypes.STRING,   // melee | rifle | sniper …
  damage:       DataTypes.INTEGER,
  energyBonus:  DataTypes.INTEGER,  // NEW  (extra max-energy)
  price:        DataTypes.INTEGER,
  rarity:       DataTypes.STRING,
}, { sequelize, modelName: 'Weapon', timestamps: false });

export class Armor extends Model {}
Armor.init({
  name:      DataTypes.STRING,
  def:       DataTypes.INTEGER,
  hpBonus:   DataTypes.INTEGER,     // NEW  (extra max-hp)
  price:     DataTypes.INTEGER,
  rarity:    DataTypes.STRING,
}, { sequelize, modelName: 'Armor', timestamps: false });

/* ── 2) Helpers ───────────────────────────────────────── */
const router = express.Router();

async function purchaseItem({ userId, slot, itemId, price }) {
  const char = await Character.findOne({ where: { userId } });
  if (!char || char.money < price) throw 'لا تملك مالاً كافياً';

  const exists = await InventoryItem.findOne({ where: { userId, itemType: slot, itemId } });
  if (exists) throw 'العنصر موجود لديك بالفعل';

  await Promise.all([
    char.update({ money: char.money - price }),
    InventoryItem.create({ userId, itemType: slot, itemId }),
  ]);
}

/* ── 3) Catalogue routes ─────────────────────────────── */
router.get('/weapons', async (_req, res) => res.json(await Weapon.findAll()));
router.get('/armors',  async (_req, res) => res.json(await Armor.findAll()));

/* ── 4) Purchase routes ──────────────────────────────── */
router.post('/buy/weapon/:id', auth, async (req, res) => {
  const weapon = await Weapon.findByPk(req.params.id);
  if (!weapon) return res.status(404).json({ message: 'السلاح غير موجود' });

  try {
    await purchaseItem({
      userId: req.user.id,
      slot:   'weapon',
      itemId: weapon.id,
      price:  weapon.price,
    });
    res.json({ message: 'تم شراء السلاح', weaponId: weapon.id });
  } catch (e) { res.status(400).json({ message: e }); }
});

router.post('/buy/armor/:id', auth, async (req, res) => {
  const armor = await Armor.findByPk(req.params.id);
  if (!armor) return res.status(404).json({ message: 'الدرع غير موجود' });

  try {
    await purchaseItem({
      userId: req.user.id,
      slot:   'armor',
      itemId: armor.id,
      price:  armor.price,
    });
    res.json({ message: 'تم شراء الدرع', armorId: armor.id });
  } catch (e) { res.status(400).json({ message: e }); }
});

/* ── 5) Seeder ───────────────────────────────────────── */
export async function seedShopItems() {
  const [wCnt, aCnt] = await Promise.all([Weapon.count(), Armor.count()]);
  if (wCnt || aCnt) { console.log('🛒  Shop already seeded'); return; }

  await Weapon.bulkCreate([
    { name: 'خنجر صدئ',       type: 'melee',  damage: 4,  energyBonus: 0,  price: 150,  rarity: 'common' },
    { name: 'عصا حديدية',      type: 'melee',  damage: 6,  energyBonus: 1,  price: 300,  rarity: 'common' },
    { name: 'مسدس 9mm',        type: 'pistol', damage: 9,  energyBonus: 0,  price: 800,  rarity: 'uncommon' },
    { name: 'بندقية صيد',      type: 'rifle',  damage: 12, energyBonus: 0,  price: 1200, rarity: 'uncommon' },
    { name: 'كاتانا فولاذية',  type: 'melee',  damage: 16, energyBonus: 2,  price: 2200, rarity: 'rare' },
    { name: 'قناص قصير',       type: 'sniper', damage: 20, energyBonus: 0,  price: 3000, rarity: 'rare' },
    { name: 'مطرقة الحرب',     type: 'melee',  damage: 24, energyBonus: 3,  price: 3800, rarity: 'epic' },
    { name: 'رشاش آلي',        type: 'rifle',  damage: 28, energyBonus: 0,  price: 4500, rarity: 'epic' },
    { name: 'قناصة متقدمة',    type: 'sniper', damage: 34, energyBonus: 0,  price: 5500, rarity: 'legend' },
    { name: 'سيف أسطوري',      type: 'melee',  damage: 40, energyBonus: 5,  price: 7000, rarity: 'legend' },
  ]);

  await Armor.bulkCreate([
    { name: 'سترة قماش',          def: 2,  hpBonus: 0,  price: 200,  rarity: 'common' },
    { name: 'سترة جلدية',         def: 4,  hpBonus: 10, price: 400,  rarity: 'common' },
    { name: 'درع كيفلر خفيف',     def: 7,  hpBonus: 15, price: 900,  rarity: 'uncommon' },
    { name: 'درع كيفلر متوسط',    def: 9,  hpBonus: 20, price: 1300, rarity: 'uncommon' },
    { name: 'درع كيفلر ثقيل',     def: 12, hpBonus: 25, price: 1800, rarity: 'rare' },
    { name: 'درع تكتيكي',         def: 15, hpBonus: 35, price: 2400, rarity: 'rare' },
    { name: 'درع التيتانيوم',     def: 19, hpBonus: 45, price: 3200, rarity: 'epic' },
    { name: 'درع مركب متقدم',     def: 23, hpBonus: 55, price: 4000, rarity: 'epic' },
    { name: 'درع نانوي خفيف',     def: 27, hpBonus: 65, price: 5200, rarity: 'legend' },
    { name: 'درع نانوي معزز',     def: 32, hpBonus: 80, price: 6500, rarity: 'legend' },
  ]);

  console.log('✅  Shop items seeded');
}

/* ── 6) Barrel export ─────────────────────────────────── */
export { router };
export default { Weapon, Armor, router };
