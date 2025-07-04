import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const token = localStorage.getItem('token');
  const api   = `${import.meta.env.VITE_API_URL}/api/inventory`;

  /* fetch inventory */
  const fetchItems = async () => {
    try {
      const res = await axios.get(api, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    }
  };

  useEffect(() => { fetchItems(); }, [api, token]);

  /* equip / unequip */
  const toggleEquip = (it) => async () => {
    const url = it.equipped
      ? `${api}/unequip/${it.type}`
      : `${api}/equip/${it.type}/${it.id}`;

    try {
      await axios.post(
        url,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchItems();
    } catch (err) {
      console.error('Equip error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 space-y-6">
      <h1 className="text-2xl font-bold">🎒 حقيبة المعدات</h1>

      {items.length === 0 ? (
        <p className="text-gray-400">لا تملك أي معدات بعد.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((it) => (
            <div
              key={`${it.type}-${it.id}`}
              className={`p-4 rounded ${
                it.equipped ? 'bg-emerald-800' : 'bg-gray-800'
              } flex justify-between items-center`}
            >
              <div>
                <p className="font-semibold">
                  {it.type === 'weapon' ? '🗡️' : '🛡️'} {it.name}
                  {it.rarity === 'legendary' && ' ✨'}
                </p>
                <p className="text-sm text-gray-300">
                  {it.type === 'weapon'
                    ? `قوة: ${it.str ?? it.damage ?? 0}`
                    : `دفاع: ${it.def ?? 0}`}
                </p>
              </div>

              <button
                onClick={toggleEquip(it)}
                className={`px-3 py-1 rounded ${
                  it.equipped
                    ? 'bg-red-600 hover:bg-red-500'
                    : 'bg-green-600 hover:bg-green-500'
                }`}
              >
                {it.equipped ? 'إلغاء' : 'تجهيز'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
