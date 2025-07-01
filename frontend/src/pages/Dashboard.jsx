import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [crimes, setCrimes] = useState([]);
  const [stats, setStats] = useState({});
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;

    fetch('http://localhost:5000/api/crimes', {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    })
      .then((res) => res.json())
      .then(setCrimes)
      .catch(() => setMessage('فشل تحميل الجرائم'));

    // TODO: Fetch stats when user data API is ready
    setStats({ energy: 100, money: 0, level: 1 });
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
    setMessage(data.success ? `نجحت وحصلت على ${data.reward}$` : 'فشلت المحاولة!');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-3xl mb-4 font-bold text-red-500">لوحة التحكم</h1>

      <div className="mb-6 bg-gray-800 p-4 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-2">إحصائيات اللاعب</h2>
        <p>الطاقة: {stats.energy}</p>
        <p>المال: {stats.money}$</p>
        <p>المستوى: {stats.level}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {crimes.map((crime) => (
          <div
            key={crime.id}
            className="p-4 bg-gray-800 rounded-xl shadow-md flex flex-col gap-2"
          >
            <h3 className="text-lg font-semibold text-white">{crime.name}</h3>
            <p className="text-sm text-gray-300">الطاقة المطلوبة: {crime.energyCost}</p>
            <button
              onClick={() => commitCrime(crime.id)}
              className="mt-auto px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              تنفيذ الجريمة
            </button>
          </div>
        ))}
      </div>

      {message && <p className="mt-4 text-red-400">{message}</p>}
    </div>
  );
}
