// backend/src/utils/fightEngine.js
export function calculateFightResult(attacker, defender) {
  const MAX_ROUNDS = 20;
  const log = [];

  // clone so we can mutate HP
  let atk = { ...attacker, hp: 500 };
  let def = { ...defender, hp: 500 };

  const wMult = (w) => (w?.rarity === 'legendary' ? 2.5 : 1.5);
  const aRed  = (a) => (a?.def ?? 0) * 0.3;

  let totalDamage = 0;
  let round       = 1;

  for (; round <= MAX_ROUNDS; round++) {
    const hitChance =
      50 + ((atk.dex ?? 5) - (def.dex ?? 5)) * 0.15;
    const hitRoll = Math.random() * 100;

    if (hitRoll < hitChance) {
      const base = (atk.str ?? 10) * wMult(atk.weapon);
      const dmg  = Math.max(5, base - aRed(def.armor));

      def.hp -= dmg;
      totalDamage += dmg;

      log.push(
        `الجولة ${round}: ${atk.username ?? 'المهاجم'} أصاب `
        + `${def.username ?? 'المدافع'} بـ ${dmg.toFixed(1)} ضرر.`
      );
    } else {
      log.push(
        `الجولة ${round}: ${atk.username ?? 'المهاجم'} أخطأ الهجوم.`
      );
    }

    if (def.hp <= 0 || atk.hp <= 0) break;
    [atk, def] = [def, atk];  // swap
  }

  const winner = atk.hp > def.hp ? atk : def;

  return {
    winner:    winner.username ?? 'غير معروف',
    winnerId:  winner.id,
    rounds:    round,
    totalDamage,
    log,
  };
}
