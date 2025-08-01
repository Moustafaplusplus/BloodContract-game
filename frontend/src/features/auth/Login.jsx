// src/features/auth/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useBackgroundMusicContext } from "@/contexts/BackgroundMusicContext";
import { Eye, EyeOff, User, Lock, Target, Shield, UserCheck, Mail } from "lucide-react";
import Modal from "@/components/Modal";
import { extractErrorMessage } from "@/utils/errorHandler";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info" });

  const { user, loading: authLoading, signInWithGoogle, signInAsGuest, signInWithEmail } = useFirebaseAuth();
  const { play } = useBackgroundMusicContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) navigate("/dashboard");
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center">
          <div className="relative">
            <div className="loading-spinner"></div>
            <Target className="w-8 h-8 text-accent-red absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-white mt-6 text-lg font-medium">
            جاري التحقق من الجلسة…
          </p>
        </div>
      </div>
    );
  }
  if (user) return null;

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setModal({
        isOpen: true,
        title: "خطأ في الإدخال",
        message: "يرجى إدخال البريد الإلكتروني وكلمة المرور",
        type: "error"
      });
      return;
    }
    setLoading(true);
    try {
      const result = await signInWithEmail(email.trim(), password);
      if (result.success) {
        setModal({
          isOpen: true,
          title: "تم تسجيل الدخول",
          message: "تم تسجيل الدخول بنجاح",
          type: "success"
        });
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setModal({
          isOpen: true,
          title: "فشل تسجيل الدخول",
          message: result.error || "حدث خطأ أثناء تسجيل الدخول",
          type: "error"
        });
      }
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setModal({
        isOpen: true,
        title: "فشل تسجيل الدخول",
        message: errorMessage,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        setModal({
          isOpen: true,
          title: "تم تسجيل الدخول",
          message: "تم تسجيل الدخول بنجاح",
          type: "success"
        });
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setModal({
          isOpen: true,
          title: "فشل تسجيل الدخول",
          message: result.error || "حدث خطأ أثناء تسجيل الدخول",
          type: "error"
        });
      }
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setModal({
        isOpen: true,
        title: "فشل تسجيل الدخول",
        message: errorMessage,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    try {
      const result = await signInAsGuest();
      if (result.success) {
        setModal({
          isOpen: true,
          title: "تم تسجيل الدخول كضيف",
          message: "تم إنشاء حساب ضيف بنجاح. يمكنك التسجيل لاحقاً لحفظ تقدمك",
          type: "success"
        });
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setModal({
          isOpen: true,
          title: "فشل تسجيل الدخول كضيف",
          message: result.error || "حدث خطأ أثناء تسجيل الدخول كضيف",
          type: "error"
        });
      }
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setModal({
        isOpen: true,
        title: "فشل تسجيل الدخول كضيف",
        message: errorMessage,
        type: "error"
      });
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Shield className="w-16 h-16 text-accent-red" />
              <UserCheck className="w-8 h-8 text-white absolute -bottom-2 -right-2" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">تسجيل الدخول</h1>
          <p className="text-gray-400">مرحباً بك في عالم الدم والعقود</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline ml-2" />
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-red focus:border-transparent"
                placeholder="أدخل البريد الإلكتروني"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Lock className="w-4 h-4 inline ml-2" />
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-red focus:border-transparent pr-12"
                  placeholder="أدخل كلمة المرور"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-red text-white font-semibold py-3 px-4 rounded-xl mb-4 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <User className="w-5 h-5" />
                  تسجيل الدخول
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900/50 text-gray-400">أو</span>
            </div>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-gray-900 font-semibold py-3 px-4 rounded-xl mb-4 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                تسجيل الدخول بـ Google
              </>
            )}
          </button>

          {/* Guest Login Button */}
          <button
            onClick={handleGuestLogin}
            disabled={guestLoading}
            className="w-full bg-gray-700 text-white font-semibold py-3 px-4 rounded-xl mb-4 hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {guestLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <User className="w-5 h-5" />
                تسجيل الدخول كضيف
              </>
            )}
          </button>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-gray-400">
              ليس لديك حساب؟{" "}
              <Link to="/signup" className="text-accent-red hover:text-red-400 transition-colors">
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            بتسجيل الدخول، أنت توافق على{" "}
            <Link to="/terms" className="text-accent-red hover:text-red-400">
              الشروط والأحكام
            </Link>{" "}
            و{" "}
            <Link to="/privacy" className="text-accent-red hover:text-red-400">
              سياسة الخصوصية
            </Link>
          </p>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
}
