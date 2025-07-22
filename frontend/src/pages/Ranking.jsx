import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TABS = [
  { key: 'fame', label: 'Fame' },
  { key: 'level', label: 'Level' },
  { key: 'money', label: 'Money' },
  { key: 'killCount', label: 'Kills' },
  { key: 'crimesCommitted', label: 'Crimes' },
];

const columns = {
  fame: [
    { key: 'ranking', label: '#' },
    { key: 'name', label: 'Name' },
    { key: 'criteria', label: 'Fame' },
  ],
  level: [
    { key: 'ranking', label: '#' },
    { key: 'name', label: 'Name' },
    { key: 'criteria', label: 'Level' },
  ],
  money: [
    { key: 'ranking', label: '#' },
    { key: 'name', label: 'Name' },
    { key: 'criteria', label: 'Money' },
  ],
  killCount: [
    { key: 'ranking', label: '#' },
    { key: 'name', label: 'Name' },
    { key: 'criteria', label: 'Kills' },
  ],
  crimesCommitted: [
    { key: 'ranking', label: '#' },
    { key: 'name', label: 'Name' },
    { key: 'criteria', label: 'Crimes' },
  ],
};

function Ranking() {
  const [activeTab, setActiveTab] = useState('fame');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(`/api/ranking?sort=${activeTab}&limit=50`)
      .then(res => {
        setPlayers(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load rankings');
        setLoading(false);
      });
  }, [activeTab]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-black min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-red-600 drop-shadow">Player Rankings</h1>
      <div className="flex justify-center mb-8">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 mx-2 rounded-t-lg font-bold text-lg transition-colors duration-200 border-b-4 focus:outline-none ${activeTab === tab.key ? 'bg-red-700 text-white border-red-600 shadow-lg' : 'bg-gray-900 text-red-400 border-transparent hover:bg-red-900 hover:text-white'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-gray-900 shadow-2xl rounded-lg overflow-x-auto border-2 border-red-700">
        {loading ? (
          <div className="p-8 text-center text-red-400">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <table className="min-w-full divide-y divide-red-700">
            <thead className="bg-red-900">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-extrabold text-red-300">#</th>
                {columns[activeTab].map(col => (
                  <th key={col.key} className="px-4 py-2 text-left text-xs font-extrabold text-red-300">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.map((player, idx) => (
                <tr key={player.ranking} className={idx % 2 === 0 ? 'bg-black' : 'bg-gray-900'}>
                  {columns[activeTab].map(col => (
                    <td key={col.key} className="px-4 py-2 text-white font-bold">
                      {player[col.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Ranking;
