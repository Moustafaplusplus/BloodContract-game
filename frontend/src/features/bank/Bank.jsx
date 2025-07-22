/* ========================================================================
 *  Bank.jsx – synced with new backend (balance + money)
 * =======================================================================*/
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";
import { useHud } from "@/hooks/useHud";
import { useSocket } from "@/hooks/useSocket";
import { Banknote, ArrowDownToLine, ArrowUpToLine } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

export default function Bank() {
  const { token } = useAuth();
  const { stats, invalidateHud, loading } = useHud();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [balance, setBalance] = useState(null);
  const [amount, setAmount] = useState("");
  const [loadingTx, setLoadingTx] = useState(false);

  // Fetch bank balance on mount and after tx
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetch(`${API}/api/bank`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to fetch"))))
      .then(({ balance }) => setBalance(balance))
      .catch(() => {
        setBalance(0);
        toast.error("لا يمكن الاتصال بالخادم - يتم عرض بيانات وهمية");
      });
  }, [token, navigate]);

  // Real-time updates for bank balance
  useEffect(() => {
    if (!socket) return;
    const fetchBalance = () => {
      fetch(`${API}/api/bank`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to fetch"))))
        .then(({ balance }) => setBalance(balance))
        .catch((error) => {
          setBalance(0);
        });
    };
    socket.on('bank:update', fetchBalance);
    const pollInterval = setInterval(fetchBalance, 10000);
    return () => {
      socket.off('bank:update', fetchBalance);
      clearInterval(pollInterval);
    };
  }, [socket, token]);

  // Validate amount
  const amt = Number(amount);
  const canDeposit =
    amt > 0 && stats && amt <= stats.money && !loadingTx && !loading;
  const canWithdraw =
    amt > 0 && balance !== null && amt <= balance && !loadingTx && !loading;

  // Transaction handler
  const tx = async (type) => {
    if (!amt || amt <= 0) {
      toast.error("أدخل قيمة صحيحة");
      return;
    }
    setLoadingTx(true);
    try {
      const res = await fetch(`${API}/api/bank/${type}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: amt }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { balance: newBalance } = await res.json();
      setBalance(newBalance);
      setAmount("");
      invalidateHud?.();
      toast.success(
        type === "deposit"
          ? `تم إيداع ${amt}$ في البنك`
          : `تم سحب ${amt}$ من البنك`
      );
    } catch (err) {
      toast.error(err.message || "فشل العملية");
    } finally {
      setLoadingTx(false);
    }
  };

  // Banner and main layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
      {/* Banner Placeholder */}
      <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-10 flex items-center justify-center bg-gradient-to-br from-accent-red/40 to-black/60 border-2 border-accent-red animate-fade-in">
        <img src="/placeholder-bank-banner.png" alt="Bank Banner" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="relative z-10 text-center">
          <Banknote className="w-16 h-16 mx-auto text-accent-red mb-2 animate-bounce" />
          <h1 className="text-4xl font-bouya mb-2 text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-red-400 to-accent-red animate-glow">البنك</h1>
          <p className="text-hitman-300 text-lg">احفظ أموالك بأمان واسحبها وقت الحاجة</p>
        </div>
      </div>

      {/* Balances */}
      <div className="max-w-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 border border-hitman-700 rounded-2xl p-6 flex flex-col items-center shadow-lg animate-fade-in">
          <div className="text-accent-red text-2xl font-bold mb-2">رصيد البنك</div>
          <div className="text-3xl font-mono text-accent-red">{balance !== null ? `${balance}$` : "..."}</div>
        </div>
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 border border-hitman-700 rounded-2xl p-6 flex flex-col items-center shadow-lg animate-fade-in">
          <div className="text-accent-green text-2xl font-bold mb-2">النقود</div>
          <div className="text-3xl font-mono text-accent-green">{stats ? `${stats.money}$` : "..."}</div>
        </div>
      </div>

      {/* Transaction Form */}
      <div className="max-w-xl mx-auto bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 border border-hitman-700 rounded-2xl p-8 shadow-lg animate-fade-in">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold mb-2 text-accent-red">إيداع / سحب</h2>
          <p className="text-hitman-300">أدخل المبلغ الذي تريد إيداعه أو سحبه من البنك. لا يمكنك إيداع أكثر من نقودك أو سحب أكثر من رصيدك البنكي.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-6">
          <label className="flex-1">
            <span className="block text-sm mb-1">المبلغ</span>
            <input
              type="number"
              min="1"
              value={amount}
              disabled={loadingTx || loading}
              onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-full rounded border p-2 bg-zinc-900 border-zinc-700 text-white text-center text-lg font-bold"
              placeholder="0"
              dir="rtl"
            />
          </label>
          <button
            disabled={!canDeposit}
            onClick={() => tx("deposit")}
            className="w-full md:w-40 py-3 px-6 rounded-lg font-bold transition-all duration-300 flex items-center justify-center bg-gradient-to-r from-accent-red to-red-700 hover:from-red-600 hover:to-red-800 text-white transform hover:scale-105 hover:shadow-lg disabled:opacity-60"
          >
            <ArrowDownToLine className="w-5 h-5 ml-2" />
            {loadingTx ? "..." : "إيداع"}
          </button>
          <button
            disabled={!canWithdraw}
            onClick={() => tx("withdraw")}
            className="w-full md:w-40 py-3 px-6 rounded-lg font-bold transition-all duration-300 flex items-center justify-center bg-gradient-to-r from-accent-green to-green-700 hover:from-green-600 hover:to-green-800 text-white transform hover:scale-105 hover:shadow-lg disabled:opacity-60"
          >
            <ArrowUpToLine className="w-5 h-5 ml-2" />
            {loadingTx ? "..." : "سحب"}
          </button>
        </div>
        <div className="text-center text-sm text-hitman-300 mt-8">
          <span className="text-accent-red">لا يمكنك إيداع أكثر من نقودك أو سحب أكثر من رصيدك البنكي.</span>
        </div>
      </div>
    </div>
  );
}
