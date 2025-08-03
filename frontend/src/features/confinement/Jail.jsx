/* ========================================================================
 *  Jail.jsx – refactored with modern hitman theme (restored)
 * =======================================================================*/
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useHud } from "@/hooks/useHud";
import { Lock, Clock, AlertTriangle, CheckCircle, RefreshCw, Users } from "lucide-react";
import MoneyIcon from "@/components/MoneyIcon";
import axios from "axios";
import { useSocket } from "@/hooks/useSocket";

export default function Jail() {
  const { customToken } = useFirebaseAuth();
  const { invalidateHud, loading } = useHud();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [jailStatus, setJailStatus] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [initialTotalTime, setInitialTotalTime] = useState(null);
  const [loadingBail, setLoadingBail] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jailCount, setJailCount] = useState(null);

  // Fetch jail status on mount and after actions
  const fetchJailStatus = useCallback(async () => {
    if (!customToken) {
      navigate("/login");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get("/api/confinement/jail");
      const data = response.data;
              // Jail status fetched successfully
      setJailStatus(data);
      if (data.inJail && data.remainingSeconds) {
        // Use the remainingSeconds directly from backend (most accurate)
        const remaining = data.remainingSeconds;
        
        // Calculate total time from startedAt and releasedAt for progress bar
        let total = 600; // Default 10 minutes if no backend data
        if (data.releaseAt && data.startedAt) {
          const releaseAt = new Date(data.releaseAt).getTime();
          const startedAt = new Date(data.startedAt).getTime();
          total = Math.max(1, Math.round((releaseAt - startedAt) / 1000));
        }
        
        // Always update the total time from backend data to ensure accuracy
        setInitialTotalTime(total);
        setRemainingTime(remaining);
      } else {
        // Not in jail, reset everything only if we were previously in jail
        if (jailStatus?.inJail) {
          setInitialTotalTime(null);
          setRemainingTime(0);
        }
      }
    } catch (error) {
      console.error("Jail fetch error:", error);
      setError(error.message || "Failed to fetch jail status");
      setJailStatus({ inJail: false });
      toast.error("لا يمكن الاتصال بالخادم");
    } finally {
      setIsLoading(false);
    }
  }, [customToken, navigate, jailStatus?.inJail]);

  useEffect(() => {
    fetchJailStatus();
  }, [fetchJailStatus]);

  // Fetch jail count immediately on mount
  useEffect(() => {
    const fetchJailCount = async () => {
      try {
        const response = await axios.get("/api/confinement/jail/count");
        setJailCount(response.data.count);
      } catch (error) {
        console.error("Error fetching jail count:", error);
        setJailCount(null);
      }
    };
    
    fetchJailCount();
  }, []);

  // Update timer
  useEffect(() => {
    if (jailStatus?.inJail && initialTotalTime && remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime(prev => {
          const newRemaining = prev - 1;
          if (newRemaining <= 0) {
            clearInterval(timer);
            // Fetch updated status when timer reaches zero
            setTimeout(() => fetchJailStatus(), 100);
            return 0;
          }
          return newRemaining;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [jailStatus?.inJail, initialTotalTime]);

  // Real-time updates for jail status and count
  useEffect(() => {
    if (!socket) return;
    
    const fetchAll = async () => {
      try {
        await fetchJailStatus();
        // Fetch count
        const countResponse = await axios.get("/api/confinement/jail/count");
        setJailCount(countResponse.data.count);
      } catch (error) {
        console.error("Error in real-time update:", error);
        // Don't show toast for background updates to avoid spam
      }
    };
    
    socket.on('jail:update', fetchAll);
    
    return () => {
      socket.off('jail:update', fetchAll);
    };
  }, [socket, fetchJailStatus]);

  // Format time display (copied from Profile.jsx)
  function formatTime(seconds) {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (!jailStatus?.inJail || !initialTotalTime) return 0;
    return Math.max(0, Math.min(100, ((initialTotalTime - remainingTime) / initialTotalTime) * 100));
  };

  // Calculate dynamic bail cost based on remaining time
  const getDynamicBailCost = () => {
    if (!jailStatus?.inJail || !remainingTime) return 0;
    
    // Cost is 100 per minute remaining
    const minutesRemaining = Math.ceil(remainingTime / 60);
    const costPerMinute = 100;
    
    return minutesRemaining * costPerMinute;
  };

  // Bail out handler
  const handleBailOut = async () => {
    if (!jailStatus?.inJail) {
      toast.error("أنت لست في السجن");
      return;
    }
    setLoadingBail(true);
    try {
      const res = await axios.post("/api/confinement/jail/bail");
      const result = res.data;
      setJailStatus({ inJail: false });
      setRemainingTime(0);
      setInitialTotalTime(null);
      invalidateHud?.();
              toast.success(`تم الإفراج بنجاح! المال المتبقي: ${result.newCash?.toLocaleString() || 0}`);
      // Navigate to dashboard after successful bailing
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      
      // Check for specific error types
      if (errorMessage?.includes('insufficient') || errorMessage?.includes('money') || errorMessage?.includes('funds')) {
        toast.error("لا تملك مالاً كافياً للإفراج بكفالة");
      } else if (errorMessage?.includes('not in jail')) {
        toast.error("أنت لست في السجن");
      } else if (errorMessage?.includes('Bail failed') || errorMessage?.includes('failed')) {
        toast.error("فشل في الإفراج - تحقق من رصيدك");
      } else {
        toast.error(errorMessage || "فشل في الإفراج");
      }
    } finally {
      setLoadingBail(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
            <p className="text-hitman-300">جاري تحميل حالة السجن...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-accent-red mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4 text-accent-red">خطأ في تحميل بيانات السجن</h1>
            <p className="text-hitman-300 mb-4">{error}</p>
            <button 
              onClick={fetchJailStatus} 
              className="bg-accent-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center mx-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Debug log
          // Rendering jail page

  // Banner and main layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
      {/* Enhanced Header */}
      <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-10 card-3d bg-blood-gradient">
        <div className="absolute inset-0 bg-gradient-to-br from-blood-900/20 to-black/60"></div>
        <div className="relative z-10 text-center p-8">
          <Lock className="w-16 h-16 mx-auto text-blood-400 mb-2 animate-bounce" />
          <h1 className="text-4xl font-bouya mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blood-400 via-blood-300 to-blood-400 animate-glow-blood">
            السجن
          </h1>
          <p className="text-white/80 text-lg">
            مركز الاحتجاز والعقاب
          </p>
          {jailCount !== null && (
            <div className="mt-2 flex items-center justify-center gap-2 text-blood-300 text-lg">
              <Users className="w-5 h-5" />
              <span>عدد المسجونين الآن: <b className="text-blood-400">{jailCount}</b></span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Jail Status */}
        <div className="card-3d p-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 text-blood-400 text-center">حالة السجن</h2>
          {jailStatus?.inJail ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-xl font-bold text-blood-400 mb-2">أنت الآن في السجن</h3>
                <p className="text-white/70">تحتاج إلى وقت لانتهاء مدة العقوبة</p>
              </div>
              {/* Timer */}
              <div className="text-center bg-black/20 rounded-xl p-6 border border-blood-500/20">
                <Clock className="w-8 h-8 text-blood-400 mx-auto mb-2" />
                <div className="text-3xl font-mono text-blood-400 mb-2">
                  {formatTime(remainingTime)}
                </div>
                <p className="text-white/70 text-sm">الوقت المتبقي للإفراج</p>
              </div>
              {/* Progress Bar */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">تقدم العقوبة</span>
                  <span className="text-blood-400 font-bold">{Math.round(getProgressPercentage())}%</span>
                </div>
                <div className="progress-3d h-3">
                  <div
                    className="progress-3d-fill bg-gradient-to-r from-blood-600 to-blood-400 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
              </div>
              {/* Bail Out Option */}
              <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 rounded-xl p-6 border border-accent-red/30">
                <h4 className="font-bold text-accent-red mb-3 text-center">الإفراج بكفالة</h4>
                <p className="text-hitman-300 text-sm mb-4 text-center">
                  يمكنك دفع مبلغ للإفراج الفوري والخروج من السجن
                </p>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent-green mb-2 flex items-center justify-center gap-2">
                    <MoneyIcon className="w-10 h-10" />
                    {getDynamicBailCost().toLocaleString()}
                  </div>
                  <p className="text-hitman-300 text-sm mb-4">
                    تكلفة الإفراج بكفالة 
                    <span className="text-accent-yellow text-xs mr-1">(تتغير مع الوقت)</span>
                  </p>
                  <button
                    onClick={handleBailOut}
                    disabled={loadingBail || loading}
                    className="w-full bg-gradient-to-r from-accent-red to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loadingBail ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        جاري الإفراج...
                      </div>
                    ) : (
                      'الإفراج الآن'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-400 mb-2">أنت حر</h3>
              <p className="text-white/70">
                لست في السجن حالياً. يمكنك العودة إلى اللعب!
              </p>
            </div>
          )}
        </div>
        {/* Jail Information */}
        <div className="card-3d p-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 text-blood-400 text-center">معلومات السجن</h2>
          <div className="space-y-6">
            <div className="bg-hitman-800/30 rounded-xl p-4">
              <h4 className="font-bold text-accent-red mb-2 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                كيف تصل إلى السجن؟
              </h4>
              <p className="text-hitman-300 text-sm">
                يمكن أن ينتهي بك المطاف في السجن عند فشل بعض الجرائم أو عند ارتكاب مخالفات.
              </p>
            </div>
            <div className="bg-hitman-800/30 rounded-xl p-4">
              <h4 className="font-bold text-accent-red mb-2 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                مدة العقوبة
              </h4>
              <p className="text-hitman-300 text-sm">
                تختلف مدة العقوبة حسب نوع الجريمة. يمكنك أيضاً دفع مبلغ للإفراج الفوري.
              </p>
            </div>
            <div className="bg-hitman-800/30 rounded-xl p-4">
              <h4 className="font-bold text-accent-red mb-2 flex items-center">
                <MoneyIcon className="w-5 h-5 mr-2" />
                تكلفة الإفراج بكفالة
              </h4>
              <p className="text-hitman-300 text-sm">
                تزداد التكلفة كل دقيقة تقضيها في السجن. كلما طال الوقت، زادت التكلفة.
              </p>
            </div>
            {jailStatus?.inJail && (
              <div className="bg-gradient-to-br from-accent-red/10 to-red-900/20 rounded-xl p-4 border border-accent-red/30">
                <h4 className="font-bold text-accent-red mb-3">نصائح</h4>
                <ul className="text-hitman-300 text-sm space-y-2">
                  <li className="flex items-start">
                    <span className="text-accent-red mr-2">•</span>
                    انتظر حتى انتهاء مدة العقوبة لتوفير المال
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent-red mr-2">•</span>
                    استخدم الإفراج بكفالة إذا كنت تريد العودة للعب فوراً
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent-red mr-2">•</span>
                    تجنب الجرائم الخطيرة لتقليل فرص دخول السجن
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
