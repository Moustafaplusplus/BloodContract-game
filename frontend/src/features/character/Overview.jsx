/* -------- src/features/character/Overview.jsx ---------- */
import { useHud } from '@/hooks/useHud';

/**
 * Generic horizontal bar that supports RTL fill direction and
 * shows the percentage instead of raw values.
 */
function StatBar({ label, value, max, colorClass, rtl = true }) {
  const pct = max ? Math.min(100, (value / max) * 100) : 0;
  const pctText = `${Math.round(pct)}%`;

  return (
    <div className="space-y-1" title={`${value}${max ? ` / ${max}` : ''}`}>
      <div className="flex justify-between text-xs font-medium">
        <span>{label}</span>
        <span>{pctText}</span>
      </div>
      <div className="w-full h-3 rounded bg-gray-300 dark:bg-gray-600 overflow-hidden flex">
        <div
          className={`h-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${pct}%`, ...(rtl && { marginLeft: 'auto' }) }}
        />
      </div>
    </div>
  );
}

export default function Overview() {
  const { hud, loading } = useHud();

  if (loading || !hud) {
    return (
      <div className="space-y-2 animate-pulse text-gray-400">
        <h2 className="text-2xl font-bold">شخصيتك</h2>
        <p>Loading character stats…</p>
      </div>
    );
  }

  const {
    level,
    exp,
    nextLevelExp,
    energy,
    maxEnergy,
    hp,
    maxHp,
    money,
    strength,
    defense,
  } = hud;

  const expMax = nextLevelExp || level * 1000;

  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="text-2xl font-bold flex items-center gap-2">
        شخصيتك
        <span className="text-base font-normal ml-auto px-2 py-0.5 rounded bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-800">
          المستوى {level}
        </span>
      </h2>

      {/* Bars */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatBar label="الصحة" value={hp}   max={maxHp}    colorClass="bg-red-600"    />
        <StatBar label="الطاقة" value={energy} max={maxEnergy} colorClass="bg-green-500"  />
        <StatBar label="الخبرة" value={exp}  max={expMax}  colorClass="bg-amber-400" />
      </div>

      {/* Numeric stats */}
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-1 text-sm">
        <li>💰 المال: ${money}</li>
        <li>💪 القوة: {strength}</li>
        <li>🛡️ الدفاع: {defense}</li>
      </ul>
    </div>
  );
}
/* ------ END src/features/character/Overview.jsx ------- */
