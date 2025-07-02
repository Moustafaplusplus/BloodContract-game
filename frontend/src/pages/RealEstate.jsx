// File: frontend/src/pages/RealEstate.jsx
import { useEffect, useState } from 'react';

export default function RealEstate() {
  const [houses, setHouses] = useState([]);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http://localhost:5000/api/houses', {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then((res) => res.json())
      .then(setHouses)
      .catch(() => setMessage('فشل تحميل قائمة البيوت'));
  }, []);

  const buyHouse = async (houseId) => {
    const res = await fetch('http://localhost:5000/api/houses/buy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({ houseId }),
    });
    const data = await res.json();
    setMessage(data.message || '');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-3xl font-bold text-yellow-400 mb-4">🏠 سوق العقارات</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {houses.map((house) => (
          <div
            key={house.id}
            className="bg-gray-800 p-4 rounded-xl shadow-md flex flex-col gap-2"
          >
            <h3 className="text-lg font-bold">{house.name}</h3>
            <p className="text-sm text-gray-300">💰 السعر: {house.cost}$</p>
            <p className="text-sm text-gray-300">⚡ تجديد الطاقة: +{house.energyRegen}</p>
            <p className="text-sm text-gray-300">🛡️ تعزيز الدفاع: +{house.defenseBonus}</p>
            <p className="text-sm text-gray-400 text-xs">{house.description}</p>
            <button
              onClick={() => buyHouse(house.id)}
              className="mt-auto px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              شراء
            </button>
          </div>
        ))}
      </div>

      {message && <p className="mt-6 text-center text-yellow-400 font-semibold">{message}</p>}
    </div>
  );
}
