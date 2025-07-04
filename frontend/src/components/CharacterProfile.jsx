// frontend/src/pages/components/CharacterProfile.jsx
import { useEffect, useState } from 'react';

export default function CharacterProfile({ character }) {
  const [house, setHouse] = useState(null);
  const token = localStorage.getItem('token');

  // get the player’s house only
  useEffect(() => {
    if (!token) return;

    fetch(`${import.meta.env.VITE_API_URL}/api/houses/mine`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => (res.ok ? res.json() : null))
      .then(setHouse)
      .catch(console.error);
  }, [token]);

  if (!character) return <p className="text-gray-400">تحميل البيانات…</p>;

  const levelCap = Math.max(1, character.level);
  const xpPercent = Math.min(100, (character.xp / (levelCap * 100)) * 100);

  return (
    <div className="bg-gray-800 text-white p-4 rounded-xl shadow-lg w-full max-w-md mx-auto">
      {/* avatar + XP bar */}
      <div className="flex items-center gap-4 mb-4">
        <img src="/profile-default.png" alt="Profile"
             className="w-16 h-16 rounded-full border-2 border-yellow-400" />
        <div>
          <h2 className="text-xl font-bold">المستوى {character.level}</h2>
          <p className="text-sm text-gray-300">
            XP: {character.xp} / {levelCap * 100}
          </p>
          <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
            <div className="bg-yellow-400 h-2 rounded-full"
                 style={{ width: `${xpPercent}%` }} />
          </div>
        </div>
      </div>

      {/* basic stats */}
      <ul className="text-sm text-gray-300 space-y-1 mb-3">
        <li>💰 المال: {character.money}</li>
        <li>⚡ الطاقة: {character.energy}</li>
        <li>❤️ الصحة: {character.hp}</li>
        <li>🥋 الهجوم: {character.attackPower}</li>
        <li>🛡️ الدفاع: {character.defense}</li>
        <li>🏃 اللياقة: {character.stamina}</li>
      </ul>

      {/* current house card */}
      {house && (
        <div className="bg-gray-900 p-3 rounded-lg mt-4 border border-yellow-700">
          <h3 className="text-md font-semibold text-yellow-400 mb-1">
            🏠 البيت الحالي: {house.name}
          </h3>
          <p className="text-sm text-gray-300">
            ⚡ تجديد: +{house.energyRegen}, 🛡️ دفاع: +{house.defenseBonus}
          </p>
          <p className="text-xs text-gray-400 mt-1">{house.description}</p>
        </div>
      )}
    </div>
  );
}
