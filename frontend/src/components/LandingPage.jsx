import { Link, Navigate } from "react-router-dom";
import { Target, Shield, Sword, Crown, Users, Zap, Play, Star, Award, ImageIcon, Building2 } from "lucide-react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const { user, loading } = useFirebaseAuth();
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);

  // Add timeout for loading state
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        setShowTimeoutMessage(true);
      }, 5000); // Show timeout message after 5 seconds

      return () => clearTimeout(timeout);
    } else {
      setShowTimeoutMessage(false);
    }
  }, [loading]);

  // Show loading state while authentication is being determined
  if (loading) {
    return (
      <div className="min-h-screen blood-gradient text-white safe-area-top safe-area-bottom flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blood-500 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-2">عقد الدم</h2>
          <p className="text-white/70 mb-4">جاري التحقق من حالة الحساب...</p>
          {showTimeoutMessage && (
            <div className="text-sm text-white/50">
              <p>يبدو أن الاتصال بطيء</p>
              <p>يمكنك المحاولة مرة أخرى أو تحديث الصفحة</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Only redirect if we're certain the user is authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen blood-gradient text-white safe-area-top safe-area-bottom" dir="rtl">
      {/* Enhanced Header with Background Image */}
      <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90 mx-4 mt-4">
        {/* Background Image Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
          <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23dc2626\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
        </div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blood-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">عقد الدم</h1>
              <p className="text-xs sm:text-sm text-white/80 drop-shadow">Blood Contract Game</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-white">
            <div className="hidden sm:flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-white/60" />
              <Crown className="w-4 h-4 text-yellow-400 animate-pulse" />
            </div>
            <div className="text-right">
              <div className="text-lg sm:text-xl font-bold drop-shadow-lg">مرحباً</div>
              <div className="text-xs text-white/80 drop-shadow">Welcome</div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Animated grid background */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(220, 38, 38, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(220, 38, 38, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            animation: 'grid-move 20s linear infinite'
          }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-red-500/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${5 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col container mx-auto max-w-6xl p-4 space-y-6">
        
        {/* Enhanced Game Logo/Title */}
        <div className="text-center mb-8 animate-fade-in mt-8">
          <div className="card-3d p-8 mb-6">
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-bouya text-transparent bg-clip-text bg-gradient-to-r from-blood-500 via-blood-400 to-blood-500 animate-glow leading-tight mb-4">
              عقد الدم
            </h1>
            
            {/* Enhanced taglines */}
            <div className="space-y-3">
              <p className="text-lg md:text-2xl lg:text-3xl text-white font-bold animate-fade-in-delayed">
                اصبح أخطر قاتل محترف في العالم
              </p>
              <p className="text-sm md:text-lg lg:text-xl text-white/70">
                لعبة المتصفح الاستراتيجية الأكثر إثارة
              </p>
            </div>

            <div className="w-48 h-1 bg-gradient-to-r from-transparent via-blood-500 to-transparent mx-auto mt-6"></div>
          </div>
        </div>

        {/* Enhanced feature highlights */}
        <div className="card-3d p-6">
          <h2 className="text-lg font-bold text-blood-400 mb-4 flex items-center gap-2">
            <Sword className="w-5 h-5" />
            ميزات اللعبة
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Crown, label: "كن الزعيم", color: "yellow", bgGrad: "from-yellow-950/30 to-amber-950/20" },
              { icon: Users, label: "انضم للعصابات", color: "blue", bgGrad: "from-blue-950/30 to-cyan-950/20" },
              { icon: Zap, label: "معارك مثيرة", color: "orange", bgGrad: "from-orange-950/30 to-red-950/20" },
              { icon: Shield, label: "استراتيجية محكمة", color: "green", bgGrad: "from-green-950/30 to-emerald-950/20" }
            ].map((feature, index) => (
              <div key={index} className={`card-3d bg-gradient-to-br ${feature.bgGrad} border-${feature.color}-500/30 p-4 text-center group hover:border-${feature.color}-500/50 transition-colors duration-300`}>
                <div className={`p-3 rounded-lg bg-${feature.color}-500/20 border border-${feature.color}-500/40 inline-block mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                </div>
                <p className="text-sm text-white/90 font-medium">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="card-3d p-6">
          <h2 className="text-lg font-bold text-blood-400 mb-4 flex items-center gap-2">
            <Play className="w-5 h-5" />
            ابدأ الآن
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="btn-3d group flex-1 sm:flex-none text-center py-3"
            >
              <span className="flex items-center justify-center gap-2">
                <Target className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
                ابدأ رحلتك الآن
              </span>
            </Link>

            <Link
              to="/login"
              className="btn-3d-secondary group flex-1 sm:flex-none text-center py-3"
            >
              <span className="flex items-center justify-center gap-2">
                <Shield className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                تسجيل الدخول
              </span>
            </Link>

            <Link
              to="/intro"
              className="btn-3d group flex-1 sm:flex-none text-center py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400"
            >
              <span className="flex items-center justify-center gap-2">
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                شاهد القصة
              </span>
            </Link>
          </div>
        </div>

        {/* Enhanced game stats */}
        <div className="card-3d p-6">
          <h2 className="text-lg font-bold text-blood-400 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            إحصائيات اللعبة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: "1000+", label: "لاعب نشط", icon: Users, color: "blue", bgGrad: "from-blue-950/30 to-cyan-950/20" },
              { value: "24/7", label: "متاح دائماً", icon: Star, color: "yellow", bgGrad: "from-yellow-950/30 to-amber-950/20" },
              { value: "100%", label: "مجاني تماماً", icon: Award, color: "green", bgGrad: "from-green-950/30 to-emerald-950/20" }
            ].map((stat, index) => (
              <div key={index} className={`card-3d bg-gradient-to-br ${stat.bgGrad} border-${stat.color}-500/30 p-4 text-center group hover:border-${stat.color}-500/50 transition-colors duration-300`}>
                <div className={`p-3 rounded-lg bg-${stat.color}-500/20 border border-${stat.color}-500/40 inline-block mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
                <div className={`text-2xl md:text-3xl font-bold text-${stat.color}-400 mb-2`}>
                  {stat.value}
                </div>
                <div className="text-white/70 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="card-3d p-6 mt-8">
          <div className="text-center">
            <p className="text-sm text-white/50 mb-3">
              © 2024 عقد الدم. جميع الحقوق محفوظة.
            </p>
            <div className="flex justify-center space-x-4 space-x-reverse text-sm">
              <Link to="/privacy-policy" className="text-white/70 hover:text-blood-400 transition-colors">
                سياسة الخصوصية
              </Link>
              <Link to="/terms" className="text-white/70 hover:text-blood-400 transition-colors">
                الشروط والأحكام
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(40px, 40px); }
        }
      `}</style>
    </div>
  );
}
