// Crimes.jsx – واجهة الجرائم مع تبريد عالمي ورسائل عربية مفصّلة
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "@/components/Modal";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "react-toastify";
import { extractErrorMessage } from "@/utils/errorHandler";


import {
  Target,
  Clock,
  DollarSign,
  Star,
  TrendingUp,
  AlertTriangle,
  Activity,
  Zap,
  Eye,
  Shield,
  Crown,
  Award,
  ImageIcon,
} from "lucide-react";

// Helper to format seconds as mm:ss
function formatCooldown(sec) {
  const m = Math.floor((sec || 0) / 60);
  const s = (sec || 0) % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Crimes() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const { socket } = useSocket();
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info" });
  const [jailStatus, setJailStatus] = useState({ inJail: false });
  const [hospitalStatus, setHospitalStatus] = useState({ inHospital: false });
  const suppressBlockedModal = useRef(false);
  const justAttemptedCrime = useRef(false);

  // Fetch jail/hospital status
  const fetchStatuses = useCallback(() => {
    if (!token) return;
    axios.get("/api/confinement/jail").then(r => setJailStatus(r.data)).catch(() => setJailStatus({ inJail: false }));
    axios.get("/api/confinement/hospital").then(r => setHospitalStatus(r.data)).catch(() => setHospitalStatus({ inHospital: false }));
  }, [token]);

  useEffect(() => {
    fetchStatuses();
    // Listen for jail/hospital socket events
    if (!socket) return;
    const update = () => fetchStatuses();
    socket.on("jail:enter", update);
    socket.on("jail:leave", update);
    socket.on("hospital:enter", update);
    socket.on("hospital:leave", update);
    return () => {
      socket.off("jail:enter", update);
      socket.off("jail:leave", update);
      socket.off("hospital:enter", update);
      socket.off("hospital:leave", update);
    };
  }, [socket, fetchStatuses]);

  // Block actions if in jail/hospital
  const isBlocked = jailStatus.inJail || hospitalStatus.inHospital;
  const blockReason = jailStatus.inJail
    ? `أنت في السجن. الوقت المتبقي: ${formatCooldown(Math.max(0, Math.floor((jailStatus.remainingSeconds || 0))))}`
    : hospitalStatus.inHospital
      ? `أنت في المستشفى. الوقت المتبقي: ${formatCooldown(Math.max(0, Math.floor((hospitalStatus.remainingSeconds || 0))))}`
      : null;

  /* ───────────────────────── عدّاد التبريد ──────────��──────────── */
  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const t = setInterval(() => {
      setCooldownLeft((sec) => (sec > 1 ? sec - 1 : 0));
    }, 1_000);
    return () => clearInterval(t);
  }, [cooldownLeft]);

  /* ───────────── جلب قائمة الجرائم ───────────── */
  const {
    data: crimes = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["crimes"],
    queryFn: () => axios.get("/api/crimes").then((r) => r.data),
    staleTime: 10 * 60 * 1_000,
    retry: false,
  });

  /* ───────────────────────── تنفيذ جريمة ─────────────────────���─── */
  const mutation = useMutation({
    mutationFn: (id) =>
      axios.post(`/api/crimes/execute/${id}`).then((r) => r.data),
    onSuccess: (data) => {
      fetchStatuses();
      justAttemptedCrime.current = true;
      if (data.success) {
        setModal({
          isOpen: true,
          title: "نجح في الجريمة!",
          message: `حصلت على ${data.payout} نقود و ${data.expGain} خبرة`,
          type: "success"
        });
      } else {
        let message = "";
        let type = "warning";
        if (data.redirect && data.redirect.includes("jail")) {
          message = `لقد حاولت ولكن تم القبض عليك وتم وضعك في السجن، ولكنك حصلت على ${data.expGain} خبرة مع ذلك.`;
          type = "warning"; // yellow/orange
        } else if (data.redirect && data.redirect.includes("hospital")) {
          message = `لقد حاولت ولكنك تمت إصابتك وتم وضعك في المشفى، ولكنك حصلت على ${data.expGain} خبرة مع ذلك.`;
          type = "error"; // red
        } else {
          message = `لقد حاولت ولكن فشلت المهمة، ولكنك حصلت على ${data.expGain} خبرة مع ذلك.`;
          type = "warning";
        }
        suppressBlockedModal.current = true;
        setModal({
          isOpen: true,
          title: "فشلت الجريمة",
          message,
          type
        });
      }
      if (data.cooldownLeft) setCooldownLeft(data.cooldownLeft);
      queryClient.invalidateQueries(["crimes"]);
    },
    onError: (err) => {
      fetchStatuses();
      const message = extractErrorMessage(err);
      if (err.response?.cooldownLeft) setCooldownLeft(err.response.cooldownLeft);
      setModal({
        isOpen: true,
        title: "فشل تنفيذ الجريمة",
        message: message || "فشل تنفيذ الجريمة",
        type: "error"
      });
    },
  });

  // Mock data for design purposes when backend is not available
  const mockCrimes = [
    {
      id: 1,
      name: "سر��ة سيارة",
      description: "اسرق سيارة فاخرة من موقف السيارات",
      chance: 85,
      minReward: 500,
      maxReward: 1500,
      expGain: 25,
      levelRequirement: 1,
      image: null,
    },
    {
      id: 2,
      name: "سطو على بنك",
      description: "عملية سطو محفوفة بالمخاطر على البنك المركزي",
      chance: 45,
      minReward: 5000,
      maxReward: 15000,
      expGain: 100,
      levelRequirement: 5,
      image: null,
    },
    {
      id: 3,
      name: "اغتيال مستهدف",
      description: "تنفيذ مهمة اغتيال لشخصية مهمة",
      chance: 65,
      minReward: 2000,
      maxReward: 8000,
      expGain: 75,
      levelRequirement: 3,
      image: null,
    },
    {
      id: 4,
      name: "تهريب البضائع",
      description: "نقل بضائع غير قانونية عبر الحدود",
      chance: 70,
      minReward: 1000,
      maxReward: 4000,
      expGain: 50,
      levelRequirement: 2,
      image: null,
    },
    {
      id: 5,
      name: "قرصنة إلكترونية",
      description: "اختراق أنظمة الشركات واستخراج البيانات",
      chance: 80,
      minReward: 1500,
      maxReward: 6000,
      expGain: 60,
      levelRequirement: 4,
      image: null,
    },
    {
      id: 6,
      name: "تجارة الأسلحة",
      description: "بيع الأسلحة في السوق السوداء",
      chance: 60,
      minReward: 3000,
      maxReward: 10000,
      expGain: 85,
      levelRequirement: 6,
      image: null,
    },
  ];

  // Map backend req_level to levelRequirement for dynamic crimes
  const displayCrimes = (crimes.length > 0
    ? crimes.map(c => ({ ...c, levelRequirement: c.req_level }))
    : mockCrimes);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="loading-spinner"></div>
            <Target className="w-8 h-8 text-accent-red absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-white text-lg font-medium animate-pulse">
            جاري تحميل عمليات الاغتيال...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black flex items-center justify-center p-4">
        <div className="text-center bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-accent-red/30 rounded-xl p-8">
          <AlertTriangle className="w-16 h-16 text-accent-red mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">خطأ في التحميل</h2>
          <p className="text-hitman-300">فشل في تحميل قائمة الجرائم</p>
          <p className="text-accent-red text-sm mt-2">{error?.message}</p>
        </div>
      </div>
    );
  }

  const getRiskColor = (chance) => {
    if (chance >= 80) return "text-accent-green";
    if (chance >= 60) return "text-accent-yellow";
    if (chance >= 40) return "text-accent-orange";
    return "text-accent-red";
  };

  const getRiskLevel = (chance) => {
    if (chance >= 80) return "منخفض";
    if (chance >= 60) return "متوسط";
    if (chance >= 40) return "عالي";
    return "شديد الخطورة";
  };

  const handleModalClose = () => {
    setModal({ ...modal, isOpen: false });
    suppressBlockedModal.current = false;
    if (justAttemptedCrime.current) {
      justAttemptedCrime.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20 overflow-x-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="floating-particles"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bouya mb-4 text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-red-400 to-accent-red animate-glow">
            عمليات الاغتيال
          </h1>
          <p className="text-hitman-300 text-lg mb-6">
            اختر مهمتك بحكمة - كل عملية لها مخاطرها ومكافآتها
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-accent-red to-transparent mx-auto"></div>
        </div>

        {/* Cooldown Warning */}
        {cooldownLeft > 0 && (
          <div className="mb-8 animate-slide-up">
            <div className="bg-gradient-to-r from-accent-red/20 to-accent-orange/20 border border-accent-red/30 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-center">
                <Clock className="w-6 h-6 text-accent-red mr-3" />
                <div className="text-center">
                  <p className="text-white font-semibold text-lg">
                    فترة هدوء مطلوبة
                  </p>
                  <p className="text-accent-red font-mono text-xl">
                    {formatCooldown(cooldownLeft)}
                  </p>
                  <p className="text-hitman-300 text-sm">
                    يجب الانتظار قبل المهمة التالية
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
            <Target className="w-8 h-8 text-accent-red mx-auto mb-2" />
            <div className="text-2xl font-bold text-accent-red">
              {displayCrimes.length}
            </div>
            <div className="text-sm text-hitman-300">مهام متاحة</div>
          </div>
          <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
            <TrendingUp className="w-8 h-8 text-accent-green mx-auto mb-2" />
            <div className="text-2xl font-bold text-accent-green">
              {displayCrimes.length > 0
                ? Math.round(
                    displayCrimes.reduce(
                      (total, crime) => total + (crime.chance || 0),
                      0,
                    ) / displayCrimes.length,
                  )
                : 0}
              %
            </div>
            <div className="text-sm text-hitman-300">متوسط النجاح</div>
          </div>
          <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
            <Star className="w-8 h-8 text-accent-yellow mx-auto mb-2" />
            <div className="text-2xl font-bold text-accent-yellow">
              {displayCrimes.reduce(
                (total, crime) => total + (crime.expGain || 0),
                0,
              )}
            </div>
            <div className="text-sm text-hitman-300">إجمالي الخبرة</div>
          </div>
          <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
            <Clock className="w-8 h-8 text-accent-blue mx-auto mb-2" />
            <div
              className={`text-2xl font-bold ${cooldownLeft > 0 ? "text-accent-red" : "text-accent-green"}`}
            >
              {cooldownLeft > 0 ? formatCooldown(cooldownLeft) : "جاهز"}
            </div>
            <div className="text-sm text-hitman-300">حالة العميل</div>
          </div>
        </div>

        {/* Crimes Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayCrimes.map((crime, index) => {
            const isCooling = cooldownLeft > 0;
            const isBusy =
              mutation.isLoading && mutation.variables === crime.id;
            const riskColor = getRiskColor(crime.chance);
            const riskLevel = getRiskLevel(crime.chance);

            return (
              <div
                key={crime.id}
                className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl overflow-hidden group hover:border-accent-red/50 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Crime Image Placeholder */}
                <div className="relative h-48 bg-gradient-to-br from-hitman-700 to-hitman-800 overflow-hidden">
                  {crime.image ? (
                    <img
                      src={crime.image}
                      alt={crime.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent-red/20 to-transparent"></div>
                      <ImageIcon className="w-16 h-16 text-hitman-500 group-hover:text-accent-red transition-colors" />
                      <div className="absolute bottom-2 right-2 bg-hitman-800/80 rounded-lg p-2">
                        <Target className="w-4 h-4 text-accent-red" />
                      </div>
                    </div>
                  )}
                  {/* Risk Badge */}
                  <div className="absolute top-3 left-3">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-sm ${riskColor}`}
                    >
                      {riskLevel}
                    </div>
                  </div>
                  {/* Level Requirement */}
                  {crime.levelRequirement > 1 && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-black/60 backdrop-blur-sm rounded-full p-2">
                        <Crown className="w-4 h-4 text-accent-yellow" />
                        <span className="absolute -bottom-1 -right-1 bg-accent-yellow text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {crime.levelRequirement}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Crime Details */}
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2 text-white group-hover:text-accent-red transition-colors">
                    {crime.name}
                  </h3>
                  {/* Minimum Level Requirement */}
                  <div className="flex items-center mb-2">
                    <Crown className="w-4 h-4 text-accent-yellow mr-1" />
                    <span className="text-xs text-accent-yellow font-bold">المستوى الأدنى: {crime.levelRequirement || 1}</span>
                  </div>
                  <p className="text-hitman-300 mb-4 text-sm leading-relaxed">
                    {crime.description}
                  </p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-hitman-800/30 rounded-lg p-3 text-center">
                      <Eye className={`w-5 h-5 mx-auto mb-1 ${riskColor}`} />
                      <div className={`font-bold ${riskColor}`}>
                        {crime.chance || 0}%
                      </div>
                      <div className="text-xs text-hitman-400">نسبة النجاح</div>
                    </div>
                    <div className="bg-hitman-800/30 rounded-lg p-3 text-center">
                      <DollarSign className="w-5 h-5 text-accent-green mx-auto mb-1" />
                      <div className="font-bold text-accent-green">
                        {crime.minReward === crime.maxReward
                          ? (crime.minReward || 0).toLocaleString()
                          : `${crime.minReward || 0}-${crime.maxReward || 0}`}
                      </div>
                      <div className="text-xs text-hitman-400">المكافأة</div>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="flex items-center justify-between mb-6 bg-hitman-800/30 rounded-lg p-3">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-accent-yellow mr-2" />
                      <span className="text-hitman-300">الخبرة المكتسبة</span>
                    </div>
                    <span className="font-bold text-accent-yellow">
                      {crime.expGain || 0} XP
                    </span>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => {
                      if (isBlocked) {
                        toast.error(blockReason || "لا يمكنك تنفيذ جريمة أثناء وجودك في السجن أو المستشفى.");
                        return;
                      }
                      mutation.mutate(crime.id);
                    }}
                    disabled={isBlocked || mutation.isLoading}
                    className={`w-full py-3 px-6 rounded-lg font-bold transition-all duration-300 flex items-center justify-center ${
                      isCooling || isBusy
                        ? "bg-hitman-700 text-hitman-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-accent-red to-red-700 hover:from-red-600 hover:to-red-800 text-white transform hover:scale-105 hover:shadow-lg"
                    }`}
                  >
                    {isBusy ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        جاري التنفيذ...
                      </>
                    ) : isCooling ? (
                      <>
                        <Clock className="w-5 h-5 mr-2" />
                        انتظر {formatCooldown(cooldownLeft)}
                      </>
                    ) : (
                      <>
                        <Target className="w-5 h-5 mr-2 group-hover:rotate-45 transition-transform" />
                        تنفيذ المهمة
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Professional Tips */}
        <div className="mt-12 bg-gradient-to-r from-accent-red/10 to-accent-orange/10 border border-accent-red/20 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center mb-4">
            <Shield className="w-6 h-6 text-accent-red mr-3" />
            <h3 className="text-xl font-bold text-white">نصائح احترافية</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start">
              <Award className="w-5 h-5 text-accent-yellow mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">اختر بحكمة</p>
                <p className="text-hitman-300">
                  المهام عالية المخاطر تعطي مكافآت أكبر
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Clock className="w-5 h-5 text-accent-blue mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">إدارة الوقت</p>
                <p className="text-hitman-300">استخدم فترات التبريد للتخطيط</p>
              </div>
            </div>
            <div className="flex items-start">
              <TrendingUp className="w-5 h-5 text-accent-green mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">تطوير المهارات</p>
                <p className="text-hitman-300">المستوى الأعلى يفتح مهام أفضل</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={modal.isOpen}
        onClose={handleModalClose}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
}
