// frontend/src/pages/CrimesList.jsx
import { useEffect, useState } from 'react';

export default function CrimesList() {
  const [crimes, setCrimes] = useState([]);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http://localhost:5000/api/crimes', {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    })
      .then((res) => res.json())
      .then(setCrimes)
      .catch(() => setMessage('فشل تحميل قائمة الجرائم'));
  }, []);

  const commitCrime = async (crimeId) => {
    const res = await fetch('http://localhost:5000/api/crimes/commit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({ crimeId }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(
        data.success
          ? `✅ نجحت العملية: حصلت على ${data.reward}$ + ${data.xpGained}XP (المستوى ${data.level})`
          : `❌ فشلت المحاولة + ${data.xpGained}XP (المستوى ${data.level})`
      );
    } else {
      setMessage(data.message || 'حدث خطأ أثناء تنفيذ الجريمة');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-3xl font-bold text-red-500 mb-6">🧨 قائمة الجرائم</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {crimes.map((crime) => (
          <div
            key={crime.id}
            className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col gap-2"
          >
            <h3 className="text-xl font-bold text-white">{crime.name}</h3>
            <p className="text-sm text-gray-300">⚡ الطاقة المطلوبة: {crime.energyCost}</p>
            <p className="text-sm text-gray-300">💰 المكافأة: {crime.minReward} - {crime.maxReward}$</p>
            <button
              onClick={() => commitCrime(crime.id)}
              className="mt-auto px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              تنفيذ الجريمة
            </button>
          </div>
        ))}
      </div>

      {message && <p className="mt-6 text-center text-yellow-400 font-semibold">{message}</p>}
    </div>
  );
}
