// src/features/auth/Signup.jsx - Enhanced Blood Contract Signup
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useBackgroundMusicContext } from "@/contexts/BackgroundMusicContext";
import Modal from "@/components/Modal";
import { extractErrorMessage, validateForm, validationRules } from "@/utils/errorHandler";
import {
  Eye,
  EyeOff,
  User,
  Lock,
  Mail,
  Calendar,
  Target,
  UserPlus,
  Shield,
  Skull,
  Chrome,
  CheckCircle,
  Users
} from "lucide-react";

export default function Signup() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    age: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info" });

  const { user, loading: authLoading, signInWithGoogle, signUpWithEmail } = useFirebaseAuth();
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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    
    // Frontend validation
    const validationErrors = validateForm(form, {
      username: validationRules.username,
      email: validationRules.email,
      password: validationRules.password,
      age: validationRules.age,
      gender: validationRules.gender
    });

    if (validationErrors.length > 0) {
      setModal({
        isOpen: true,
        title: "خطأ في الإدخال",
        message: validationErrors.join('\n'),
        type: "error"
      });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setModal({
        isOpen: true,
        title: "خطأ في الإدخال",
        message: "كلمات المرور غير متطابقة",
        type: "error"
      });
      return;
    }

    if (!agreed) {
      setModal({
        isOpen: true,
        title: "خطأ في الإدخال",
        message: "يجب الموافقة على الشروط والأحكام",
        type: "error"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await signUpWithEmail(form.email.trim(), form.password, {
        username: form.username.trim(),
        age: Number(form.age),
        gender: form.gender,
        avatarUrl: null
      });
      
      if (result.success) {
        setModal({
          isOpen: true,
          title: "تم إنشاء الحساب",
          message: "تم إنشاء الحساب بنجاح",
          type: "success"
        });
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setModal({
          isOpen: true,
          title: "فشل إنشاء الحساب",
          message: result.error || "حدث خطأ أثناء إنشاء الحساب",
          type: "error"
        });
      }
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setModal({
        isOpen: true,
        title: "فشل إنشاء الحساب",
        message: errorMessage,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        setModal({
          isOpen: true,
          title: "تم إنشاء الحساب",
          message: "تم إنشاء الحساب بنجاح باستخدام Google",
          type: "success"
        });
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setModal({
          isOpen: true,
          title: "فشل إنشاء الحساب",
          message: result.error || "حدث خطأ أثناء إنشاء الحساب",
          type: "error"
        });
      }
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setModal({
        isOpen: true,
        title: "فشل إنشاء الحساب",
        message: errorMessage,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center blood-gradient p-3 safe-area-top safe-area-bottom">
      <div className="w-full max-w-sm">
        {/* Enhanced Header */}
        <div className="text-center mb-4">
          <div className="flex justify-center mb-3">
            <div className="relative">
              <div className="card-3d p-3 bg-gradient-to-br from-blood-950/60 to-black/40 border-blood-500/50">
                <div className="relative">
                  <Shield className="w-10 h-10 text-blood-400" />
                  <UserPlus className="w-5 h-5 text-white absolute -bottom-1 -right-1 bg-blood-600 p-0.5 rounded-full" />
                </div>
              </div>
            </div>
          </div>
          <h1 className="text-lg font-bold text-blood-400 mb-1 animate-glow-blood">انضم لعقد الدم</h1>
          <p className="text-xs text-white/60">أنشئ حسابك في عالم الجريمة</p>
        </div>

        {/* Enhanced Signup Form */}
        <div className="card-3d p-4 border-blood-500/30">
          <form onSubmit={handleEmailSignup} className="mb-4">
            {/* Username */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-white/80 mb-1">
                <User className="w-3 h-3 inline ml-1" />
                اسم المستخدم *
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="input-3d text-sm py-2"
                placeholder="اسم المستخدم"
                required
                minLength={3}
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-white/80 mb-1">
                <Mail className="w-3 h-3 inline ml-1" />
                البريد الإلكتروني *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input-3d text-sm py-2"
                placeholder="البريد الإلكتروني"
                required
              />
            </div>

            {/* Age and Gender Row */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  <Calendar className="w-3 h-3 inline ml-1" />
                  العمر *
                </label>
                <input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  className="input-3d text-sm py-2"
                  placeholder="العمر"
                  required
                  min={13}
                  max={100}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  <Users className="w-3 h-3 inline ml-1" />
                  الجنس *
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="input-3d text-sm py-2"
                  required
                >
                  <option value="">اختر</option>
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-white/80 mb-1">
                <Lock className="w-3 h-3 inline ml-1" />
                كلمة المرور *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="input-3d text-sm py-2 pr-8"
                  placeholder="كلمة المرور"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-white/80 mb-1">
                <Lock className="w-3 h-3 inline ml-1" />
                تأكيد كلمة المرور *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="input-3d text-sm py-2 pr-8"
                  placeholder="أعد كلمة المرور"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Enhanced Terms Agreement */}
            <div className="flex items-start gap-2 mb-4">
              <input
                type="checkbox"
                id="agreed"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-3 w-3 text-blood-600 bg-black/40 border-white/20 rounded focus:ring-blood-500 focus:ring-1"
              />
              <label htmlFor="agreed" className="text-xs text-white/70">
                أوافق على{" "}
                <Link to="/terms" className="text-blood-400 hover:text-blood-300 transition-colors">
                  الشروط
                </Link>{" "}
                و{" "}
                <Link to="/privacy" className="text-blood-400 hover:text-blood-300 transition-colors">
                  الخصوصية
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !agreed}
              className="btn-3d w-full py-2.5 text-sm flex items-center justify-center gap-2 mb-3 hover:border-blood-500/60"
            >
              {loading ? (
                <div className="loading-shimmer w-4 h-4 rounded-full"></div>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  إنشاء الحساب
                </>
              )}
            </button>
          </form>

          {/* Enhanced Divider */}
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-black/60 text-white/50">أو</span>
            </div>
          </div>

          {/* Enhanced Google Signup Button */}
          <button
            onClick={handleGoogleSignup}
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

          {/* Enhanced Info Message */}
          <div className="text-center mb-3">
            <p className="text-xs text-white/50">
              يمكنك أيضاً{" "}
              <Link to="/login" className="text-blood-400 hover:text-blood-300 transition-colors">
                التسجيل كضيف
              </Link>
            </p>
          </div>

          {/* Enhanced Login Link */}
          <div className="text-center">
            <p className="text-xs text-white/60">
              لديك حساب؟{" "}
              <Link to="/login" className="text-blood-400 hover:text-blood-300 transition-colors font-medium">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="text-center mt-4">
          <p className="text-xs text-white/30">
            © 2024 عقد الدم. جميع الحقوق محفوظة.
          </p>
          
          {/* Blood Contract branding */}
          <div className="mt-2 flex items-center justify-center gap-2 text-blood-500/40">
            <Skull className="w-3 h-3" />
            <span className="text-xs">Blood Contract Game</span>
            <Skull className="w-3 h-3" />
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
