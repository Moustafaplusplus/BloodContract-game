// frontend/src/pages/Hospital.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Hospital() {
  const [seconds, setSeconds] = useState(0);
  const [hpLost,  setHpLost]  = useState(0);
  const [msg,     setMsg]     = useState('');

  const token = localStorage.getItem('token');
  const api   = `${import.meta.env.VITE_API_URL}/api/hospital`;
  const nav   = useNavigate();

  /* fetch status once */
  useEffect(() => {
    fetch(`${api}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (!d.inHospital) {
          setMsg('❌ لست في المستشفى');
          return;
        }
        setSeconds(d.remaining);
        setHpLost(d.hpLost);
      });
  }, [api, token]);

  /* countdown */
  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1));
    }, 1_000);
    return () => clearInterval(id);
  }, []);

  const payDoctor = async () => {
    const res = await fetch(`${api}/heal`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const d = await res.json();
    setMsg(d.message);
    if (res.ok) setSeconds(0);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 space-y-5">
      <h1 className="text-3xl font-bold text-rose-400">🏥 المستشفى</h1>

      {seconds > 0 ? (
        <>
          <p>🩸 فقدت {hpLost} صحة</p>
          <p className="text-lg text-yellow-300">
            ⏳ الوقت المتبقي: {seconds} ثانية
          </p>
          <button
            onClick={payDoctor}
            className="bg-rose-600 hover:bg-rose-500 px-4 py-2 rounded"
          >
            💰 ادفع للطبيب (200$)
          </button>
        </>
      ) : (
        <>
          <p className="text-green-400">✅ تم شفاؤك بالكامل!</p>
          <button
            onClick={() => nav('/dashboard')}
            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded"
          >
            عودة إلى لوحة التحكم
          </button>
        </>
      )}

      {msg && <p className="text-sm text-gray-300">{msg}</p>}
    </div>
  );
}
