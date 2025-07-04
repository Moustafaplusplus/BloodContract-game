// ─────────────────────────  FRONTEND  ────────────────────────
// File: frontend/src/pages/GangsList.jsx
//--------------------------------------------------------------
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GangCard from '../components/GangCard.jsx';
import { listGangs, createGang } from '../api/gangApi.js';

export default function GangsList() {
  const [gangs, setGangs] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    listGangs().then(setGangs).catch(() => setErr('تعذّر جلب العصابات'));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const gang = await createGang({ name, description });
      navigate(`/gangs/${gang._id}`);
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="p-6 space-y-6 text-white">
      <h1 className="text-2xl font-bold mb-4">👥 قائمة العصابات</h1>

      <form onSubmit={handleCreate} className="space-y-2 max-w-md">
        <input value={name} onChange={e=>setName(e.target.value)}
               className="input input-bordered w-full" placeholder="اسم العصابة" required />
        <textarea value={description} onChange={e=>setDescription(e.target.value)}
               className="textarea textarea-bordered w-full" placeholder="وصف مختصر" />
        <button className="btn btn-primary w-full">إنشاء عصابة</button>
      </form>

      {err && <p className="text-red-400">{err}</p>}

      <div className="grid md:grid-cols-3 gap-4">
        {gangs.map(g => (
          <GangCard key={g._id} gang={g} onClick={()=>navigate(`/gangs/${g._id}`)} />
        ))}
      </div>
    </div>
  );
}
