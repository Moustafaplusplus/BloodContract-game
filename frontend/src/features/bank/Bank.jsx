import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useHud } from "@/hooks/useHud";
import { useSocket } from "@/hooks/useSocket";
import { 
  Banknote, 
  ArrowDownToLine, 
  ArrowUpToLine, 
  TrendingUp, 
  DollarSign,
  PiggyBank,
  History,
  Wallet,
  CreditCard,
  ImageIcon,
  Building2,
  Coins,
  Shield,
  Percent,
  Clock,
  Loader
} from "lucide-react";
import MoneyIcon from "@/components/MoneyIcon";

const API = import.meta.env.VITE_API_URL;

// Enhanced Transaction Card Component
const TransactionCard = ({ type, onExecute, amount, setAmount, canExecute, loading, balance, money }) => {
  const isDeposit = type === 'deposit';
  const icon = isDeposit ? ArrowDownToLine : ArrowUpToLine;
  const IconComponent = icon;
  const color = isDeposit ? 'green' : 'blood';
  const maxAmount = isDeposit ? money : balance;
  
  return (
    <div className="bg-black/80 border border-blood-500/20 rounded-xl p-4 backdrop-blur-sm hover:border-blood-500/40 transition-all duration-300">
      {/* Transaction Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 ${isDeposit ? 'bg-green-600' : 'bg-blood-600'} rounded-lg flex items-center justify-center`}>
            <IconComponent className="w-4 h-4 text-white" />
          </div>
          <h3 className={`font-semibold ${isDeposit ? 'text-green-400' : 'text-blood-400'}`}>
            {isDeposit ? 'إيداع أموال' : 'سحب أموال'}
          </h3>
        </div>
        <ImageIcon className="w-4 h-4 text-blood-300" />
      </div>
      
      <div className="space-y-4">
        {/* Available Amount */}
        <div className={`${isDeposit ? 'bg-green-900/20 border-green-500/20' : 'bg-blood-900/20 border-blood-500/20'} border rounded-lg p-3 text-center`}>
          <div className="text-xs text-blood-300 mb-1">
            {isDeposit ? 'المتاح للإيداع' : 'المتاح للسحب'}
          </div>
          <div className={`text-lg font-bold ${isDeposit ? 'text-green-400' : 'text-blood-400'} flex items-center justify-center space-x-1`}>
            <MoneyIcon className="w-4 h-4" />
            <span>{maxAmount?.toLocaleString() || 0}</span>
          </div>
        </div>
        
        {/* Amount Input */}
        <div>
          <label className="block text-xs text-blood-300 mb-2">المبلغ</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="أدخل المبلغ..."
            className="w-full bg-black/60 border border-blood-500/30 text-white placeholder-blood-300 rounded-lg px-3 py-2 text-center focus:outline-none focus:border-blood-500 focus:ring-1 focus:ring-blood-500 transition-all duration-300"
            disabled={loading}
            min="1"
            max={maxAmount}
          />
        </div>
        
        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {[25, 50, 100].map(percent => {
            const quickAmount = Math.floor((maxAmount || 0) * (percent / 100));
            return (
              <button
                key={percent}
                onClick={() => setAmount(quickAmount.toString())}
                disabled={loading || !maxAmount}
                className="bg-blood-800/30 border border-blood-500/20 text-blood-300 py-1 rounded text-xs hover:bg-blood-700/30 hover:border-blood-500/40 transition-all duration-300 disabled:opacity-50"
              >
                {percent}%
              </button>
            );
          })}
        </div>
        
        {/* Execute Button */}
        <button
          onClick={() => onExecute(type)}
          disabled={!canExecute || loading}
          className={`w-full ${
            isDeposit 
              ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' 
              : 'bg-gradient-to-r from-blood-600 to-blood-700 hover:from-blood-700 hover:to-blood-800'
          } text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:transform-none disabled:opacity-50 flex items-center justify-center space-x-2`}
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm">جاري المعالجة...</span>
            </>
          ) : (
            <>
              <IconComponent className="w-4 h-4" />
              <span className="text-sm">{isDeposit ? 'إيداع' : 'سحب'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// History Item Component
const HistoryItem = ({ item }) => (
  <div className="bg-black/60 border border-blood-500/20 rounded-lg p-3 flex items-center justify-between hover:border-blood-500/40 transition-all duration-300">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
        <TrendingUp className="w-4 h-4 text-white" />
      </div>
      <div>
        <div className="text-sm font-medium text-white">فوائد بنكية</div>
        <div className="text-xs text-blood-300">
          {new Date(item.createdAt).toLocaleDateString('ar-SA')}
        </div>
      </div>
    </div>
    <div className="text-right">
      <div className="text-sm font-bold text-green-400">
        +{item.amount?.toLocaleString() || 0}
      </div>
      <div className="text-xs text-blood-300">فوائد</div>
    </div>
  </div>
);

export default function Bank() {
  const { customToken } = useFirebaseAuth();
  const { stats, invalidateHud, loading } = useHud();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [balance, setBalance] = useState(null);
  const [amount, setAmount] = useState("");
  const [loadingTx, setLoadingTx] = useState(false);
  const [tab, setTab] = useState("account");
  const [interestRows, setInterestRows] = useState(null);

  useEffect(() => {
    if (!customToken) {
      navigate("/login");
      return;
    }
    fetch(`${API}/api/bank`, {
      headers: { Authorization: `Bearer ${customToken}` },
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to fetch"))))
      .then(({ balance }) => setBalance(balance))
      .catch(() => {
        setBalance(0);
        toast.error("لا يمكن الاتصال بالخادم");
      });
  }, [customToken, navigate]);

  useEffect(() => {
    if (!socket) return;
    const fetchBalance = () => {
      fetch(`${API}/api/bank`, {
        headers: { Authorization: `Bearer ${customToken}` },
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
  }, [socket, customToken]);

  useEffect(() => {
    if (tab !== "history" || !customToken) return;
    setInterestRows(null);
    fetch(`${API}/api/bank/history`, {
      headers: { Authorization: `Bearer ${customToken}` },
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to fetch"))))
      .then((data) => setInterestRows((Array.isArray(data) ? data : []).slice(0, 10)))
      .catch(() => {
        setInterestRows([]);
        toast.error("لا يمكن الاتصال بالخادم");
      });
  }, [tab, customToken]);

  const amt = Number(amount);
  const canDeposit = amt > 0 && stats && amt <= stats.money && !loadingTx && !loading;
  const canWithdraw = amt > 0 && balance !== null && amt <= balance && !loadingTx && !loading;

  const tx = async (type) => {
    if ((!canDeposit && type === "deposit") || (!canWithdraw && type === "withdraw")) return;
    setLoadingTx(true);
    
    try {
      const response = await fetch(`${API}/api/bank/${type}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customToken}`,
        },
        body: JSON.stringify({ amount: amt }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "فشل في العملية");
      }
      
      const data = await response.json();
      setBalance(data.balance);
      setAmount("");
      invalidateHud();
      toast.success(type === "deposit" ? "تم الإيداع بنجاح" : "تم السحب بنجاح");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingTx(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-blood-900 to-blood-800 flex items-center justify-center p-4">
        <div className="text-center bg-black/90 backdrop-blur-md rounded-xl border border-blood-500/30 p-8">
          <div className="w-16 h-16 border-4 border-blood-500/30 border-t-blood-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">جاري تحميل البنك...</p>
        </div>
      </div>
    );
  }

  const totalWealth = (stats?.money || 0) + (balance || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blood-900 to-blood-800 p-2 sm:p-4 space-y-4">
      
      {/* Bank Header Banner with Background Image */}
      <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
        {/* Background Image Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-900 via-gray-800 to-blue-900">
          <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%2316a34a\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M20 20m-16 0a16,16 0 1,1 32,0a16,16 0 1,1 -32,0\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"}></div>
        </div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">البنك</h1>
              <p className="text-xs sm:text-sm text-white/80 drop-shadow">Financial Center</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-white">
            <div className="hidden sm:flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-white/60" />
              <Coins className="w-4 h-4 text-green-400 animate-pulse" />
            </div>
            <div className="text-right">
              <div className="text-lg sm:text-xl font-bold drop-shadow-lg">${totalWealth.toLocaleString()}</div>
              <div className="text-xs text-white/80 drop-shadow">Total Wealth</div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Wallet Balance */}
        <div className="bg-black/80 border border-blood-500/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-semibold text-yellow-400 text-sm">المحفظة</span>
                <div className="text-xs text-blood-300">نقد في اليد</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-yellow-400 flex items-center space-x-1">
                <MoneyIcon className="w-4 h-4" />
                <span>{stats?.money?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Balance */}
        <div className="bg-black/80 border border-blood-500/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <PiggyBank className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-semibold text-green-400 text-sm">الرصيد البنكي</span>
                <div className="text-xs text-blood-300">محفوظ في البنك</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-400 flex items-center space-x-1">
                <MoneyIcon className="w-4 h-4" />
                <span>{balance?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("account")}
          className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center space-x-2 transition-all duration-300 ${
            tab === "account" 
              ? 'bg-blood-600 border border-blood-500 text-white' 
              : 'bg-black/60 border border-blood-500/20 text-blood-300 hover:border-blood-500/40'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>الحساب</span>
        </button>
        <button
          onClick={() => setTab("history")}
          className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center space-x-2 transition-all duration-300 ${
            tab === "history" 
              ? 'bg-blood-600 border border-blood-500 text-white' 
              : 'bg-black/60 border border-blood-500/20 text-blood-300 hover:border-blood-500/40'
          }`}
        >
          <History className="w-4 h-4" />
          <span>السجل</span>
        </button>
      </div>

      {/* Tab Content */}
      {tab === "account" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Deposit */}
          <TransactionCard
            type="deposit"
            onExecute={tx}
            amount={amount}
            setAmount={setAmount}
            canExecute={canDeposit}
            loading={loadingTx}
            balance={balance}
            money={stats?.money || 0}
          />

          {/* Withdraw */}
          <TransactionCard
            type="withdraw"
            onExecute={tx}
            amount={amount}
            setAmount={setAmount}
            canExecute={canWithdraw}
            loading={loadingTx}
            balance={balance}
            money={stats?.money || 0}
          />
        </div>
      )}

      {tab === "history" && (
        <div className="bg-black/80 border border-blood-500/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-blood-600 rounded flex items-center justify-center">
              <History className="w-3 h-3 text-white" />
            </div>
            <h3 className="font-semibold text-white">سجل الفوائد البنكية</h3>
            <ImageIcon className="w-4 h-4 text-blood-300 ml-auto" />
          </div>
          
          {interestRows === null ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-blood-500/30 border-t-blood-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-blood-300">جاري تحميل السجل...</p>
            </div>
          ) : interestRows.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-blood-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="w-6 h-6 text-blood-400" />
              </div>
              <p className="text-blood-300">لا توجد عمليات فوائد بعد</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {interestRows.map((item, index) => (
                <HistoryItem key={index} item={item} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bank Info */}
      <div className="bg-black/80 border border-blood-500/20 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-6 h-6 bg-blood-600 rounded flex items-center justify-center">
            <Shield className="w-3 h-3 text-white" />
          </div>
          <h3 className="font-semibold text-blood-400">معلومات البنك</h3>
          <ImageIcon className="w-4 h-4 text-blood-300 ml-auto" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-blood-200">
          <div className="flex items-center space-x-2">
            <Shield className="w-3 h-3 text-blood-400 flex-shrink-0" />
            <span>احفظ أموالك لحمايتها من السرقة</span>
          </div>
          <div className="flex items-center space-x-2">
            <Percent className="w-3 h-3 text-blood-400 flex-shrink-0" />
            <span>احصل على فوائد يومية على رصيدك</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-3 h-3 text-blood-400 flex-shrink-0" />
            <span>يمكنك الإيداع والسحب في أي وقت</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-3 h-3 text-blood-400 flex-shrink-0" />
            <span>لا توجد رسوم على العمليات</span>
          </div>
        </div>
      </div>
    </div>
  );
}
