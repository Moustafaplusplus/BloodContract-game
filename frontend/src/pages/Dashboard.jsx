// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CharacterProfile from '../components/CharacterProfile.jsx';

export default function Dashboard() {
  const [character, setCharacter] = useState(null);
  const [message,   setMessage]   = useState('');

  const token    = localStorage.getItem('token');
  const navigate = useNavigate();

  /* ───────────────────── Fetch character once ───────────────────── */
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/character/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setCharacter(data);
        localStorage.setItem(
          'char_snapshot',
          JSON.stringify({ energy: data.energy, will: data.will }),
        );
      })
      .catch(() => setMessage('فشل تحميل إحصائيات اللاعب'));
  }, [token, navigate]);

  /* ──────────────────────  Styles shortcuts  ────────────────────── */
  const navBtn =
    'px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition text-sm';
  const placeholder =
    'bg-gray-800 p-4 rounded-md min-h-[120px] flex flex-col justify-center';

  /* ────────────────────────  Render  ───────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 space-y-8">
      {/* title */}
      <h1 className="text-3xl font-bold text-red-500">لوحة التحكم</h1>

      {/* shortcuts */}
      <nav className="flex flex-wrap gap-3">
        <Link to="/shop"         className={navBtn}>🛒 متجر الأسلحة</Link>
        <Link to="/gym"          className={navBtn}>💪 صالة التدريب</Link>
        <Link to="/crimes"       className={navBtn}>🧨 قائمة الجرائم</Link>
        <Link to="/realestate"   className={navBtn}>🏠 سوق العقارات</Link>
        <Link to="/bank"         className={navBtn}>🏦 البنك</Link>
        <Link to="/black-market" className={navBtn}>🕶️ السوق السوداء</Link>
        <Link to="/gold-market"  className={navBtn}>🪙 سوق الذهب / VIP</Link>
        <Link to="/gangs"        className={navBtn}>👥 العصابات</Link>
        <Link to="/players"      className={navBtn}>⚔️ تحدَّ لاعبين</Link>
        <Link to="/events"       className={navBtn}>📜 موجز الأحداث</Link>
        <Link to="/jail"         className={navBtn}>🚔 السجن</Link>
        <Link to="/inventory"   className={navBtn}>🎒 الحقيبة</Link>
      </nav>

      {/* profile + inventory placeholder */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CharacterProfile character={character} />
      </section>

      {/* future features grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={placeholder}>
          <h2 className="text-lg font-semibold mb-1">🗓️ المهمات النشطة</h2>
          <p className="text-sm text-gray-400">قريباً: نظام المهام اليومية</p>
        </div>

        <div className={placeholder}>
          <h2 className="text-lg font-semibold mb-1">📣 الإشعارات</h2>
          <p className="text-sm text-gray-400">قريباً: تنبيهات قتال / جريمة / بنك</p>
        </div>

        <div className={placeholder}>
          <h2 className="text-lg font-semibold mb-1">📰 جريدة المدينة</h2>
          <p className="text-sm text-gray-400">قريباً: أحدث القصص والشائعات</p>
        </div>
      </section>

      {message && <p className="text-red-400">{message}</p>}
    </div>
  );
}

