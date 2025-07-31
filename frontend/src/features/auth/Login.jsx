// src/features/auth/Login.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, User, Lock, Target, Shield } from "lucide-react";
import Modal from "@/components/Modal";
import { extractErrorMessage } from "@/utils/errorHandler";
import { jwtDecode } from "jwt-decode";
import { initiateGoogleOAuth } from '@/utils/testGoogleOAuth';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e) => {
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
      const { data } = await axios.post("/api/login", {
        email: email.trim(),
        password,
      });
      setToken(data.token);
      // Remove userId from localStorage since we get it from JWT token
      localStorage.removeItem('userId');
      setModal({
        isOpen: true,
        title: "تم تسجيل الدخول",
        message: "تم تسجيل الدخول بنجاح",
        type: "success"
      });
      setTimeout(() => navigate("/dashboard"), 1500);
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
        <div className="w-full max-w-md">
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
              لعبة المتصفح الاستراتيجية
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-accent-red to-transparent mx-auto mt-4"></div>
          </div>

          {/* Login Form */}
          <div className="login-card animate-slide-up">
            <div className="login-card-inner">
              {/* Card header */}
              <div className="flex items-center justify-center mb-8">
                <Shield className="w-8 h-8 text-accent-red mr-3" />
                <h2 className="text-2xl font-semibold text-white">
                  تسجيل الدخول
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email field */}
                <div className="form-group">
                  <label className="form-label">
                    <User className="w-4 h-4 ml-2" />
                    البريد الإلكتروني
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      className="form-input"
                      placeholder="أدخل البريد الإلكتروني"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                    <div className="input-border"></div>
                  </div>
                </div>

                {/* Password field */}
                <div className="form-group">
                  <label className="form-label">
                    <Lock className="w-4 h-4 ml-2" />
                    كلمة المرور
                  </label>
                  <div className="input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-input-with-button"
                      placeholder="أدخل كلمة المرور"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
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

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="submit-button group"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="submit-spinner"></div>
                      <span className="mr-3">جاري الدخول…</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Target className="w-5 h-5 ml-3 group-hover:rotate-45 transition-transform duration-300" />
                      <span>دخول</span>
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

                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={() => {
                    initiateGoogleOAuth(setToken, setModal);
                  }}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-600 rounded-lg text-white bg-gray-800 hover:bg-gray-700 transition-colors duration-200 group"
                >
                  <svg className="w-5 h-5 ml-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>تسجيل الدخول بحساب جوجل</span>
                </button>
              </form>

              {/* Signup link */}
              <div className="mt-8 text-center">
                <div className="divider"></div>
                <div className="text-sm text-gray-400 mt-6">
                  ليس لديك حساب؟
                  <Link className="signup-link group" to="/signup">
                    <span>إنشاء حساب</span>
                    <div className="link-underline"></div>
                  </Link>
                </div>
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
