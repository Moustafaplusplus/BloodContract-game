// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CharacterProfile from './components/CharacterProfile';

export default function Dashboard() {
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;

    fetch('http://localhost:5000/api/character/me', {
      headers: { Authorization: 'Bearer ' + token },
    }).catch(() => setMessage('فشل تحميل إحصائيات اللاعب'));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-3xl mb-4 font-bold text-red-500">لوحة التحكم</h1>

      <nav className="mb-6 flex gap-4 flex-wrap">
        <Link to="/shop" className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">
          🛒 متجر الأسلحة
        </Link>
        <Link to="/crimes" className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">
          🧨 قائمة الجرائم
        </Link>
        <Link to="/realestate" className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">
          🏠 سوق العقارات
        </Link>
      </nav>

      <CharacterProfile />

      {message && <p className="mt-4 text-red-400">{message}</p>}
    </div>
  );
}
