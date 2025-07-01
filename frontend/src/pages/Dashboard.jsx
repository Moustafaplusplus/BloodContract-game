// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;

    fetch('http://localhost:5000/api/character/me', {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then((res) => res.json())
      .then(setStats)
      .catch(() => setMessage('فشل تحميل إحصائيات اللاعب'));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-3xl mb-4 font-bold text-red-500">لوحة التحكم</h1>

      <nav className="mb-6 flex gap-4">
        <Link to="/shop" className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">
          🛒 متجر الأسلحة
        </Link>
        <Link to="/crimes" className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">
          🧨 قائمة الجرائم
        </Link>
      </nav>

      {stats && (
        <div className="mb-6 bg-gray-800 p-4 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">إحصائيات اللاعب</h2>
          <p>💰 المال: {stats.money}$</p>
          <p>⚡ الطاقة: {stats.energy}</p>
          <p>❤️ الصحة: {stats.hp}</p>
          <p>🏃‍♂️ اللياقة: {stats.stamina}</p>
          <p>🗡️ الهجوم: {stats.attackPower}</p>
          <p>🛡️ الدفاع: {stats.defense}</p>
        </div>
      )}

      {message && <p className="mt-4 text-red-400">{message}</p>}
    </div>
  );
}
