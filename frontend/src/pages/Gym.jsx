// frontend/src/pages/Gym.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Gym() {
  const [energy, setEnergy] = useState(0);     // current energy from HUD
  const [will, setWill]     = useState(0);
  const [spend, setSpend]   = useState(10);    // slider value
  const [msg, setMsg]       = useState('');
  const navigate = useNavigate();

  // pull fresh stats from localStorage/HUD (quick hack)
  useEffect(() => {
    const char = JSON.parse(localStorage.getItem('char_snapshot') || '{}');
    setEnergy(char.energy ?? 0);
    setWill(char.will ?? 0);
  }, []);

  const handleTrain = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/gym/train`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ energy: spend }),
    });

    if (!res.ok) {
      setMsg('فشل التدريب: تحقق من الطاقة');
      return;
    }

    const data = await res.json();
    setMsg(`✅ حصلت على +${data.gained.stamina} لياقة و+${data.gained.attack} هجوم و+${data.gained.defense} دفاع!`);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold text-green-400">🏋️‍♂️ صالة التدريب</h1>

      <p>🪫 طاقتك الحالية: {energy}</p>
      <p>🧠 الإرادة: {will}</p>

      <label className="block mt-4">
        ⚡ حدد الطاقة التي تريد إنفاقها: {spend}
        <input
          type="range"
          min="1"
          max={energy}
          value={spend}
          onChange={(e) => setSpend(Number(e.target.value))}
          className="w-full"
        />
      </label>

      <button
        onClick={handleTrain}
        className="mt-4 px-6 py-2 bg-green-600 rounded hover:bg-green-500 disabled:opacity-40"
        disabled={spend > energy || spend <= 0}
      >
        تدريب
      </button>

      {msg && <p className="mt-4 text-yellow-400">{msg}</p>}
    </div>
  );
}
