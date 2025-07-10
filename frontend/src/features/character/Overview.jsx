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
    <section className="bg-black min-h-screen text-white p-4 space-y-8 w-full min-w-0">
      <h1 className="text-2xl font-bold text-red-600 mb-4">👤 الشخصية</h1>
      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 text-white max-w-xs w-full mx-auto">
        <div className="flex flex-col items-center space-y-2 mb-4">
          <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center text-3xl text-red-500">
            {character.avatar || character.name[0]}
          </div>
          <h2 className="text-xl font-bold text-red-500">{character.name}</h2>
          <p className="text-gray-300">{character.email}</p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>المستوى:</span>
            <span className="text-red-400 font-mono">{character.level}</span>
          </div>
          <div className="flex justify-between">
            <span>الخبرة:</span>
            <span className="text-red-400 font-mono">{character.exp}</span>
          </div>
          <div className="flex justify-between">
            <span>النقود:</span>
            <span className="text-red-400 font-mono">{character.money}$</span>
          </div>
        </div>
      </div>
    </section>
  );
}
/* ------ END src/features/character/Overview.jsx ------- */
