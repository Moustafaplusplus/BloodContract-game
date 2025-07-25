import React, { useState, useEffect } from 'react';

const GHOST_ASSASSIN_PRICE = 5;

const GhostAssassinForm = () => {
  const [targetId, setTargetId] = useState('');
  const [targetInfo, setTargetInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingTarget, setFetchingTarget] = useState(false);
  const [error, setError] = useState('');
  const [targetError, setTargetError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!targetId) {
      setTargetInfo(null);
      setTargetError('');
      return;
    }
    setFetchingTarget(true);
    setTargetError('');
    const token = localStorage.getItem('jwt');
    fetch(`/api/profile/${targetId}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          setTargetInfo(null);
          setTargetError('لا يوجد لاعب بهذا الرقم.');
          return;
        }
        const data = await res.json();
        setTargetInfo(data);
        setTargetError('');
      })
      .catch(() => {
        setTargetInfo(null);
        setTargetError('فشل في جلب بيانات اللاعب.');
      })
      .finally(() => setFetchingTarget(false));
  }, [targetId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const token = localStorage.getItem('jwt');
      const res = await fetch('/api/bloodcontracts/ghost-assassin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ targetId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message === 'Insufficient black coins.' ? 'لا تملك بلاك كوين كافية.' : data.message || 'حدث خطأ ما.');
      } else {
        setResult('تم تنفيذ الاغتيال بنجاح! تم نقل الهدف إلى المستشفى لمدة 30 دقيقة.');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#111',
      color: '#fff',
      border: '2px solid #c00',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '420px',
      margin: '2rem auto',
      boxShadow: '0 0 16px #c00a',
    }}>
      <h2 style={{ color: '#c00', textAlign: 'center', marginBottom: '1.5rem', fontSize: '2rem', fontWeight: 'bold' }}>
        القاتل الشبح
      </h2>
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #c00',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1.5rem',
        textAlign: 'center',
        fontSize: '1.1rem',
        color: '#fff',
      }}>
        <div style={{ color: '#c00', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          ما هو القاتل الشبح؟
        </div>
        <div>
          القاتل الشبح هو قاتل محترف يمكنك استئجاره مقابل <span style={{ color: '#f55', fontWeight: 'bold' }}>{GHOST_ASSASSIN_PRICE} بلاك كوين</span> لتنفيذ عملية اغتيال فورية لأي لاعب تختاره. سيتم نقل الهدف مباشرة إلى المستشفى لمدة 30 دقيقة دون قتال أو مقاومة.
        </div>
      </div>
      <form onSubmit={handleSubmit} style={{ display: result ? 'none' : 'block' }}>
        <label htmlFor="targetId" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          أدخل رقم اللاعب المستهدف:
        </label>
        <input
          id="targetId"
          type="number"
          value={targetId}
          onChange={e => setTargetId(e.target.value)}
          required
          min="1"
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '6px',
            border: '1px solid #c00',
            background: '#222',
            color: '#fff',
            marginBottom: '0.5rem',
            direction: 'ltr',
          }}
          placeholder="مثال: 123"
        />
        {fetchingTarget && <div style={{ color: '#aaa', marginBottom: '0.5rem' }}>جاري البحث عن اللاعب...</div>}
        {targetInfo && !targetError && (
          <div style={{
            background: '#222',
            border: '1px solid #393',
            borderRadius: '6px',
            padding: '0.5rem',
            marginBottom: '0.5rem',
            color: '#fff',
            textAlign: 'center',
          }}>
            <span style={{ color: '#0f0', fontWeight: 'bold' }}>الهدف:</span> {targetInfo.name || targetInfo.username} <span style={{ color: '#aaa' }}>(ID: {targetInfo.userId || targetInfo.id})</span>
          </div>
        )}
        {targetError && <div style={{ color: '#f55', marginBottom: '0.5rem', textAlign: 'center' }}>{targetError}</div>}
        <div style={{ marginBottom: '1rem', textAlign: 'center', color: '#f55', fontWeight: 'bold' }}>
          السعر: {GHOST_ASSASSIN_PRICE} بلاك كوين
        </div>
        <button
          type="submit"
          disabled={loading || !targetId || !!targetError || !targetInfo}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: '#c00',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
            opacity: loading || !targetId || !!targetError || !targetInfo ? 0.7 : 1,
          }}
        >
          {loading ? '...جاري التنفيذ' : 'استدعاء القاتل الشبح'}
        </button>
        {error && <div style={{ color: '#f55', marginTop: '1rem', textAlign: 'center' }}>{error}</div>}
      </form>
      {result && (
        <div style={{
          marginTop: '2rem',
          background: '#222',
          border: '1px solid #c00',
          borderRadius: '8px',
          padding: '1.5rem',
          color: '#fff',
          textAlign: 'center',
          fontSize: '1.1rem',
        }}>
          <span style={{ color: '#0f0', fontWeight: 'bold', fontSize: '1.3rem' }}>تم التنفيذ بنجاح!</span>
          <hr style={{ border: 'none', borderTop: '1px solid #c00', margin: '1rem 0' }} />
          <div style={{ whiteSpace: 'pre-line' }}>{result}</div>
        </div>
      )}
    </div>
  );
};

export default GhostAssassinForm;
