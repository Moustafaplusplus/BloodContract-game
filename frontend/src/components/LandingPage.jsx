import { Link, Navigate } from "react-router-dom";
import { Target, Shield, Sword, Crown, Users, Zap, Play, Star, Award } from "lucide-react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

export default function LandingPage() {
  const { user, loading } = useFirebaseAuth();

  // If authenticated, redirect to dashboard
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen hitman-gradient overflow-hidden relative safe-area-top safe-area-bottom">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Desktop background */}
        <div
          className="hidden sm:block absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{
            backgroundImage: `url('/Landing_desktop.png')`,
          }}
        />
        {/* Mobile background */}
        <div
          className="block sm:hidden absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{
            backgroundImage: `url('/Landing_mobile.png')`,
          }}
        />

        {/* Enhanced overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

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

      {/* Accent Lines */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse"></div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4 safe-area-left safe-area-right">
          <div className="text-center max-w-4xl mx-auto">
            
            {/* Enhanced Game Logo/Title */}
            <div className="mb-8 animate-fade-in">
              <div className="relative inline-block">
                <div className="card-3d bg-black/30 border-red-500/50 p-8 mb-6">
                  <h1 className="text-4xl md:text-6xl lg:text-8xl font-bouya text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-red-500 animate-glow leading-tight">
                    عقد الدم
                  </h1>
                  
                  {/* Floating icons */}
                  <div className="absolute -top-6 -right-6">
                    <div className="card-3d bg-red-500/20 border-red-500/30 p-3">
                      <Target className="w-6 h-6 md:w-8 md:h-8 text-red-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -left-6">
                    <div className="card-3d bg-red-500/20 border-red-500/30 p-2">
                      <Sword className="w-4 h-4 md:w-6 md:h-6 text-red-400/70 animate-float" />
                    </div>
                  </div>
                </div>

                {/* Enhanced taglines */}
                <div className="card-3d bg-black/40 border-white/20 p-6 mb-6">
                  <p className="text-lg md:text-2xl lg:text-3xl text-white mb-3 font-bold animate-fade-in-delayed">
                    اصبح أخطر قاتل محترف في العالم
                  </p>
                  <p className="text-sm md:text-lg lg:text-xl text-gray-300 animate-fade-in-delayed">
                    لعبة المتصفح الاستراتيجية الأكثر إثارة
                  </p>
                </div>

                <div className="w-48 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto mb-8"></div>
              </div>
            </div>

            {/* Enhanced feature highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-slide-up">
              {[
                { icon: Crown, label: "كن الزعيم", color: "yellow" },
                { icon: Users, label: "انضم للعصابات", color: "blue" },
                { icon: Zap, label: "معارك مثيرة", color: "orange" },
                { icon: Shield, label: "استراتيجية محكمة", color: "green" }
              ].map((feature, index) => (
                <div key={index} className="card-3d text-center p-4 group hover:scale-105 transition-transform duration-300">
                  <div className={`card-3d bg-${feature.color}-500/20 border-${feature.color}-500/30 p-3 inline-block mb-2 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                  </div>
                  <p className="text-sm text-gray-300 font-medium">{feature.label}</p>
                </div>
              ))}
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 animate-slide-up">
              <Link
                to="/signup"
                className="btn-3d group w-full sm:w-auto text-center"
              >
                <span className="flex items-center justify-center gap-2">
                  <Target className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
                  ابدأ رحلتك الآن
                </span>
              </Link>

              <Link
                to="/login"
                className="btn-3d-secondary group w-full sm:w-auto text-center"
              >
                <span className="flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  تسجيل الدخول
                </span>
              </Link>

              <Link
                to="/intro"
                className="btn-3d group w-full sm:w-auto text-center bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400"
              >
                <span className="flex items-center justify-center gap-2">
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  شاهد القصة
                </span>
              </Link>
            </div>

            {/* Enhanced game stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-delayed">
              {[
                { value: "1000+", label: "لاعب نشط", icon: Users, color: "blue" },
                { value: "24/7", label: "متاح دائماً", icon: Star, color: "yellow" },
                { value: "100%", label: "مجاني تماماً", icon: Award, color: "green" }
              ].map((stat, index) => (
                <div key={index} className="card-3d text-center p-6 group hover:scale-105 transition-transform duration-300">
                  <div className={`card-3d bg-${stat.color}-500/20 border-${stat.color}-500/30 p-3 inline-block mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                  </div>
                  <div className={`text-2xl md:text-3xl font-bold text-${stat.color}-400 mb-2 animate-glow`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="text-center py-6 animate-fade-in-delayed safe-area-bottom">
          <div className="card-3d bg-black/40 border-white/10 p-4 max-w-md mx-auto">
            <p className="text-xs text-gray-500 mb-2">
              © 2024 عقد الدم. جميع الحقوق محفوظة.
            </p>
            <div className="flex justify-center space-x-4 space-x-reverse text-xs">
              <Link to="/privacy-policy" className="text-gray-400 hover:text-red-400 transition-colors">
                سياسة الخصوصية
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-red-400 transition-colors">
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
