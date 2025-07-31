import { useState } from "react";
import { Eye, EyeOff, User, Lock, Mail, Calendar, UserCheck } from "lucide-react";
import axios from "axios";
import { extractErrorMessage } from "@/utils/errorHandler";

export default function GuestSyncModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: 18,
    gender: "male"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "اسم المستخدم مطلوب";
    } else if (formData.username.length < 3) {
      newErrors.username = "اسم المستخدم يجب أن يكون 3 أحرف على الأقل";
    }

    if (!formData.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
    }

    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else if (formData.password.length < 6) {
      newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "كلمة المرور غير متطابقة";
    }

    if (formData.age < 13 || formData.age > 120) {
      newErrors.age = "العمر يجب أن يكون بين 13 و 120";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/sync-guest", {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        age: parseInt(formData.age),
        gender: formData.gender
      });

      // Update token in localStorage
      localStorage.setItem('token', data.token);
      
      onSuccess(data.token);
      onClose();
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-md w-full p-6 animate-slide-up">
        <div className="flex items-center justify-center mb-6">
          <UserCheck className="w-8 h-8 text-accent-red mr-3" />
          <h2 className="text-2xl font-semibold text-white">
            ربط الحساب الضيف
          </h2>
        </div>

        <p className="text-gray-300 text-center mb-6">
          قم بإنشاء حساب دائم لحفظ تقدمك في اللعبة
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="form-label">
              <User className="w-4 h-4 ml-2" />
              اسم المستخدم
            </label>
            <input
              type="text"
              name="username"
              className="form-input"
              placeholder="أدخل اسم المستخدم"
              value={formData.username}
              onChange={handleInputChange}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="form-label">
              <Mail className="w-4 h-4 ml-2" />
              البريد الإلكتروني
            </label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="أدخل البريد الإلكتروني"
              value={formData.email}
              onChange={handleInputChange}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="form-label">
              <Lock className="w-4 h-4 ml-2" />
              كلمة المرور
            </label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-input-with-button"
                placeholder="أدخل كلمة المرور"
                value={formData.password}
                onChange={handleInputChange}
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
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="form-label">
              <Lock className="w-4 h-4 ml-2" />
              تأكيد كلمة المرور
            </label>
            <div className="input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className="form-input-with-button"
                placeholder="أعد إدخال كلمة المرور"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
              <div className="input-border"></div>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Age and Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">
                <Calendar className="w-4 h-4 ml-2" />
                العمر
              </label>
              <input
                type="number"
                name="age"
                className="form-input"
                placeholder="العمر"
                value={formData.age}
                onChange={handleInputChange}
                min="13"
                max="120"
              />
              {errors.age && (
                <p className="text-red-500 text-sm mt-1">{errors.age}</p>
              )}
            </div>

            <div>
              <label className="form-label">
                الجنس
              </label>
              <select
                name="gender"
                className="form-input"
                value={formData.gender}
                onChange={handleInputChange}
              >
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 space-x-reverse mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-600 rounded-lg text-white bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-accent-red hover:bg-red-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="submit-spinner"></div>
                  <span className="mr-2">جاري الربط…</span>
                </div>
              ) : (
                "ربط الحساب"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 