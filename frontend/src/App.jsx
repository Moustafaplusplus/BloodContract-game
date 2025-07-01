import { useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function App() {
  const location = useLocation();
  const isRegister = location.pathname.includes('register');

  const [form, setForm] = useState({
    username: '',
    nickname: '',
    email: '',
    age: '',
    password: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegister ? 'register' : 'login';

    const payload = isRegister
      ? form
      : { username: form.username, password: form.password };

    const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setMessage(data.message || data.error || 'تم!');
    if (data.token) {
      localStorage.setItem('token', data.token);
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

        {/* Common Fields */}
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
              name="nickname"
              placeholder="الاسم المستعار"
              value={form.nickname}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <input
              name="email"
              type="email"
              placeholder="البريد الإلكتروني"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <input
              name="age"
              type="number"
              placeholder="العمر"
              value={form.age}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </>
        )}

        <input
          name="password"
          type="password"
          placeholder="كلمة المرور"
          value={form.password}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
        />

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg font-bold text-white transition"
        >
          {isRegister ? 'تسجيل' : 'دخول'}
        </button>

        {message && (
          <div className="text-center text-sm text-red-400">{message}</div>
        )}
      </form>
    </div>
  );
}