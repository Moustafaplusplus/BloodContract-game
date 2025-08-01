// src/features/auth/Signup.jsx
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Shield className="w-16 h-16 text-accent-red" />
              <UserPlus className="w-8 h-8 text-white absolute -bottom-2 -right-2" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">إنشاء حساب جديد</h1>
          <p className="text-gray-400">انضم إلى عالم الدم والعقود</p>
        </div>

        {/* Signup Form */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignup} className="mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User className="w-4 h-4 inline ml-2" />
                اسم المستخدم *
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-red focus:border-transparent"
                placeholder="أدخل اسم المستخدم"
                required
                minLength={3}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline ml-2" />
                البريد الإلكتروني *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-red focus:border-transparent"
                placeholder="أدخل البريد الإلكتروني"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline ml-2" />
                العمر *
              </label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-red focus:border-transparent"
                placeholder="أدخل عمرك"
                required
                min={13}
                max={100}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User className="w-4 h-4 inline ml-2" />
                الجنس *
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-red focus:border-transparent"
                required
              >
                <option value="">اختر الجنس</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Lock className="w-4 h-4 inline ml-2" />
                كلمة المرور *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-red focus:border-transparent pr-12"
                  placeholder="أدخل كلمة المرور"
                  required
                  minLength={6}
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

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Lock className="w-4 h-4 inline ml-2" />
                تأكيد كلمة المرور *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-red focus:border-transparent pr-12"
                  placeholder="أعد إدخال كلمة المرور"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start space-x-3 space-x-reverse mb-6">
              <input
                type="checkbox"
                id="agreed"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 text-accent-red bg-gray-700 border-gray-600 rounded focus:ring-accent-red focus:ring-2"
              />
              <label htmlFor="agreed" className="text-sm text-gray-400">
                أوافق على{" "}
                <Link to="/terms" className="text-accent-red hover:text-red-400">
                  الشروط والأحكام
                </Link>{" "}
                و{" "}
                <Link to="/privacy" className="text-accent-red hover:text-red-400">
                  سياسة الخصوصية
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !agreed}
              className="w-full bg-accent-red text-white font-semibold py-3 px-4 rounded-xl mb-4 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  إنشاء الحساب
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

          {/* Google Signup Button */}
          <button
            onClick={handleGoogleSignup}
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
                إنشاء حساب بـ Google
              </>
            )}
          </button>

          {/* Info Message */}
          <div className="text-center mb-6">
            <p className="text-gray-400 text-sm">
              يمكنك أيضاً التسجيل كضيف من صفحة تسجيل الدخول
            </p>
          </div>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-gray-400">
              لديك حساب بالفعل؟{" "}
              <Link to="/login" className="text-accent-red hover:text-red-400 transition-colors">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            © 2024 عقد الدم. جميع الحقوق محفوظة.
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
