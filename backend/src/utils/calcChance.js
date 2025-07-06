// chance = base successRate (0-1) + 1 % per level, clamped 5 %–95 %
export default function calcChance(level, baseRate = 0.5) {
  const bonus   = level * 0.01;
  const chance  = Math.min(0.95, Math.max(0.05, baseRate + bonus));
  return chance; // returns 0–1
}