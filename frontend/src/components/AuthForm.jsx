import { useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function AuthForm() {
  const location = useLocation();
  const isRegister = location.pathname.includes('register');

  const [form, setForm] = useState({
    username: '',
    email: '',
    age: '',
    password: '',
    confirmPassword: '',
    agree: false,
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegister ? 'signup' : 'login';
    const payload = isRegister
      ? form
      : { username: form.username, password: form.password };
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      const res = await fetch(`${API_BASE}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setMessage(data.message || data.error || 'تم!');

      if (data.token) {
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setMessage('خطأ في الاتصال بالسيرفر');
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4"
      style={{ backgroundImage: "url('/hitman-hideout.png')" }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-black bg-opacity-60 p-6 md:p-10 rounded-2xl shadow-xl backdrop-blur-md w-full max-w-md text-white rtl text-right space-y-4 border border-red-700"
      >
        <h2 className="text-3xl md:text-4xl text-red-600 font-bold text-center mb-4">
          {isRegister ? 'تسجيل حساب جديد' : 'تسجيل دخول'}
        </h2>

        <input
          name="username"
          placeholder="اسم المستخدم"
          value={form.username}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
        />

        {isRegister && (
          <>
            <input
              name="email"
              placeholder="البريد الإلكتروني"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <input
              name="age"
              placeholder="السن"
              type="number"
              value={form.age}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <input
              name="password"
              placeholder="كلمة المرور"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <input
              name="confirmPassword"
              placeholder="تأكيد كلمة المرور"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <label className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="checkbox"
                name="agree"
                checked={form.agree}
                onChange={handleChange}
                className="accent-red-600"
              />
              <span className="text-sm">أوافق على الشروط والأحكام</span>
            </label>
          </>
        )}

        {!isRegister && (
          <input
            name="password"
            placeholder="كلمة المرور"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        )}

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 transition-colors p-3 rounded-lg text-white font-semibold"
        >
          {isRegister ? 'تسجيل' : 'دخول'}
        </button>

        {message && <p className="text-center text-sm text-red-400">{message}</p>}
      </form>
    </div>
  );
}
