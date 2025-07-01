// frontend/src/pages/WeaponsShop.jsx
import { useEffect, useState } from 'react';

export default function WeaponsShop() {
  const [weapons, setWeapons] = useState([]);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http://localhost:5000/api/weapons', {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    })
      .then((res) => res.json())
      .then(setWeapons)
      .catch(() => setMessage('فشل تحميل الأسلحة'));
  }, []);

  const buyWeapon = async (weaponId) => {
    const res = await fetch('http://localhost:5000/api/weapons/buy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({ weaponId }),
    });
    const data = await res.json();
    setMessage(data.message || '');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-3xl mb-4 font-bold text-yellow-400">🛒 متجر الأسلحة</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {weapons.map((weapon) => (
          <div
            key={weapon.id}
            className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col gap-2"
          >
            <h3 className="text-xl font-bold text-white">{weapon.name}</h3>
            <p className="text-sm text-gray-300">🧨 النوع: {weapon.type}</p>
            <p className="text-sm text-gray-300">💥 الضرر: {weapon.damage}</p>
            <p className="text-sm text-gray-300">💰 السعر: {weapon.price}$</p>
            <p className="text-sm text-gray-400 italic">{weapon.description}</p>
            <button
              onClick={() => buyWeapon(weapon.id)}
              className="mt-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              شراء السلاح
            </button>
          </div>
        ))}
      </div>

      {message && <p className="mt-6 text-center text-red-400 font-semibold">{message}</p>}
    </div>
  );
}
