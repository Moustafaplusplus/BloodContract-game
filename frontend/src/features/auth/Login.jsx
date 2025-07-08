// src/features/auth/Login.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-toastify';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const { setToken } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/login', { username, password });
      setToken(data.token);
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-sm p-6 bg-white rounded-xl shadow-md space-y-4">
        <h1 className="text-2xl font-semibold text-center">تسجيل الدخول</h1>

        <div>
          <label className="block mb-1 text-sm font-medium">اسم المستخدم</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder="أدخل اسم المستخدم"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">كلمة المرور</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            placeholder="أدخل كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? 'جاري الدخول…' : 'دخول'}
        </button>

        <p className="text-center text-sm">
          ليس لديك حساب؟
          <Link className="text-blue-600 hover:underline ml-1" to="/signup">
            إنشاء حساب
          </Link>
        </p>
      </form>
    </div>
  );
}
