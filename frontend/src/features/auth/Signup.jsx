// src/features/auth/Signup.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';

export default function Signup() {
  const [form, setForm] = useState({ username: '', nickname: '', email: '', age: '', password: '' });
  const [loading, setLoading] = useState(false);

  const { setToken, isAuthed, tokenLoaded, validating } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (tokenLoaded && !validating && isAuthed) navigate('/');
  }, [isAuthed, tokenLoaded, validating, navigate]);

  if (!tokenLoaded || validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
          <p className="text-white">جاري التحقق من الجلسة…</p>
        </div>
      </div>
    );
  }
  if (isAuthed) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation
    if (!form.username.trim() || !form.email.trim() || !form.password || !form.age) {
      toast.error('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      toast.error('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }
    if (form.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    if (Number(form.age) < 13) {
      toast.error('العمر يجب أن يكون 13 سنة أو أكثر');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post('/api/signup', {
        username: form.username.trim(),
        nickname: form.nickname.trim(),
        email: form.email.trim(),
        age: Number(form.age),
        password: form.password,
      });
      setToken(data.token);
      toast.success('تم إنشاء الحساب بنجاح');
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'فشل التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#ff2222', letterSpacing: 2 }}>هيتمان</h1>
          <p className="text-white">لعبة المتصفح</p>
        </div>
        {/* Signup Form */}
        <div className="rounded-lg shadow-lg p-8 bg-zinc-900 border border-red-700">
          <h2 className="text-2xl font-semibold text-center mb-6 text-white">إنشاء حساب</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-white">اسم المستخدم *</label>
              <input
                className="input-field bg-black border border-red-700 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500"
                placeholder="أدخل اسم المستخدم"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                autoComplete="username"
                minLength={3}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-white">الكنية (اختياري)</label>
              <input
                className="input-field bg-black border border-red-700 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500"
                placeholder="أدخل الكنية"
                name="nickname"
                value={form.nickname}
                onChange={handleChange}
                autoComplete="nickname"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-white">البريد الإلكتروني *</label>
              <input
                type="email"
                className="input-field bg-black border border-red-700 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500"
                placeholder="أدخل البريد الإلكتروني"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-white">العمر *</label>
              <input
                type="number"
                className="input-field bg-black border border-red-700 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500"
                placeholder="أدخل عمرك"
                name="age"
                value={form.age}
                onChange={handleChange}
                required
                min={13}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-white">كلمة المرور *</label>
              <input
                type="password"
                className="input-field bg-black border border-red-700 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500"
                placeholder="أدخل كلمة المرور"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded bg-red-700 hover:bg-red-800 text-white font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  جارٍ الإنشاء…
                </div>
              ) : (
                'إنشاء الحساب'
              )}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-300">
              لديك حساب بالفعل؟
              <Link to="/login" className="text-red-400 hover:underline mr-1">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">© 2024 هيتمان. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </div>
  );
}
