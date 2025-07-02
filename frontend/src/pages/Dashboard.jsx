// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CharacterProfile from './components/CharacterProfile';

export default function Dashboard() {
  const [message, setMessage] = useState('');
  const [character, setCharacter] = useState(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/signin');
      return;
    }

    fetch('http://localhost:5000/api/character/me', {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then(res => res.json())
      .then(data => setCharacter(data))
      .catch(() => setMessage('فشل تحميل إحصائيات اللاعب'));
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold text-red-500">لوحة التحكم</h1>

      <nav className="flex gap-4 flex-wrap">
        <Link to="/shop" className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">🛒 متجر الأسلحة</Link>
        <Link to="/crimes" className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">🧨 قائمة الجرائم</Link>
        <Link to="/realestate" className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">🏠 سوق العقارات</Link>
        <Link to="/players" className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">⚔️ تحدَّ لاعبين</Link>
      </nav>

      {/* Player Profile Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CharacterProfile character={character} />

        <div className="bg-gray-800 p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-2">📊 إحصائيات اللاعب</h2>
          <p>⭐ المستوى: {character?.level}</p>
          <p>🩸 الصحة: {character?.stats?.hp}</p>
          <p>⚡ الطاقة: {character?.stats?.energy}</p>
          <p>🎖️ نقاط الاحترام: {character?.respect ?? '؟'}</p>
        </div>
      </section>

      {/* Placeholder Sections */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded-md min-h-[120px]">
          <h2 className="text-lg font-semibold">🗓️ المهمات النشطة</h2>
          <p className="text-sm text-gray-400">Placeholder for current missions</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-md min-h-[120px]">
          <h2 className="text-lg font-semibold">📣 آخر الأخبار / الإشعارات</h2>
          <p className="text-sm text-gray-400">Placeholder for announcements</p>
        </div>
      </section>

      {message && <p className="text-red-400">{message}</p>}
    </div>
  );
}
