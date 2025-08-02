// src/features/auth/Login.jsx - Enhanced Blood Contract Login
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useBackgroundMusicContext } from "@/contexts/BackgroundMusicContext";
import { Eye, EyeOff, User, Lock, Target, Shield, UserCheck, Mail, Skull, LogIn, Chrome, Users } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center blood-gradient">
        <div className="text-center card-3d p-6">
          <div className="relative">
            <div className="loading-shimmer w-12 h-12 rounded-full mx-auto"></div>
            <Skull className="w-6 h-6 text-blood-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-white mt-4 text-sm font-medium animate-pulse">
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
        title: "خطأ في ال��دخال",
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
    <div className="min-h-screen flex items-center justify-center blood-gradient p-3 safe-area-top safe-area-bottom">
      <div className="w-full max-w-sm">
        {/* Enhanced Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="card-3d p-4 bg-gradient-to-br from-blood-950/60 to-black/40 border-blood-500/50">
                <div className="relative">
                  <Shield className="w-12 h-12 text-blood-400" />
                  <Skull className="w-6 h-6 text-white absolute -bottom-1 -right-1 bg-blood-600 p-1 rounded-full" />
                </div>
              </div>
            </div>
          </div>
          <h1 className="text-xl font-bold text-blood-400 mb-2 animate-glow-blood">عقد الدم</h1>
          <p className="text-xs text-white/60">ادخل إلى عالم الجريمة والعقود</p>
        </div>

        {/* Enhanced Login Form */}
        <div className="card-3d p-4 border-blood-500/30">
          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="mb-4">
            <div className="mb-3">
              <label className="block text-xs font-medium text-white/80 mb-2">
                <Mail className="w-3 h-3 inline ml-1" />
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-3d text-sm py-2.5"
                placeholder="أدخل البريد الإلكتروني"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-xs font-medium text-white/80 mb-2">
                <Lock className="w-3 h-3 inline ml-1" />
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-3d text-sm py-2.5 pr-10"
                  placeholder="أدخل كلمة المرور"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-3d w-full py-2.5 text-sm flex items-center justify-center gap-2 mb-4 hover:border-blood-500/60"
            >
              {loading ? (
                <div className="loading-shimmer w-4 h-4 rounded-full"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  تسجيل الدخول
                </>
              )}
            </button>
          </form>

          {/* Enhanced Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-black/60 text-white/50">أو</span>
            </div>
          </div>

          {/* Enhanced Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn-3d-secondary w-full py-2.5 text-sm flex items-center justify-center gap-2 mb-3 hover:border-blue-500/40 bg-white/5"
          >
            {loading ? (
              <div className="loading-shimmer w-4 h-4 rounded-full"></div>
            ) : (
              <>
                <Chrome className="w-4 h-4 text-blue-400" />
                <span className="text-white">Google</span>
              </>
            )}
          </button>

          {/* Enhanced Guest Login Button */}
          <button
            onClick={handleGuestLogin}
            disabled={guestLoading}
            className="btn-3d-secondary w-full py-2.5 text-sm flex items-center justify-center gap-2 mb-4 hover:border-yellow-500/40 bg-yellow-500/5"
          >
            {guestLoading ? (
              <div className="loading-shimmer w-4 h-4 rounded-full"></div>
            ) : (
              <>
                <Users className="w-4 h-4 text-yellow-400" />
                <span className="text-white">دخول كضيف</span>
              </>
            )}
          </button>

          {/* Enhanced Sign Up Link */}
          <div className="text-center mt-4">
            <p className="text-xs text-white/60">
              ليس لديك حساب؟{" "}
              <Link to="/signup" className="text-blood-400 hover:text-blood-300 transition-colors font-medium">
                إنشاء حساب
              </Link>
            </p>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-white/40">
            بتسجيل الدخول، أنت توافق على{" "}
            <Link to="/terms" className="text-blood-400 hover:text-blood-300 transition-colors">
              الشروط
            </Link>{" "}
            و{" "}
            <Link to="/privacy" className="text-blood-400 hover:text-blood-300 transition-colors">
              الخصوصية
            </Link>
          </p>
          
          {/* Blood Contract branding */}
          <div className="mt-4 flex items-center justify-center gap-2 text-blood-500/60">
            <Target className="w-3 h-3" />
            <span className="text-xs">Blood Contract Game</span>
            <Target className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Enhanced Modal */}
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
