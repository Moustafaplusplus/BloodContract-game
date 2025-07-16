// src/features/auth/Login.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, User, Lock, Target, Shield } from "lucide-react";
import Modal from "@/components/Modal";
import { extractErrorMessage } from "@/utils/errorHandler";

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
                عودة قاتل مأجور
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
              © 2024 هيتمان. جميع الحقوق محفوظة.
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
