// src/features/auth/Signup.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';

export default function Signup() {
  const [form, setForm] = useState({ username: '', nickname: '', email: '', age: '', password: '' });
  const [loading, setLoading] = useState(false);

  const { setToken } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post('/api/signup', {
        username: form.username.trim(),
        nickname: form.nickname.trim(),
        email:    form.email.trim(),
        age:      Number(form.age),
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-xl shadow space-y-4">
        <h1 className="text-2xl font-semibold text-center">إنشاء حساب</h1>

        <input
          className="w-full border rounded px-3 py-2"
          placeholder="اسم المستخدم*"
          name="username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="الكنية (اختياري)"
          name="nickname"
          value={form.nickname}
          onChange={handleChange}
        />
        <input
          type="email"
          className="w-full border rounded px-3 py-2"
          placeholder="البريد الإلكتروني*"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          className="w-full border rounded px-3 py-2"
          placeholder="العمر*"
          name="age"
          value={form.age}
          onChange={handleChange}
          required
          min={13}
        />
        <input
          type="password"
          className="w-full border rounded px-3 py-2"
          placeholder="كلمة المرور*"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? 'جارٍ الإنشاء…' : 'إنشاء الحساب'}
        </button>

        <p className="text-center text-sm">
          لديك حساب بالفعل؟
          <Link to="/login" className="text-green-600 hover:underline ml-1">
            تسجيل الدخول
          </Link>
        </p>
      </form>
    </div>
  );
}
