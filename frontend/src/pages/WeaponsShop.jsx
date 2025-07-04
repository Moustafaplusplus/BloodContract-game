import { useEffect, useState } from 'react';
import axios from 'axios';

export default function WeaponsShop() {
  const [weapons, setWeapons] = useState([]);
  const [msg, setMsg] = useState('');
  const token = localStorage.getItem('token');
  const api   = `${import.meta.env.VITE_API_URL}`;

  /* fetch list once */
  useEffect(() => {
    axios
      .get(`${api}/api/shop/weapons`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setWeapons(res.data))
      .catch(() => setMsg('فشل تحميل الأسلحة'));
  }, [api, token]);

  /* buy weapon -> POST /api/shop/buy/weapon/:id */
  const buyWeapon = (weaponId) => async () => {
    try {
      const res = await axios.post(
        `${api}/api/shop/buy/weapon/${weaponId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMsg(res.data.message || 'تم الشراء');
    } catch (err) {
      setMsg(
        err.response?.data?.message || 'تعذر إتمام عملية الشراء',
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 space-y-6">
      <h1 className="text-3xl mb-4 font-bold text-yellow-400">🛒 متجر الأسلحة</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {weapons.map((w) => (
          <div
            key={w.id}
            className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col gap-2"
          >
            <h3 className="text-xl font-bold">{w.name}</h3>
            <p className="text-sm text-gray-300">🧨 النوع: {w.type}</p>
            <p className="text-sm text-gray-300">💥 الضرر: {w.damage}</p>
            <p className="text-sm text-gray-300">💰 السعر: {w.price}$</p>
            <p className="text-sm text-gray-400 italic">{w.description}</p>
            <button
              onClick={buyWeapon(w.id)}
              className="mt-auto px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
            >
              شراء
            </button>
          </div>
        ))}
      </div>

      {msg && (
        <p className="mt-6 text-center text-red-400 font-semibold">{msg}</p>
      )}
    </div>
  );
}
