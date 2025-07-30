import React, { useEffect, useState } from 'react';
import { Sword, Zap, Target, Trophy } from 'lucide-react';
import LoadingOrErrorPlaceholder from '@/components/LoadingOrErrorPlaceholder';
import VipName from '../profile/VipName.jsx';

const AttackResultModal = ({ open, onClose, success, reward, posterName, message, fightResult }) => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!open) return;
    if (!fightResult) return;
    if (step < (fightResult.log?.length || 0)) {
      const timer = setTimeout(() => setStep(s => s + 1), 1200);
      return () => clearTimeout(timer);
    }
  }, [open, fightResult, step]);

  useEffect(() => {
    if (!open) setStep(0);
  }, [open]);

  if (!open) return null;

  // Loading state
  if (!fightResult) {
    return <LoadingOrErrorPlaceholder loading loadingText="جاري تجهيز القتال..." />;
  }

  // Fight result display
  const { winner, rounds, log, narrative } = fightResult;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: '#111', color: '#fff', border: '2px solid #a00', borderRadius: '12px', padding: '2rem', minWidth: '340px', maxWidth: '700px', boxShadow: '0 0 16px #a00a', textAlign: 'center', position: 'relative', direction: 'rtl',
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}
        >×</button>
        <div style={{ marginBottom: '1.5rem' }}>
          <Sword style={{ color: '#a00', width: 48, height: 48, marginBottom: 8 }} />
          <h2 style={{ color: success ? '#0f5' : '#f55', fontSize: 28, marginBottom: 8 }}>
            {success ? 'تم تنفيذ العقد!' : 'فشل الهجوم'}
          </h2>
        </div>
        {/* Fight log animation */}
        <div style={{ background: '#222', borderRadius: 8, padding: 12, marginBottom: 16, maxHeight: 180, overflowY: 'auto', textAlign: 'right' }}>
          <div style={{ color: '#a00', fontWeight: 'bold', marginBottom: 8 }}>سجل القتال:</div>
          <ul style={{ direction: 'rtl', paddingRight: 16, margin: 0 }}>
            {log && log.length > 0 ? (
              log.slice(0, step).map((line, i) => <li key={i} style={{ marginBottom: 4 }}>{line}</li>)
            ) : (
              <li style={{ color: '#aaa' }}>لا يوجد تفاصيل</li>
            )}
          </ul>
        </div>
        {/* Show winner, rounds, narrative after log is done */}
        {step >= (log?.length || 0) && (
          <>
            <div style={{ marginBottom: 12 }}>
              <b>الفائز:</b> <VipName user={winner} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <b>الجولات:</b> {rounds}
            </div>
            {narrative && (
              <div style={{ background: '#191919', borderRadius: 8, padding: 10, marginBottom: 12, color: '#fff' }}>
                <b>النص السردي:</b> {narrative}
              </div>
            )}
            {success && (
              <>
                <div style={{ marginBottom: 16 }}><b>المكافأة:</b> ${reward}</div>
              </>
            )}
            {message && <div style={{ color: '#f55', marginBottom: '1rem' }}>{message}</div>}
            <button
              onClick={onClose}
              style={{ background: '#a00', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.75rem 1.5rem', fontWeight: 'bold', cursor: 'pointer', width: '100%', fontSize: 18 }}
            >إغلاق</button>
          </>
        )}
      </div>
    </div>
  );
};

export default AttackResultModal; 