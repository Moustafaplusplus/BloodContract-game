// frontend/src/pages/Jail.jsx
import { useEffect, useState } from 'react';

export default function Jail() {
  const [seconds, setSeconds] = useState(0);
  const [msg, setMsg] = useState('');

  const token = localStorage.getItem('token');
  const api = `${import.meta.env.VITE_API_URL}/api/jail`;

  useEffect(() => {
    fetch(`${api}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (!data.inJail) {
          setMsg('❌ لست في السجن');
          return;
        }
        setSeconds(data.remaining);
      });
  }, [api, token]);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const bail = async () => {
    const res = await fetch(`${api}/bail`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) return setMsg(data.message);
    setMsg(data.message);
    setSeconds(0);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 space-y-4">
      <h1 className="text-3xl font-bold">🚔 أنت في السجن</h1>

      {seconds > 0 ? (
        <p className="text-lg text-red-400">الوقت المتبقي: {seconds} ثانية</p>
      ) : (
        <p className="text-green-400">✅ تم الإفراج عنك!</p>
      )}

      <button
        onClick={bail}
        disabled={seconds === 0}
        className="bg-yellow-600 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded disabled:opacity-50"
      >
        💰 دفع كفالة (250$)
      </button>

      {msg && <p className="text-sm text-gray-300">{msg}</p>}
    </div>
  );
}
