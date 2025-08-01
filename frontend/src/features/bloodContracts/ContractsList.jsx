import React, { useState, useEffect } from 'react';
import LoadingOrErrorPlaceholder from '@/components/LoadingOrErrorPlaceholder';
import VipName from '../profile/VipName.jsx';

function getRemainingTime(expiry) {
  const now = new Date();
  const end = new Date(expiry);
  const diff = end - now;
  if (diff <= 0) return 'انتهى';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

const ContractsList = ({ onAttack, contracts = [] }) => {
  const [tick, setTick] = useState(0);

  // Timer to update countdown every second
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  if (contracts.length === 0) {
    return <div style={{ color: '#fff', textAlign: 'center', margin: '2rem' }}>لا توجد عقود متاحة حالياً.</div>;
  }

  return (
    <div style={{
      background: '#111',
      color: '#fff',
      border: '2px solid #a00',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '800px',
      margin: '2rem auto',
      boxShadow: '0 0 16px #a00a',
    }}>
      <h2 style={{ color: '#fff', borderBottom: '1px solid #a00', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        عقود الدم
      </h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#222' }}>
            <th style={{ color: '#fff', borderBottom: '1px solid #a00', padding: '0.5rem' }}>الهدف</th>
            <th style={{ color: '#fff', borderBottom: '1px solid #a00', padding: '0.5rem' }}>الشهرة</th>
            <th style={{ color: '#fff', borderBottom: '1px solid #a00', padding: '0.5rem' }}>المستوى</th>
            <th style={{ color: '#fff', borderBottom: '1px solid #a00', padding: '0.5rem' }}>السعر</th>
            <th style={{ color: '#fff', borderBottom: '1px solid #a00', padding: '0.5rem' }}>الوقت المتبقي</th>
            <th style={{ color: '#fff', borderBottom: '1px solid #a00', padding: '0.5rem' }}>الحالة</th>
            <th style={{ color: '#fff', borderBottom: '1px solid #a00', padding: '0.5rem' }}></th>
          </tr>
        </thead>
        <tbody>
          {contracts.map(contract => (
            <tr key={contract.id} style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: '0.5rem', color: '#fff' }}><VipName user={contract.target} /></td>
              <td style={{ padding: '0.5rem', color: '#fff' }}>{contract.target?.fame}</td>
              <td style={{ padding: '0.5rem', color: '#fff' }}>{contract.target?.level}</td>
              <td style={{ padding: '0.5rem', color: '#fff' }}>${contract.price}</td>
              <td style={{ padding: '0.5rem', color: '#fff' }}>{getRemainingTime(contract.expiresAt)}</td>
              <td style={{ padding: '0.5rem', color: '#fff' }}>
                {contract.isPoster ? 'صاحب العقد' : contract.isTarget ? 'هدف العقد' : 'متاح'}
              </td>
              <td style={{ padding: '0.5rem' }}>
                {contract.canFulfill && (
                  <button
                    style={{
                      background: '#a00',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.5rem 1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                    onClick={() => onAttack(contract)}
                  >
                    هجوم
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContractsList; 