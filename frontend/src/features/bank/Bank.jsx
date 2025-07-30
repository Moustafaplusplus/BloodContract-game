/* ========================================================================
 *  Bank.jsx – synced with new backend (balance + money)
 *  Enhanced UI for mobile-first responsiveness and dark theme polish
 * =======================================================================*/
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";
import { useHud } from "@/hooks/useHud";
import { useSocket } from "@/hooks/useSocket";
import { Banknote, ArrowDownToLine, ArrowUpToLine, TrendingUp } from "lucide-react";
import MoneyIcon from "@/components/MoneyIcon";

const API = import.meta.env.VITE_API_URL;

export default function Bank() {
  const { token } = useAuth();
  const { stats, invalidateHud, loading } = useHud();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [balance, setBalance] = useState(null);
  const [amount, setAmount] = useState("");
  const [loadingTx, setLoadingTx] = useState(false);
  const [tab, setTab] = useState("account");
  const [interestRows, setInterestRows] = useState(null);

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

  useEffect(() => {
    if (!socket) return;
    const fetchBalance = () => {
      fetch(`${API}/api/bank`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to fetch"))))
        .then(({ balance }) => setBalance(balance))
        .catch(() => setBalance(0));
    };
    socket.on('bank:update', fetchBalance);
    const pollInterval = setInterval(fetchBalance, 10000);
    return () => {
      socket.off('bank:update', fetchBalance);
      clearInterval(pollInterval);
    };
  }, [socket, token]);

  useEffect(() => {
    if (tab !== "interest" || !token) return;
    setInterestRows(null);
    fetch(`${API}/api/bank/history`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to fetch"))))
      .then((data) => setInterestRows((Array.isArray(data) ? data : []).slice(0, 30)))
      .catch(() => {
        setInterestRows([]);
        toast.error("لا يمكن الاتصال بالخادم");
      });
  }, [tab, token]);

  const amt = Number(amount);
  const canDeposit = amt > 0 && stats && amt <= stats.money && !loadingTx && !loading;
  const canWithdraw = amt > 0 && balance !== null && amt <= balance && !loadingTx && !loading;

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-hitman-950 via-black to-hitman-900 text-white px-4 py-6 md:py-10">
      <div className="relative w-full h-40 sm:h-48 md:h-64 rounded-xl overflow-hidden mb-8 flex items-center justify-center bg-gradient-to-br from-accent-red/40 to-black/60 border border-accent-red shadow-xl">
        <img src="/placeholder-bank-banner.png" alt="Bank Banner" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="relative z-10 text-center space-y-2">
          <Banknote className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-accent-red animate-bounce" />
          <h1 className="text-3xl sm:text-4xl font-bouya text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-red-400 to-accent-red animate-glow">البنك</h1>
          <p className="text-hitman-300 text-base sm:text-lg">احفظ أموالك بأمان واسحبها وقت الحاجة</p>
        </div>
      </div>

      <div className="flex justify-center gap-2 mb-6 text-center">
        <button
          className={`flex-1 py-2 rounded-t-xl font-bold text-base sm:text-lg transition-all border-b-4 ${tab === "account" ? "border-accent-red bg-hitman-900 text-accent-red" : "border-transparent bg-hitman-800 text-hitman-300 hover:text-accent-red"}`}
          onClick={() => setTab("account")}
        >
          الحساب البنكي
        </button>
        <button
          className={`flex-1 py-2 rounded-t-xl font-bold text-base sm:text-lg transition-all border-b-4 ${tab === "interest" ? "border-accent-green bg-hitman-900 text-accent-green" : "border-transparent bg-hitman-800 text-hitman-300 hover:text-accent-green"}`}
          onClick={() => setTab("interest")}
        >
          سجل الفوائد
        </button>
      </div>

      {tab === "account" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-hitman-900/70 border border-hitman-700 rounded-xl p-4 sm:p-6 flex flex-col items-center text-center shadow-lg">
              <span className="text-accent-red text-xl sm:text-2xl font-bold">رصيد البنك</span>
              <span className="text-2xl sm:text-3xl font-mono text-accent-red mt-1">{balance !== null ? `${balance}` : "..."}</span>
            </div>
            <div className="bg-hitman-900/70 border border-hitman-700 rounded-xl p-4 sm:p-6 flex flex-col items-center text-center shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <MoneyIcon className="w-10 h-10" />
                <span className="text-accent-green text-xl sm:text-2xl font-bold">النقود</span>
              </div>
              <span className="text-2xl sm:text-3xl font-mono text-accent-green mt-1">{stats ? `${stats.money}` : "..."}</span>
            </div>
          </div>

          <div className="bg-hitman-900/70 border border-hitman-700 rounded-xl p-6 sm:p-8 shadow-lg space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-accent-red">إيداع / سحب</h2>
              <p className="text-hitman-300 text-sm sm:text-base">أدخل المبلغ الذي تريد إيداعه أو سحبه من البنك.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="number"
                min="1"
                value={amount}
                disabled={loadingTx || loading}
                onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                className="flex-1 rounded border p-3 bg-zinc-900 border-zinc-700 text-white text-center text-lg font-bold"
                placeholder="0"
                dir="rtl"
              />
              <button
                disabled={!canDeposit}
                onClick={() => tx("deposit")}
                className="flex-1 sm:w-auto py-3 px-6 rounded-lg font-bold transition-all bg-gradient-to-r from-accent-red to-red-700 hover:from-red-600 hover:to-red-800 text-white transform hover:scale-105 hover:shadow-lg disabled:opacity-60 flex items-center justify-center"
              >
                <ArrowDownToLine className="w-5 h-5 ml-2" />
                {loadingTx ? "..." : "إيداع"}
              </button>
              <button
                disabled={!canWithdraw}
                onClick={() => tx("withdraw")}
                className="flex-1 sm:w-auto py-3 px-6 rounded-lg font-bold transition-all bg-gradient-to-r from-accent-green to-green-700 hover:from-green-600 hover:to-green-800 text-white transform hover:scale-105 hover:shadow-lg disabled:opacity-60 flex items-center justify-center"
              >
                <ArrowUpToLine className="w-5 h-5 ml-2" />
                {loadingTx ? "..." : "سحب"}
              </button>
            </div>
            <p className="text-center text-xs text-accent-red">لا يمكنك إيداع أكثر من نقودك أو سحب أكثر من رصيدك البنكي.</p>
          </div>
        </div>
      )}

      {tab === "interest" && (
        <div className="bg-hitman-900/70 border border-hitman-700 rounded-xl p-6 sm:p-8 shadow-lg space-y-6">
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="w-6 h-6 text-accent-green animate-bounce" />
            <h2 className="text-xl sm:text-2xl font-bold text-accent-green">سجل الفوائد البنكية</h2>
          </div>
          {interestRows === null ? (
            <p className="text-center text-hitman-300 animate-pulse">جارٍ تحميل سجل الفوائد…</p>
          ) : interestRows.length === 0 ? (
            <p className="text-hitman-300 text-center">لا توجد فوائد مسجلة بعد.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm rtl text-right border-separate border-spacing-y-2">
                <thead>
                  <tr className="bg-hitman-900/80">
                    <th className="py-3 px-4 rounded-r-xl text-accent-green font-bold">التاريخ</th>
                    <th className="py-3 px-4 rounded-l-xl text-accent-green font-bold text-left">المبلغ</th>
                  </tr>
                </thead>
                <tbody>
                  {interestRows.map(({ id, amount, createdAt }) => (
                    <tr key={id} className="bg-hitman-800/60 hover:bg-hitman-700/80 transition rounded-xl">
                      <td className="py-2 px-4 rounded-r-xl font-mono">
                        {new Date(createdAt).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-2 px-4 rounded-l-xl text-left text-accent-green font-bold font-mono">+{amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}