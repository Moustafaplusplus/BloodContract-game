import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const CreateContract = ({ currentUserId, onContractCreated }) => {
  const [targetId, setTargetId] = useState('');
  const [targetUsername, setTargetUsername] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!targetId || isNaN(targetId)) {
      setTargetUsername('');
      setUsernameError('');
      return;
    }
    setUsernameLoading(true);
    setUsernameError('');
    setTargetUsername('');
    fetch(`/api/users/${targetId}`)
      .then(res => res.json())
      .then(data => {
        if (data.username) {
          // Use character name if available, otherwise use username
          setTargetUsername(data.character?.name || data.username);
        } else {
          setUsernameError('المستخدم غير موجود.');
        }
      })
      .catch(() => setUsernameError('فشل جلب اسم المستخدم.'))
      .finally(() => setUsernameLoading(false));
  }, [targetId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!targetId || !price) {
      setError('يرجى تعبئة جميع الحقول.');
      return;
    }
    if (targetId === currentUserId) {
      setError('لا يمكنك استهداف نفسك.');
      return;
    }
    if (isNaN(price) || Number(price) <= 0) {
      setError('يجب أن يكون السعر رقماً موجباً.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      const res = await fetch('/api/bloodcontracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ targetId: Number(targetId), price: Number(price) }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.message?.includes('لا يمكن وضع عقد دم على هذا اللاعب لأنه محمي من الهجمات حالياً')) {
          toast.error('🛡️ لا يمكن وضع عقد دم على هذا اللاعب لأنه محمي من الهجمات حالياً.');
        } else {
          setError(data.message || 'فشل إنشاء العقد.');
        }
      } else {
        setSuccess('تم إنشاء العقد بنجاح!');
        setTargetId('');
        setPrice('');
        if (onContractCreated) onContractCreated();
      }
    } catch {
      setError('حدث خطأ أثناء الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#111',
      color: '#fff',
      border: '2px solid #a00',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '400px',
      margin: '2rem auto',
      boxShadow: '0 0 16px #a00a',
    }}>
      <h2 style={{ color: '#fff', borderBottom: '1px solid #a00', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        إنشاء عقد دم
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: '#fff' }}>معرّف اللاعب المستهدف</label>
          <input
            type="text"
            value={targetId}
            onChange={e => setTargetId(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid #a00',
              background: '#222',
              color: '#fff',
              marginTop: '0.25rem',
            }}
            disabled={loading}
          />
          {usernameLoading && <div style={{ color: '#aaa', marginTop: '0.5rem' }}>جاري البحث عن الاسم...</div>}
          {targetUsername && !usernameError && (
            <div style={{ color: '#0f5', marginTop: '0.5rem' }}>اسم اللاعب: {targetUsername}</div>
          )}
          {usernameError && <div style={{ color: '#f55', marginTop: '0.5rem' }}>{usernameError}</div>}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: '#fff' }}>السعر</label>
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid #a00',
              background: '#222',
              color: '#fff',
              marginTop: '0.25rem',
            }}
            disabled={loading}
          />
        </div>
        {error && <div style={{ color: '#f55', marginBottom: '1rem' }}>{error}</div>}
        {success && <div style={{ color: '#0f5', marginBottom: '1rem' }}>{success}</div>}
        <button
          type="submit"
          style={{
            background: '#a00',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '0.75rem 1.5rem',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            width: '100%',
          }}
          disabled={loading}
        >
          {loading ? 'جاري الإنشاء...' : 'تأكيد العقد'}
        </button>
      </form>
    </div>
  );
};

export default CreateContract; 