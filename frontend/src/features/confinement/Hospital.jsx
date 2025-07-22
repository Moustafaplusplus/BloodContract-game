/* ========================================================================
 *  Hospital.jsx – refactored with modern hitman theme
 * =======================================================================*/
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { useHud } from "@/hooks/useHud";
import { Heart, Clock, DollarSign, AlertTriangle, CheckCircle, Activity, RefreshCw, Users } from "lucide-react";
import axios from "axios";
import { useSocket } from "@/hooks/useSocket";

export default function Hospital() {
  const { token } = useAuth();
  const { invalidateHud, loading } = useHud();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [hospitalStatus, setHospitalStatus] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [totalTime, setTotalTime] = useState(null);
  const [loadingHeal, setLoadingHeal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hospitalCount, setHospitalCount] = useState(null);

  // Fetch hospital status on mount and after actions
  const fetchHospitalStatus = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get("/api/confinement/hospital");
      const data = response.data;
              // Hospital status fetched successfully
      setHospitalStatus(data);
      if (data.inHospital && data.releaseAt && data.startedAt) {
        const releaseAt = new Date(data.releaseAt).getTime();
        const startedAt = new Date(data.startedAt).getTime();
        const now = Date.now();
        const total = Math.max(1, Math.round((releaseAt - startedAt) / 1000));
        setTotalTime(total);
        setRemainingTime(Math.max(0, Math.round((releaseAt - now) / 1000)));
      } else if (data.inHospital && data.remainingSeconds) {
        setTotalTime(data.remainingSeconds);
        setRemainingTime(data.remainingSeconds);
      }
    } catch (error) {
      console.error("Hospital fetch error:", error);
      setError(error.message || "Failed to fetch hospital status");
      setHospitalStatus({ inHospital: false });
      toast.error("لا يمكن الاتصال بالخادم");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalStatus();
  }, [token, navigate]);

  // Update timer
  useEffect(() => {
    if (hospitalStatus?.inHospital && totalTime && remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime(prev => {
          const newRemaining = prev - 1;
          if (newRemaining <= 0) {
            clearInterval(timer);
            fetchHospitalStatus();
            return 0;
          }
          return newRemaining;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [hospitalStatus?.inHospital, totalTime, remainingTime]);

  // Real-time updates for hospital status and count
  useEffect(() => {
    if (!socket) return;
    const fetchAll = () => {
      fetchHospitalStatus();
      // Fetch count
      axios.get("/api/confinement/hospital/count").then(res => setHospitalCount(res.data.count)).catch(() => setHospitalCount(null));
    };
    socket.on('hospital:update', fetchAll);
    const pollInterval = setInterval(fetchAll, 10000);
    return () => {
      socket.off('hospital:update', fetchAll);
      clearInterval(pollInterval);
    };
  }, [socket]);

  // Format time display (copied from Profile.jsx)
  function formatTime(seconds) {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (!hospitalStatus?.inHospital || !totalTime) return 0;
    return Math.max(0, Math.min(100, ((totalTime - remainingTime) / totalTime) * 100));
  };

  // Heal out handler
  const handleHealOut = async () => {
    if (!hospitalStatus?.inHospital) {
      toast.error("أنت لست في المستشفى");
      return;
    }

    setLoadingHeal(true);
    try {
      const res = await axios.post("/api/confinement/hospital/heal");
      const result = res.data;
      setHospitalStatus({ inHospital: false });
      setRemainingTime(0);
      invalidateHud?.();
      toast.success(`تم الشفاء بنجاح! المال المتبقي: $${result.newCash?.toLocaleString() || 0}`);
      // Navigate to dashboard after successful healing
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "فشل في الشفاء");
    } finally {
      setLoadingHeal(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
            <p className="text-hitman-300">جاري تحميل حالة المستشفى...</p>
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
            <h1 className="text-2xl font-bold mb-4 text-accent-red">خطأ في تحميل بيانات المستشفى</h1>
            <p className="text-hitman-300 mb-4">{error}</p>
            <button 
              onClick={fetchHospitalStatus} 
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
      // Rendering hospital page

  // Banner and main layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
      {/* Banner */}
      <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-10 flex items-center justify-center bg-gradient-to-br from-accent-red/40 to-black/60 border-2 border-accent-red animate-fade-in">
        <div className="absolute inset-0 w-full h-full object-cover opacity-40 bg-gradient-to-br from-red-900 to-black"></div>
        <div className="relative z-10 text-center">
          <Heart className="w-16 h-16 mx-auto text-accent-red mb-2 animate-bounce" />
          <h1 className="text-4xl font-bouya mb-2 text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-red-400 to-accent-red animate-glow">
            المستشفى
          </h1>
          <p className="text-hitman-300 text-lg">
            مركز العلاج والشفاء
          </p>
          {hospitalCount !== null && (
            <div className="mt-2 flex items-center justify-center gap-2 text-accent-yellow text-lg animate-pulse">
              <Users className="w-5 h-5" />
              <span>عدد المرضى الآن: <b>{hospitalCount}</b></span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Hospital Status */}
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 border border-hitman-700 rounded-2xl p-8 shadow-lg animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 text-accent-red text-center">حالة المستشفى</h2>
          
          {hospitalStatus?.inHospital ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">🏥</div>
                <h3 className="text-xl font-bold text-accent-red mb-2">أنت الآن في المستشفى</h3>
                <p className="text-hitman-300">تحتاج إلى وقت للشفاء من إصاباتك</p>
              </div>

              {/* Timer */}
              <div className="text-center bg-hitman-800/30 rounded-xl p-6">
                <Clock className="w-8 h-8 text-accent-red mx-auto mb-2" />
                <div className="text-3xl font-mono text-accent-red mb-2">
                  {formatTime(remainingTime)}
                </div>
                <p className="text-hitman-300 text-sm">الوقت المتبقي للشفاء</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-hitman-300">تقدم الشفاء</span>
                  <span className="text-accent-red font-bold">{Math.round(getProgressPercentage())}%</span>
                </div>
                <div className="w-full bg-hitman-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-accent-red to-red-600 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
              </div>

              {/* Heal Out Option */}
              <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 rounded-xl p-6 border border-accent-red/30">
                <h4 className="font-bold text-accent-red mb-3 text-center">الشفاء السريع</h4>
                <p className="text-hitman-300 text-sm mb-4 text-center">
                  يمكنك دفع مبلغ للشفاء الفوري والخروج من المستشفى
                </p>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent-green mb-2">
                    ${hospitalStatus.cost?.toLocaleString() || 0}
                  </div>
                  <p className="text-hitman-300 text-sm mb-4">تكلفة الشفاء السريع</p>
                  <button
                    onClick={handleHealOut}
                    disabled={loadingHeal || loading}
                    className="w-full bg-gradient-to-r from-accent-red to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loadingHeal ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        جاري الشفاء...
                      </div>
                    ) : (
                      'الشفاء الآن'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-accent-green mx-auto mb-4" />
              <h3 className="text-xl font-bold text-accent-green mb-2">أنت بصحة جيدة</h3>
              <p className="text-hitman-300">
                لست في المستشفى حالياً. يمكنك العودة إلى اللعب!
              </p>
            </div>
          )}
        </div>

        {/* Hospital Information */}
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 border border-hitman-700 rounded-2xl p-8 shadow-lg animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 text-accent-red text-center">معلومات المستشفى</h2>
          
          <div className="space-y-6">
            <div className="bg-hitman-800/30 rounded-xl p-4">
              <h4 className="font-bold text-accent-red mb-2 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                كيف تصل إلى المستشفى؟
              </h4>
              <p className="text-hitman-300 text-sm">
                يمكن أن ينتهي بك المطاف في المستشفى عند فشل بعض الجرائم أو عند خسارة المعارك.
              </p>
            </div>

            <div className="bg-hitman-800/30 rounded-xl p-4">
              <h4 className="font-bold text-accent-red mb-2 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                معدل الشفاء
              </h4>
              <p className="text-hitman-300 text-sm">
                يشفى اللاعب تلقائياً بمرور الوقت. يمكنك أيضاً دفع مبلغ للشفاء الفوري.
              </p>
            </div>

            <div className="bg-hitman-800/30 rounded-xl p-4">
              <h4 className="font-bold text-accent-red mb-2 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                تكلفة الشفاء السريع
              </h4>
              <p className="text-hitman-300 text-sm">
                تزداد التكلفة كل دقيقة تقضيها في المستشفى. كلما طال الوقت، زادت التكلفة.
              </p>
            </div>

            {hospitalStatus?.inHospital && (
              <div className="bg-gradient-to-br from-accent-red/10 to-red-900/20 rounded-xl p-4 border border-accent-red/30">
                <h4 className="font-bold text-accent-red mb-3">نصائح</h4>
                <ul className="text-hitman-300 text-sm space-y-2">
                  <li className="flex items-start">
                    <span className="text-accent-red mr-2">•</span>
                    انتظر حتى الشفاء التلقائي لتوفير المال
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent-red mr-2">•</span>
                    استخدم الشفاء السريع إذا كنت تريد العودة للعب فوراً
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent-red mr-2">•</span>
                    تجنب الجرائم الخطيرة لتقليل فرص دخول المستشفى
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