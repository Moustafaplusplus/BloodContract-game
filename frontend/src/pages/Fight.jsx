import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function Fight() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    async function executeFight() {
      try {
        const res = await axios.post(`/api/fight/${id}`, {}, {
          headers: { Authorization: 'Bearer ' + token }
        });
        setResult(res.data);
      } catch (err) {
        console.error('Fight error:', err);
      } finally {
        setLoading(false);
      }
    }

    executeFight();
  }, [id, token]);

  if (loading) return <div className="p-4">Starting fight...</div>;
  if (!result) return <div className="p-4 text-red-500">❌ Fight failed. Please try again later.</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">⚔️ نتيجة القتال</h1>
      <p><strong>🏆 الفائز:</strong> {result.winner}</p>
      <p><strong>🔁 عدد الجولات:</strong> {result.rounds}</p>
      <p><strong>💥 الضرر الكلي:</strong> {result.totalDamage}</p>

      <div className="bg-gray-900 text-green-300 p-4 rounded-md max-h-[300px] overflow-y-auto text-sm">
        {result.log.map((line, idx) => (
          <div key={idx}>{line}</div>
        ))}
      </div>
    </div>
  );
}
