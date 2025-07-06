// frontend/src/components/CharacterProfile.jsx
import { useEffect, useState, useMemo } from 'react';
import { useHud }   from '../context/HudProvider';   // <-- path up 2 levels
import api          from '../api/axios';            // Axios wrapper

const Stat = ({ icon, label, value }) => (
  <li className="flex justify-between">
    <span className="whitespace-nowrap">{icon} {label}</span>
    <span className="font-semibold">{value}</span>
  </li>
);

export default function CharacterProfile({ character }) {
  const { stats: liveStats } = useHud();      // { energy, health, courage, stamina, will }
  const [house, setHouse] = useState(null);

  /* merge initial char with live stats */
  const data = useMemo(() => ({ ...character, ...liveStats }), [character, liveStats]);

  /* fetch the current house once */
  useEffect(() => {
    api.get('/houses/mine').then(res => setHouse(res.data)).catch(() => {});
  }, []);

  if (!character) return <p className="text-gray-400">تحميل البيانات…</p>;

  const xpTarget  = Math.max(1, data.level) * 100;
  const xpPercent = Math.min(100, (data.xp / xpTarget) * 100);

  return (
    <section className="bg-gray-800 text-white p-5 rounded-2xl shadow-lg w-full max-w-md mx-auto">
      {/* avatar + XP */}
      <div className="flex gap-4 mb-5 items-center">
        <img
          src="/avatar-placeholder.png"
          onError={e => (e.currentTarget.src = '/profile-default.png')}
          alt="Avatar"
          className="w-20 h-20 rounded-full border-2 border-yellow-400 object-cover"
        />
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-1">المستوى {data.level}</h2>
          <p className="text-xs text-gray-300">
            XP: {data.xp} / {xpTarget}
          </p>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
            <div
              className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* live stats */}
      <ul className="text-sm text-gray-300 space-y-1 mb-4">
        <Stat icon="💰" label="المال"   value={data.money}             />
        <Stat icon="⚡" label="الطاقة"  value={data.energy}            />
        <Stat icon="❤️" label="الصحة"   value={data.health ?? data.hp} />
        <Stat icon="🗡️" label="الشجاعة" value={data.courage}          />
        <Stat icon="🏃" label="اللياقة"  value={data.stamina}          />
        <Stat icon="🏆" label="الإرادة"  value={data.will}             />
      </ul>

      {/* current house */}
      {house && (
        <article className="bg-gray-900 p-4 rounded-xl border border-yellow-700">
          <h3 className="text-md font-semibold text-yellow-400 mb-1">
            🏠 البيت الحالي: {house.name}
          </h3>
          <p className="text-sm text-gray-300">
            ⚡ تجديد: +{house.energyRegen} / دقيقة، 🛡️ دفاع: +{house.defenseBonus}
          </p>
          {house.description && (
            <p className="text-xs text-gray-400 mt-1">{house.description}</p>
          )}
        </article>
      )}
    </section>
  );
}


