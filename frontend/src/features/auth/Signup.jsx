// src/features/auth/Signup.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
  });
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info" });

  const { setToken, isAuthed, tokenLoaded, validating } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (tokenLoaded && !validating && isAuthed) navigate("/dashboard");
  }, [isAuthed, tokenLoaded, validating, navigate]);

  if (!tokenLoaded || validating) {
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
  if (isAuthed) return null;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Frontend validation using the new utility
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

    setLoading(true);
    try {
      const { data } = await axios.post("/api/signup", {
        username: form.username.trim(),
        email: form.email.trim(),
        age: Number(form.age),
        gender: form.gender,
        password: form.password,
      });
      
      setToken(data.token);
      setModal({
        isOpen: true,
        title: "تم إنشاء الحساب",
        message: "تم إنشاء الحساب بنجاح",
        type: "success"
      });
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error(err);
      const errorMessage = extractErrorMessage(err);
      setModal({
        isOpen: true,
        title: "فشل التسجيل",
        message: errorMessage,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="hitman-background"></div>
        <div className="background-grid"></div>
        <div className="blood-veins"></div>
        <div className="floating-particles"></div>
        <div className="dynamic-smoke"></div>
        <div className="electric-field"></div>
        <div className="scan-lines"></div>
        <div className="city-silhouette"></div>
        <div className="moving-shadows"></div>
      </div>

      {/* Red accent lines */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-red to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-red to-transparent"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Logo/Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="relative inline-block">
              <h1 className="text-5xl font-bouya mb-4 text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-red-400 to-accent-red animate-glow leading-tight">
                عقد الدم
              </h1>
              <div className="absolute -top-2 -right-2">
                <Target className="w-6 h-6 text-accent-red animate-pulse" />
              </div>
            </div>
            <p className="text-gray-300 text-lg tracking-wide">
              انضم للعبة المتصفح الاستراتيجية
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-accent-red to-transparent mx-auto mt-4"></div>
          </div>

          {/* Signup Form */}
          <div className="login-card animate-slide-up">
            <div className="login-card-inner">
              {/* Card header */}
              <div className="flex items-center justify-center mb-8">
                <UserPlus className="w-8 h-8 text-accent-red mr-3" />
                <h2 className="text-2xl font-semibold text-white">
                  إنشاء حساب جديد
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username field */}
                <div className="form-group">
                  <label className="form-label">
                    <User className="w-4 h-4 ml-2" />
                    اسم المستخدم *
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="أدخل اسم المستخدم"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      required
                      autoComplete="username"
                      minLength={3}
                    />
                    <div className="input-border"></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    يمكن استخدام الأحرف والأرقام والنقاط والشرطات والشرطات السفلية
                  </div>
                </div>

                {/* Email field */}
                <div className="form-group">
                  <label className="form-label">
                    <Mail className="w-4 h-4 ml-2" />
                    البريد الإلكتروني *
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      className="form-input"
                      placeholder="أدخل البريد الإلكتروني"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                    />
                    <div className="input-border"></div>
                  </div>
                </div>

                {/* Age field */}
                <div className="form-group">
                  <label className="form-label">
                    <Calendar className="w-4 h-4 ml-2" />
                    العمر *
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      className="form-input"
                      placeholder="أدخل عمرك"
                      name="age"
                      value={form.age}
                      onChange={handleChange}
                      required
                      min={13}
                      max={100}
                    />
                    <div className="input-border"></div>
                  </div>
                </div>

                {/* Gender field */}
                <div className="form-group">
                  <label className="form-label">
                    <User className="w-4 h-4 ml-2" />
                    الجنس *
                  </label>
                  <div className="input-wrapper">
                    <select
                      className="form-input"
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="">اختر الجنس</option>
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </select>
                    <div className="input-border"></div>
                  </div>
                </div>

                {/* Password field */}
                <div className="form-group">
                  <label className="form-label">
                    <Lock className="w-4 h-4 ml-2" />
                    كلمة المرور *
                  </label>
                  <div className="input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-input-with-button"
                      placeholder="أدخل كلمة المرور"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <div className="input-border"></div>
                  </div>
                </div>

                {/* Terms and Privacy Policy checkboxes */}
                <div className="form-group mt-6">
                  <label className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={e => setAgreed(e.target.checked)}
                      required
                      className="accent-accent-red w-5 h-5 rounded focus:ring-2 focus:ring-accent-red"
                    />
                    <span className="text-sm text-gray-200">
                      أوافق على
                      <RouterLink to="/terms" className="text-accent-red underline mx-1" target="_blank">الشروط والأحكام</RouterLink>
                      و
                      <RouterLink to="/privacy-policy" className="text-accent-red underline mx-1" target="_blank">سياسة الخصوصية</RouterLink>
                    </span>
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading || !agreed}
                  className={`submit-button group ${(!agreed ? 'opacity-60 cursor-not-allowed' : '')}`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="submit-spinner"></div>
                      <span className="mr-3">جاري الإنشاء…</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Target className="w-5 h-5 ml-3 group-hover:rotate-45 transition-transform duration-300" />
                      <span>إنشاء الحساب</span>
                    </div>
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-900 text-gray-400">أو</span>
                  </div>
                </div>

                {/* Google Sign Up Button */}
                <button
                  type="button"
                  onClick={() => {
                    // Check if Google OAuth is available
                    fetch('/api/auth/google')
                      .then(response => {
                        if (response.ok) {
                          window.location.href = '/api/auth/google';
                        } else {
                          setModal({
                            isOpen: true,
                            title: "غير متاح",
                            message: "إنشاء حساب بحساب جوجل غير متاح حالياً. يرجى استخدام النموذج أعلاه.",
                            type: "info"
                          });
                        }
                      })
                      .catch(() => {
                        setModal({
                          isOpen: true,
                          title: "خطأ في الاتصال",
                          message: "لا يمكن الاتصال بالخادم. يرجى المحاولة لاحقاً.",
                          type: "error"
                        });
                      });
                  }}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-600 rounded-lg text-white bg-gray-800 hover:bg-gray-700 transition-colors duration-200 group"
                >
                  <svg className="w-5 h-5 ml-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>إنشاء حساب بحساب جوجل</span>
                </button>
              </form>

              {/* Login link */}
              <div className="mt-8 text-center">
                <div className="divider"></div>
                <div className="text-sm text-gray-400 mt-6">
                  لديك حساب بالفعل؟
                  <Link className="signup-link group" to="/login">
                    <span>تسجيل الدخول</span>
                    <div className="link-underline"></div>
                  </Link>
                </div>
              </div>

              {/* Terms notice */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 leading-relaxed">
                  بإنشاء حساب، فإنك توافق على شروط الخدمة
                  <br />
                  وسياسة الخصوصية الخاصة بنا
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 animate-fade-in-delayed">
            <p className="text-xs text-gray-500">
              © 2024 عقد الدم. جميع الحقوق محفوظة.
            </p>
          </div>
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
