// frontend/src/pages/Bank.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Bank() {
  const [balance, setBalance] = useState(null);
  const [amount, setAmount]   = useState(0);
  const [msg, setMsg]         = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const api = `${import.meta.env.VITE_API_URL}/api/bank`;

  const fetchBalance = () =>
    fetch(api, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((d) => setBalance(d.balance));

  useEffect(() => {
    if (!token) navigate('/login');
    else fetchBalance();
  }, [token, navigate]);

  const handle = (type) => async () => {
    const res = await fetch(`${api}/${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount: Number(amount) }),
    });
    if (!res.ok) {
      setMsg('❌ العملية فشلت');
      return;
    }
    const d = await res.json();
    setBalance(d.balance);
    setAmount(0);
    setMsg(type === 'deposit' ? '✅ تم الإيداع' : '✅ تم السحب');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold text-yellow-400">🏦 البنك</h1>

      {balance === null ? (
        <p className="text-gray-400">تحميل الرصيد…</p>
      ) : (
        <>
          <p className="text-lg">رصيدك الحالي: <span className="font-bold">{balance}</span> 💵</p>

          <label className="block mt-4">
            المبلغ:
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full bg-gray-800 p-2 rounded"
              min="1"
            />
          </label>

          <div className="flex gap-4 mt-4">
            <button
              onClick={handle('deposit')}
              className="flex-1 bg-green-600 hover:bg-green-500 px-4 py-2 rounded disabled:opacity-40"
              disabled={amount <= 0}
            >
              إيداع
            </button>
            <button
              onClick={handle('withdraw')}
              className="flex-1 bg-red-600 hover:bg-red-500 px-4 py-2 rounded disabled:opacity-40"
              disabled={amount <= 0}
            >
              سحب
            </button>
          </div>

          {msg && <p className="mt-4 text-green-400">{msg}</p>}
        </>
      )}
    </div>
  );
}
