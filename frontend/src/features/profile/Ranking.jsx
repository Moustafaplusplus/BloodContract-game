import { useState, useEffect } from 'react';
import axios from 'axios';
import VipName from './VipName.jsx';
import MoneyIcon from '@/components/MoneyIcon';
import './vipSparkle.css';

const METRICS = [
  { value: 'level', label: 'المستوى', backend: true },
  { value: 'fame', label: 'الشهرة', backend: false },
  { value: 'money', label: 'المال', backend: true },
  { value: 'crimesCommitted', label: 'عدد الجرائم', backend: false },
  { value: 'killCount', label: 'عدد القتل', backend: false },
];

export default function Ranking() {
  const [activeTab, setActiveTab] = useState('level');
  const [playersByMetric, setPlayersByMetric] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (playersByMetric[activeTab]) return; // Already loaded
    let cancel;
    setLoading(true);
    setError('');
    const fetchPlayers = async () => {
      try {
        let data = [];
        const metric = activeTab;
        const selectedMetric = METRICS.find(m => m.value === metric);
        if (selectedMetric && selectedMetric.backend) {
          const params = { metric, limit: 50 };
          const res = await axios.get('/api/v1/search/top-players', { params, cancelToken: new axios.CancelToken(c => cancel = c) });
          data = res.data;
        } else {
          let sort = metric === 'killCount' ? 'killCount' : 'level';
          const params = { sort, limit: 50 };
          const res = await axios.get('/api/v1/search/users', { params, cancelToken: new axios.CancelToken(c => cancel = c) });
          data = res.data;
          if (metric === 'fame') {
            data = [...data].sort((a, b) => (b.fame || 0) - (a.fame || 0));
          } else if (metric === 'crimesCommitted') {
            data = [...data].sort((a, b) => (b.crimesCommitted || 0) - (a.crimesCommitted || 0));
          } else if (metric === 'killCount') {
            data = [...data].sort((a, b) => (b.killCount || 0) - (a.killCount || 0));
          }
        }
        setPlayersByMetric(prev => ({ ...prev, [metric]: data.slice(0, 50) }));
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError('فشل تحميل قائمة اللاعبين');
        setPlayersByMetric(prev => ({ ...prev, [activeTab]: [] }));
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
    return () => cancel && cancel();
    // eslint-disable-next-line
  }, [activeTab]);

  const players = playersByMetric[activeTab] || [];

  return (
    <div className="min-h-screen bg-black text-white p-4 pt-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bouya mb-2 text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-red-400 to-accent-red animate-glow">🏆 تصنيف اللاعبين</h1>
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-accent-red to-transparent mx-auto mb-6"></div>
        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {METRICS.map(m => (
            <button
              key={m.value}
              className={`px-4 py-2 rounded-t-lg font-bold transition-all duration-200 border-b-4 ${activeTab === m.value ? 'bg-hitman-900 border-accent-red text-accent-red shadow-lg' : 'bg-hitman-800 border-transparent text-hitman-300 hover:bg-hitman-700'}`}
              onClick={() => setActiveTab(m.value)}
            >
              {m.label}
            </button>
          ))}
        </div>
        {error && <div className="text-center py-4 text-red-400 text-lg animate-fade-in">{error}</div>}
        {loading ? (
          <div className="text-center py-8 text-lg animate-pulse">جاري التحميل...</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-accent-red/30 bg-hitman-900/60">
            <table className="min-w-full text-center">
              <thead>
                <tr className="bg-hitman-900 text-accent-red">
                  <th className="py-2 px-2">#</th>
                  <th className="py-2 px-2">اللاعب</th>
                  <th className="py-2 px-2">المستوى</th>
                  <th className="py-2 px-2">الشهرة</th>
                  <th className="py-2 px-2">المال</th>
                  <th className="py-2 px-2">الجرائم</th>
                  <th className="py-2 px-2">القتل</th>
                </tr>
              </thead>
              <tbody>
                {players.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-hitman-400">لا يوجد نتائج</td></tr>
                )}
                {players.map((player, idx) => {
                  let rowClass = '';
                  let nameClass = 'font-bouya text-lg';
                  let placeColor = '';
                  if (idx === 0) {
                    rowClass = 'bg-gradient-to-r from-yellow-900/30 to-yellow-800/10';
                    nameClass += ' text-yellow-400 text-2xl drop-shadow-lg';
                    placeColor = 'text-yellow-400 font-extrabold text-2xl';
                  } else if (idx === 1) {
                    rowClass = 'bg-gradient-to-r from-gray-400/20 to-gray-700/10';
                    nameClass += ' text-gray-300 text-xl drop-shadow';
                    placeColor = 'text-gray-300 font-bold text-xl';
                  } else if (idx === 2) {
                    rowClass = 'bg-gradient-to-r from-amber-700/20 to-amber-900/10';
                    nameClass += ' text-amber-400 text-lg drop-shadow';
                    placeColor = 'text-amber-400 font-bold text-lg';
                  } else {
                    rowClass = '';
                    nameClass = 'font-bouya text-lg';
                    placeColor = 'text-accent-red font-bold';
                  }
                  return (
                    <tr key={player.userId || player.id || idx} className={`border-b border-accent-red/10 hover:bg-hitman-800/40 transition ${rowClass}`}>
                      <td className={`py-2 px-2 ${placeColor}`}>{idx + 1}</td>
                      <td className={`py-2 px-2 flex items-center gap-2 justify-center`}>
                        <a
                          href={player.username ? `/dashboard/profile/${player.username}` : '/dashboard/profile'}
                          className={nameClass + ' hover:underline'}
                        >
                          <VipName user={player} disableLink={true} />
                        </a>
                      </td>
                      <td className="py-2 px-2">{player.level ?? '-'}</td>
                      <td className="py-2 px-2">{player.fame ?? '-'}</td>
                      <td className="py-2 px-2 flex items-center justify-center gap-1">
                        <MoneyIcon className="w-4 h-4" />
                        {player.money ? player.money.toLocaleString() : '-'}
                      </td>
                      <td className="py-2 px-2">{player.crimesCommitted ?? '-'}</td>
                      <td className="py-2 px-2">{player.killCount ?? '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 