// ─────────────────────────  FRONTEND  ────────────────────────
// File: frontend/src/pages/MyGang.jsx
//--------------------------------------------------------------
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGang, myGang, leaveGang, joinGang } from '../api/gangApi.js';
import { useAuth } from '../context/HudProvider.jsx';

export default function MyGang() {
  const { id } = useParams(); // optional :id route
  const [gang, setGang] = useState(null);
  const [err, setErr] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // If id param provided, view that gang; else view my own
    const fn = id ? getGang(id) : myGang();
    fn.then(setGang).catch(() => setErr('تعذّر تحميل العصابة'));
  }, [id]);

  async function handleJoin() {
    try { await joinGang(gang._id); navigate(0); } catch (e) { setErr(e.message); }
  }
  async function handleLeave() {
    try { await leaveGang(gang._id); navigate('/gangs'); } catch (e) { setErr(e.message); }
  }

  if (err) return <p className="p-6 text-red-400">{err}</p>;
  if (!gang) return <p className="p-6 text-gray-400">تحميل…</p>;

  const amMember = gang.members.some(m => m._id === user?._id);
  const isLeader = gang.leader._id === user?._id;

  return (
    <div className="p-6 text-white space-y-6">
      <h1 className="text-2xl font-bold">{gang.name}</h1>
      <p className="text-sm text-gray-400">{gang.description || 'بدون وصف'}</p>
      <p>الزعيم: {gang.leader.username}</p>

      <h2 className="text-lg font-semibold mt-4">الأعضاء ({gang.members.length})</h2>
      <ul className="list-disc list-inside space-y-1">
        {gang.members.map(m => <li key={m._id}>{m.username}</li>)}
      </ul>

      {!amMember && <button className="btn btn-success" onClick={handleJoin}>انضمام</button>}
      {amMember && !isLeader && <button className="btn btn-error" onClick={handleLeave}>مغادرة العصابة</button>}
      {isLeader && <p className="text-sm mt-2 text-gray-400">أنت زعيم العصابة. مغادرتك ستؤدي إلى حلها.</p>}
    </div>
  );
}