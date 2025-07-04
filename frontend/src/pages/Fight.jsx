// frontend/src/pages/Fight.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function Fight() {
  const { id } = useParams();
  const nav    = useNavigate();
  const token  = localStorage.getItem('token');

  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!token) return nav('/login');

    axios
      .post(
        `${import.meta.env.VITE_API_URL}/api/fight/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .then((res) => setResult(res.data))
      .catch((e) => {
        console.error('Fight error:', e);
        setError('فشل تنفيذ القتال');
      })
      .finally(() => setLoading(false));
  }, [id, token, nav]);

  if (loading) return <div className="p-4">⏳ جاري بدء القتال…</div>;
  if (error)   return <div className="p-4 text-red-500">❌ {error}</div>;
  if (!result) return <div className="p-4 text-red-500">❌ حدث خطأ غير متوقع</div>;

  return (
    <div className="p-6 space-y-4 text-white bg-gray-950 min-h-screen">
      <h1 className="text-2xl font-bold">⚔️ نتيجة القتال</h1>

      <p><strong>🏆 الفائز:</strong> {result.winner}</p>
      <p><strong>🔁 عدد الجولات:</strong> {result.rounds}</p>
      <p><strong>💥 الضرر الكلي:</strong> {result.totalDamage}</p>

      <div className="bg-gray-900 text-green-300 p-4 rounded-md max-h-[300px] overflow-y-auto text-sm space-y-0.5">
        {result.log.map((line, idx) => (
          <div key={idx}>{line}</div>
        ))}
      </div>
    </div>
  );
}
