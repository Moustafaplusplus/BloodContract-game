// backend/utils/fightEngine.js
export function calculateFightResult(attacker, defender) {
  const rounds = 20;
  const fightLog = [];
  let atk = { ...attacker, hp: 500 };
  let def = { ...defender, hp: 500 };
  let turn = 1;
  let totalDamage = 0;

  function weaponMultiplier(w) { return w?.rarity === 'legendary' ? 2.5 : 1.5; }
  function armorReduction(a) { return a?.def ? a.def * 0.3 : 0; }

  for (let i = 0; i < rounds; i++) {
    const hitChance = 50 + (atk.dex - def.dex) * 0.15;
    const hitRoll = Math.random() * 100;

    if (hitRoll < hitChance) {
      const baseDmg = atk.str * weaponMultiplier(atk.weapon);
      const mitigated = def.def * armorReduction(def.armor);
      const dmg = Math.max(5, baseDmg - mitigated);
      def.hp -= dmg;
      totalDamage += dmg;

      fightLog.push(`Round ${turn}: ${atk.username} hits ${def.username} for ${dmg.toFixed(1)} dmg.`);
    } else {
      fightLog.push(`Round ${turn}: ${atk.username} missed.`);
    }

    if (def.hp <= 0 || atk.hp <= 0) break;
    [atk, def] = [def, atk];
    turn++;
  }

  const winner = atk.hp > def.hp ? atk : def;

  return {
    winner: winner.username,
    winnerId: winner.id,
    rounds: turn,
    totalDamage,
    log: fightLog
  };
}