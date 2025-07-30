import { Link, Navigate } from "react-router-dom";
import { Target, Shield, Sword, Crown, Users, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function LandingPage() {
  const { isAuthed, tokenLoaded } = useAuth();

  // If authenticated, redirect to dashboard
  if (tokenLoaded && isAuthed) {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Background Image */}
      {/* Desktop background */}
      <div
        className="hidden sm:block absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
        style={{
          backgroundImage: `url('/Landing_desktop.png')`,
        }}
      />
      {/* Mobile background */}
      <div
        className="block sm:hidden absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
        style={{
          backgroundImage: `url('/Landing_mobile.png')`,
        }}
      />

      {/* Light overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Simple animated background elements */}
      <div className="absolute inset-0">
        <div className="background-grid opacity-10"></div>
        <div className="floating-particles opacity-30"></div>
      </div>

      {/* Red accent lines */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-red to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-red to-transparent"></div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-4xl mx-auto">
            {/* Game Logo/Title */}
            <div className="mb-8 animate-fade-in">
              <div className="relative inline-block">
                <h1 className="text-6xl md:text-8xl font-bouya mb-6 text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-red-400 to-accent-red animate-glow leading-tight">
                  عقد الدم
                </h1>
                <div className="absolute -top-4 -right-4">
                  <Target className="w-8 h-8 md:w-12 md:h-12 text-accent-red animate-pulse" />
                </div>
                <div className="absolute -bottom-2 -left-4">
                  <Sword className="w-6 h-6 md:w-8 md:h-8 text-accent-red/70 animate-float" />
                </div>
              </div>

              {/* Exciting tagline */}
              <p className="text-xl md:text-3xl text-white mb-4 font-medium animate-fade-in-delayed">
                اصبح أخطر قاتل محترف في العالم
              </p>
              <p className="text-lg md:text-xl text-gray-300 mb-8 animate-fade-in-delayed">
                لعبة المتصفح الاستراتيجية الأكثر إثارة
              </p>

              <div className="w-48 h-1 bg-gradient-to-r from-transparent via-accent-red to-transparent mx-auto mb-12"></div>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 animate-slide-up">
              <div className="text-center">
                <Crown className="w-8 h-8 text-accent-red mx-auto mb-2" />
                <p className="text-sm text-gray-300">كن الزعيم</p>
              </div>
              <div className="text-center">
                <Users className="w-8 h-8 text-accent-red mx-auto mb-2" />
                <p className="text-sm text-gray-300">انضم للعصابات</p>
              </div>
              <div className="text-center">
                <Zap className="w-8 h-8 text-accent-red mx-auto mb-2" />
                <p className="text-sm text-gray-300">معارك مثيرة</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-accent-red mx-auto mb-2" />
                <p className="text-sm text-gray-300">استراتيجية محكمة</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
              <Link
                to="/signup"
                className="group relative overflow-hidden bg-gradient-to-r from-accent-red to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
              >
                <span className="relative z-10 flex items-center">
                  <Target className="w-5 h-5 ml-3 group-hover:rotate-45 transition-transform duration-300" />
                  ابدأ رحلتك الآن
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>

              <Link
                to="/login"
                className="group relative bg-transparent border-2 border-accent-red text-accent-red hover:bg-accent-red hover:text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center">
                  <Shield className="w-5 h-5 ml-3 group-hover:rotate-12 transition-transform duration-300" />
                  تسجيل الدخول
                </span>
              </Link>

              <Link
                to="/intro"
                className="group relative bg-transparent border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center">
                  <Zap className="w-5 h-5 ml-3 group-hover:rotate-12 transition-transform duration-300" />
                  شاهد القصة
                </span>
              </Link>
            </div>

            {/* Game stats or features */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-delayed">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-red mb-2">
                  1000+
                </div>
                <div className="text-gray-400">لاعب نشط</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-red mb-2">
                  24/7
                </div>
                <div className="text-gray-400">متاح دائماً</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-red mb-2">
                  100%
                </div>
                <div className="text-gray-400">مجاني تماماً</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 animate-fade-in-delayed">
          <p className="text-xs text-gray-500">
            © 2024 عقد الدم. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </div>
  );
}
